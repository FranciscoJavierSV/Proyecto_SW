document.addEventListener("DOMContentLoaded", () => {

    // ============================================================
    // MOSTRAR NOMBRE DEL USUARIO LOGUEADO
    // ============================================================
    const username = localStorage.getItem("username");
    const nombreSpan = document.querySelector(".usuario-nombre");

    if (username && nombreSpan) {
        nombreSpan.textContent = `Hola, ${username}`;
    }

    // ============================================================
    // REFERENCIAS AL PANEL DEL CARRITO
    // ============================================================
    const carritoIcon = document.getElementById("carrito-icon");   // Icono del carrito
    const panelCarrito = document.getElementById("panelCarrito");  // Panel lateral
    const cerrarBtn = document.getElementById("cerrarCarrito");    // Botón cerrar

    console.log("carritoIcon:", carritoIcon);
    console.log("panelCarrito:", panelCarrito);
    console.log("cerrarBtn:", cerrarBtn);

    // ============================================================
    // ABRIR PANEL DEL CARRITO
    // ============================================================
    if (carritoIcon && panelCarrito) {
        carritoIcon.addEventListener("click", (e) => {
            e.stopPropagation(); // Evita que el click cierre el panel
            console.log("🛒 Click en carrito detectado!");
            console.log("Right ANTES:", panelCarrito.style.right);

            // Mostrar panel
            panelCarrito.style.right = "0px";
            panelCarrito.style.display = "flex";

            console.log("Right DESPUÉS:", panelCarrito.style.right);

            cargarCarrito(); // Recargar contenido
        });
    }

    // ============================================================
    // CERRAR PANEL DEL CARRITO
    // ============================================================
    if (cerrarBtn) {
        cerrarBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            console.log("Cerrando carrito");
            panelCarrito.style.right = "-380px";
        });
    }

    // ============================================================
    // CERRAR PANEL SI SE HACE CLICK FUERA
    // ============================================================
    document.addEventListener("click", (e) => {
        if (panelCarrito && carritoIcon) {

            const clickDentroCarrito = panelCarrito.contains(e.target);
            const clickEnIcono = carritoIcon.contains(e.target);

            const estiloRight = window.getComputedStyle(panelCarrito).right;
            const carritoAbierto = estiloRight === "0px";

            // Si el click NO es dentro del panel NI en el icono → cerrar
            if (!clickDentroCarrito && !clickEnIcono && carritoAbierto) {
                panelCarrito.style.right = "-380px";
            }
        }
    });

    // ============================================================
    // ACTUALIZAR BADGE DEL CARRITO SI HAY TOKEN
    // ============================================================
    const token = localStorage.getItem("token");
    if (token) {
        actualizarBadgeCarrito();
    }

    // ============================================================
    // CARGAR PRODUCTOS EN LA TIENDA
    // ============================================================
    cargarProductos();

    // ============================================================
    // CERRAR SESIÓN
    // ============================================================
    const logoutBtn = document.querySelector(".logout-btn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (event) {
            event.preventDefault();

            // Limpiar preferencias de accesibilidad si existe la función
            if (typeof window.limpiarAccesibilidadAlCerrarSesion === 'function') {
                window.limpiarAccesibilidadAlCerrarSesion();
            }

            // Eliminar credenciales
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("refreshToken");

            // Redirigir al inicio
            window.location.href = "../index.html";
        });
    }
});


// ============================================================
// CARGAR PRODUCTOS EN LA TIENDA
// ============================================================
async function cargarProductos() {
    const grid = document.querySelector(".grid-productos");
    if (!grid) return;

    try {
        const data = await apiGet("/public/products");

        if (!data.success) {
            grid.innerHTML = "<p>Error al cargar productos.</p>";
            return;
        }

        // Obtener wishlist del usuario
        const wishlist = await obtenerWishlist();
        const wishlistIds = wishlist.map(item => item.producto_id);

        grid.innerHTML = "";

        // Renderizar cada producto
        data.products.forEach(prod => {
            const card = document.createElement("div");
            card.classList.add("producto");

            // Atributos para filtros
            card.dataset.categoria = prod.categoria || "";
            card.dataset.precio = prod.precio || 0;
            card.dataset.inventario = prod.inventario || 0;

            const tieneOferta = prod.ofertaP && prod.ofertaP > 0;
            const precioMostrar = tieneOferta ? prod.ofertaP : prod.precio;
            const sinStock = !prod.inventario || parseInt(prod.inventario) === 0;

            console.log(`Producto: ${prod.nombre}, Inventario: ${prod.inventario}, Sin stock: ${sinStock}`);

            // Precio con oferta
            let priceHtml = '';
            if (prod.ofertaP && prod.ofertaP !== null && prod.ofertaP !== '') {
                priceHtml = `
                    <div class="precio">
                        <span class="precio-original">$${parseFloat(prod.precio).toFixed(2)}</span>
                        <br>
                        <span class="precio-oferta">$${parseFloat(prod.ofertaP).toFixed(2)}</span>
                    </div>
                `;
            } else {
                priceHtml = `<div class="precio">$${parseFloat(prod.precio).toFixed(2)}</div>`;
            }

            // Wishlist
            const estaEnWishlistActual = wishlistIds.includes(prod.id);
            const iconoCorazon = estaEnWishlistActual ? '❤️' : '🤍';
            const claseActiva = estaEnWishlistActual ? 'active' : '';

            // Plantilla HTML del producto
            card.innerHTML = `
                ${tieneOferta ? '<span class="badge-oferta">¡OFERTA!</span>' : ''}
                ${sinStock ? '<span class="badge-sin-stock">Agotado</span>' : ''}

                <button class="btn-wishlist ${claseActiva}" data-id="${prod.id}" title="Agregar a lista de deseos">
                    ${iconoCorazon}
                </button>

                <img src="../ImagenesGenerales/${prod.imagen}" alt="${prod.nombre}">
                <h3>${prod.nombre}</h3>
                <p class="descripcion">${prod.descripcion || 'Sin descripción'}</p>
                <p class="precio">${precioMostrar} MXN</p>

                ${tieneOferta && !sinStock ? `<p class="precio-anterior">Antes: ${prod.precio} MXN</p>` : ''}

                <button class="btn-agregar" data-id="${prod.id}" ${sinStock ? 'disabled' : ''}>
                    ${sinStock ? 'No disponible' : 'Agregar al carrito'}
                </button>
            `;

            if (sinStock) {
                card.classList.add("sin-stock");
            }

            grid.appendChild(card);
        });

        // Activar botones del carrito si existen
        if (typeof activarBotonesCarrito === 'function') {
            activarBotonesCarrito();
        }

        // Activar wishlist
        activarBotonesWishlist();

    } catch (error) {
        console.error("Error al cargar productos:", error);
        grid.innerHTML = "<p>No se pudieron cargar los productos.</p>";
    }
}

async function actualizarBadgeCarrito() {
    // Obtiene el token del usuario; si no existe, no se actualiza el badge
    const token = localStorage.getItem("token");
    if (!token) return;

    const carritoCountElem = document.getElementById("carrito-count");
    
    try {
        // Solicita el carrito del usuario autenticado
        const data = await apiGet("/auth/cart", {
            Authorization: "Bearer " + token,
        });

        // Si la respuesta es válida, calcula la cantidad total de productos
        if (data.success && Array.isArray(data.cart)) {
            const cantidadTotal = data.cart.reduce((sum, item) => sum + item.cantidad, 0);
            carritoCountElem.textContent = cantidadTotal;
        }
    } catch (error) {
        console.error("Error actualizando badge:", error);
    }
}


function inicializarFiltros() {
    // Elementos del DOM para filtros
    const slider = document.getElementById('rangoPrecio');
    const precioMax = document.getElementById('precioMax');
    const checkboxesCat = document.querySelectorAll('input[name="categoria"]');
    const checkboxesOferta = document.querySelectorAll('input[name="oferta"]');
    const btnLimpiar = document.querySelector('.btn-limpiar-filtros');

    // Filtro por precio (slider)
    if (slider && precioMax) {
        slider.addEventListener('input', function() {
            precioMax.textContent = this.value;
            aplicarFiltros();
        });
    }

    // Filtro por categoría
    checkboxesCat.forEach(checkbox => {
        checkbox.addEventListener('change', aplicarFiltros);
    });

    // Filtro por oferta
    checkboxesOferta.forEach(checkbox => {
        checkbox.addEventListener('change', aplicarFiltros);
    });

    // Botón para limpiar filtros
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', limpiarFiltros);
    }
}


async function aplicarFiltros() {
  try {
    // Obtener valor del rango de precio
    const rangoInput = document.getElementById('rangoPrecio');
    const precioMaximo = rangoInput ? Number(rangoInput.value) : NaN;

    // Categorías seleccionadas
    const categoriasSeleccionadas = Array.from(
      document.querySelectorAll('input[name="categoria"]:checked')
    ).map(cb => cb.value);

    // Filtros de oferta
    const conOferta = !!document.getElementById('conOferta')?.checked;
    const sinOferta = !!document.getElementById('sinOferta')?.checked;

    // Construcción de parámetros para la API
    const base = '/public/products';
    const params = new URLSearchParams();

    if (!Number.isNaN(precioMaximo) && precioMaximo >= 0) {
      params.set('min', 0);
      params.set('max', precioMaximo);
    }

    if (categoriasSeleccionadas.length > 0) {
      params.set('categoria', categoriasSeleccionadas[0]);
    }

    if (conOferta && !sinOferta) params.set('oferta', 'si');
    else if (!conOferta && sinOferta) params.set('oferta', 'no');

    const url = params.toString() ? `${base}?${params.toString()}` : base;
    console.log('[aplicarFiltros] URL ->', url);

    // Solicitud a la API
    const res = await apiGet(url);
    console.log('[aplicarFiltros] respuesta ->', res);

    let productos = res.products || res.product || [];
    let resultado = productos.slice();

    // Filtro por precio
    if (!Number.isNaN(precioMaximo) && precioMaximo >= 0) {
      resultado = resultado.filter(p => {
        const tieneOferta = p.ofertaP && Number(p.ofertaP) > 0;
        const precioReal = tieneOferta ? Number(p.ofertaP) : Number(p.precio);
        return !Number.isNaN(precioReal) && precioReal <= precioMaximo;
      });
    }

    // Filtro por categoría
    if (categoriasSeleccionadas.length > 0) {
      resultado = resultado.filter(p => categoriasSeleccionadas.includes(p.categoria));
    }

    // Filtro por oferta
    if (conOferta && !sinOferta) {
      resultado = resultado.filter(p => p.ofertaP && Number(p.ofertaP) > 0);
    } else if (!conOferta && sinOferta) {
      resultado = resultado.filter(p => !p.ofertaP || p.ofertaP === '' || Number(p.ofertaP) === 0);
    }

    // Renderizar productos filtrados
    renderProductos(resultado);

  } catch (err) {
    console.error('Error en aplicar filtros: ', err);
    renderProductos([]);
  }
}


async function renderProductos(productos) {
    const contenedor = document.querySelector(".grid-productos");
    if (!contenedor) return;
    
    contenedor.innerHTML = "";

    // Si no hay productos
    if (!productos || productos.length === 0) {
        contenedor.innerHTML = "<p>No hay productos disponibles.</p>";
        return;
    }

    // Obtener wishlist del usuario
    const wishlist = await obtenerWishlist();
    const wishlistIds = wishlist.map(item => item.producto_id);

    // Renderizar cada producto
    productos.forEach(prod => {
        const card = document.createElement("div");
        card.classList.add("producto");
        card.dataset.categoria = prod.categoria || "";

        const tieneOferta = prod.ofertaP && prod.ofertaP > 0;
        const precioMostrar = tieneOferta ? prod.ofertaP : prod.precio;
        card.dataset.precio = precioMostrar;
        card.dataset.inventario = prod.inventario || 0;

        const sinStock = !prod.inventario || parseInt(prod.inventario) === 0;

        // Wishlist
        const estaEnWishlistActual = wishlistIds.includes(prod.id);
        const iconoCorazon = estaEnWishlistActual ? '❤️' : '🤍';
        const claseActiva = estaEnWishlistActual ? 'active' : '';

        card.innerHTML = `
            ${tieneOferta ? '<span class="badge-oferta">¡OFERTA!</span>' : ''}
            ${sinStock ? '<span class="badge-sin-stock">Agotado</span>' : ''}
            <button class="btn-wishlist ${claseActiva}" data-id="${prod.id}" title="Agregar a lista de deseos">
                ${iconoCorazon}
            </button>
            <img src="../ImagenesGenerales/${prod.imagen}" alt="${prod.nombre}">
            <h3>${prod.nombre}</h3>
            <p class="descripcion">${prod.descripcion || 'Sin descripción'}</p>
            <p class="precio">${precioMostrar} MXN</p>
            ${tieneOferta && !sinStock ? `<p class="precio-anterior">Antes: ${prod.precio} MXN</p>` : ''}
            <button class="btn-agregar" data-id="${prod.id}" ${sinStock ? 'disabled' : ''}>
                ${sinStock ? 'No disponible' : 'Agregar al carrito'}
            </button>
        `;

        if (sinStock) {
            card.classList.add("sin-stock");
        }

        contenedor.appendChild(card);
    });

    // Activar botones del carrito
    if (typeof activarBotonesCarrito === 'function') {
        activarBotonesCarrito();
    }

    // Activar wishlist
    activarBotonesWishlist();
}


function limpiarFiltros() {
    // Resetear slider
    document.getElementById('rangoPrecio').value = 100;
    document.getElementById('precioMax').textContent = '100';
    
    // Desmarcar checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Mostrar todos los productos
    document.querySelectorAll('.producto').forEach(producto => {
        producto.classList.remove('oculto');
    });

    // Recargar productos sin filtros
    cargarProductos();
}


function activarBotonesWishlist() {
    document.querySelectorAll('.btn-wishlist').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();

            const productoId = btn.dataset.id;
            const token = localStorage.getItem("token");

            // Si no hay sesión, mostrar alerta
            if (!token) {
                mostrarAlertaLogin();
                return;
            }

            // Obtener wishlist actual
            const wishlist = await obtenerWishlist();
            const ids = wishlist.map(item => item.producto_id);
            const yaEsta = ids.includes(Number(productoId));

            // Construir objeto producto solo si se va a agregar
            let producto = null;

            if (!yaEsta) {
                const productoCard = btn.closest('.producto');
                const nombre = productoCard.querySelector('h3').textContent;
                const descripcion = productoCard.querySelector('.descripcion').textContent;
                const imagen = productoCard.querySelector('img').src.split('/').pop();
                const precioTexto = productoCard.querySelector('.precio').textContent;
                const precio = parseFloat(precioTexto.replace(/[^0-9.]/g, ''));

                const precioOfertaElem = productoCard.querySelector('.precio-oferta');
                const ofertaP = precioOfertaElem ? parseFloat(precioOfertaElem.textContent.replace(/[^0-9.]/g, '')) : 0;

                producto = {
                    id: productoId,
                    nombre,
                    descripcion,
                    imagen,
                    precio,
                    ofertaP,
                    categoria: productoCard.dataset.categoria
                };
            }

            // Alternar agregar / eliminar
            if (yaEsta) {
                await eliminarDeWishlist(productoId);
            } else {
                await agregarAWishlist(producto);
            }

            // Actualizar corazones globalmente
            actualizarCorazones();
        });
    });
}