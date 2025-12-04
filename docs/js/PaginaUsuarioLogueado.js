document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("username");
    const nombreSpan = document.querySelector(".usuario-nombre");

    if (username && nombreSpan) {
        nombreSpan.textContent = `Hola, ${username}`;
    }
 
    const carritoIcon = document.getElementById("carrito-icon");
    const panelCarrito = document.getElementById("panelCarrito");
    const cerrarBtn = document.getElementById("cerrarCarrito");

    console.log("carritoIcon:", carritoIcon);
    console.log("panelCarrito:", panelCarrito);
    console.log("cerrarBtn:", cerrarBtn);
 
    if (carritoIcon && panelCarrito) {
        carritoIcon.addEventListener("click", (e) => {
            e.stopPropagation();
            console.log("🛒 Click en carrito detectado!");
            console.log("Right ANTES:", panelCarrito.style.right);
            
            panelCarrito.style.right = "0px";
            panelCarrito.style.display = "flex";
            
            console.log("Right DESPUÉS:", panelCarrito.style.right);
            
            cargarCarrito();
        });
    }

    if (cerrarBtn) {
        cerrarBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            console.log("Cerrando carrito");
            panelCarrito.style.right = "-380px";
        });
    }

    document.addEventListener("click", (e) => {
        if (panelCarrito && carritoIcon) {
            const clickDentroCarrito = panelCarrito.contains(e.target);
            const clickEnIcono = carritoIcon.contains(e.target);
            const estiloRight = window.getComputedStyle(panelCarrito).right;
            const carritoAbierto = estiloRight === "0px";
            
            if (!clickDentroCarrito && !clickEnIcono && carritoAbierto) {
                panelCarrito.style.right = "-380px";
            }
        }
    });

    const token = localStorage.getItem("token");
    if (token) {
        actualizarBadgeCarrito();
    }

    cargarProductos();

    const logoutBtn = document.querySelector(".logout-btn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (event) {
            event.preventDefault(); 

            if (typeof window.limpiarAccesibilidadAlCerrarSesion === 'function') {
                window.limpiarAccesibilidadAlCerrarSesion();
            }

            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("refreshToken");

            window.location.href = "../index.html";
        });
    }
});

async function cargarProductos() {
    const grid = document.querySelector(".grid-productos");
    if (!grid) return;

    try {
        const data = await apiGet("/public/products");

        if (!data.success) {
            grid.innerHTML = "<p>Error al cargar productos.</p>";
            return;
        }

        // Cargar wishlist UNA sola vez
        const wishlist = await obtenerWishlist();
        const wishlistIds = wishlist.map(item => item.producto_id);

        grid.innerHTML = "";

        data.products.forEach(prod => {
            const card = document.createElement("div");
            card.classList.add("producto");
            card.dataset.categoria = prod.categoria || "";
            card.dataset.precio = prod.precio || 0;
            card.dataset.inventario = prod.inventario || 0;

            const tieneOferta = prod.ofertaP && prod.ofertaP > 0;
            const precioMostrar = tieneOferta ? prod.ofertaP : prod.precio;
            const sinStock = !prod.inventario || parseInt(prod.inventario) === 0;

            console.log(`Producto: ${prod.nombre}, Inventario: ${prod.inventario}, Sin stock: ${sinStock}`);

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

            // Wishlist correcta usando la API
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

            grid.appendChild(card);
        });

        if (typeof activarBotonesCarrito === 'function') {
            activarBotonesCarrito();
        }

        activarBotonesWishlist();

    } catch (error) {
        console.error("Error al cargar productos:", error);
        grid.innerHTML = "<p>No se pudieron cargar los productos.</p>";
    }
}

async function actualizarBadgeCarrito() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const carritoCountElem = document.getElementById("carrito-count");
    
    try {
        const data = await apiGet("/auth/cart", {
            Authorization: "Bearer " + token,
        });

        if (data.success && Array.isArray(data.cart)) {
            const cantidadTotal = data.cart.reduce((sum, item) => sum + item.cantidad, 0);
            carritoCountElem.textContent = cantidadTotal;
        }
    } catch (error) {
        console.error("Error actualizando badge:", error);
    }
}

function inicializarFiltros() {
    const slider = document.getElementById('rangoPrecio');
    const precioMax = document.getElementById('precioMax');
    const checkboxesCat = document.querySelectorAll('input[name="categoria"]');
    const checkboxesOferta = document.querySelectorAll('input[name="oferta"]');
    const btnLimpiar = document.querySelector('.btn-limpiar-filtros');

    if (slider && precioMax) {
        slider.addEventListener('input', function() {
            precioMax.textContent = this.value;
            aplicarFiltros();
        });
    }

    checkboxesCat.forEach(checkbox => {
        checkbox.addEventListener('change', aplicarFiltros);
    });

    checkboxesOferta.forEach(checkbox => {
        checkbox.addEventListener('change', aplicarFiltros);
    });

    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', limpiarFiltros);
    }
}

async function aplicarFiltros() {
  try {
    const rangoInput = document.getElementById('rangoPrecio');
    const precioMaximo = rangoInput ? Number(rangoInput.value) : NaN;

    const categoriasSeleccionadas = Array.from(
      document.querySelectorAll('input[name="categoria"]:checked')
    ).map(cb => cb.value);

    const conOferta = !!document.getElementById('conOferta')?.checked;
    const sinOferta = !!document.getElementById('sinOferta')?.checked;

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

    const res = await apiGet(url); 

    console.log('[aplicarFiltros] respuesta ->', res);

    let productos = res.products || res.product || [];

    let resultado = productos.slice();

    if (!Number.isNaN(precioMaximo) && precioMaximo >= 0) {
      resultado = resultado.filter(p => {
        const tieneOferta = p.ofertaP && Number(p.ofertaP) > 0;
        const precioReal = tieneOferta ? Number(p.ofertaP) : Number(p.precio);
        return !Number.isNaN(precioReal) && precioReal <= precioMaximo;
      });
    }

    if (categoriasSeleccionadas.length > 0) {
      resultado = resultado.filter(p => categoriasSeleccionadas.includes(p.categoria));
    }

    if (conOferta && !sinOferta) {
      resultado = resultado.filter(p => p.ofertaP && Number(p.ofertaP) > 0);
    } else if (!conOferta && sinOferta) {
      resultado = resultado.filter(p => !p.ofertaP || p.ofertaP === '' || Number(p.ofertaP) === 0);
    }

    renderProductos(resultado);

  }catch (err) {
    console.error('Error en aplicar filtros: ', err);
    renderProductos([]);
  }
}

async function renderProductos(productos) {
    const contenedor = document.querySelector(".grid-productos");
    if (!contenedor) return;
    
    contenedor.innerHTML = "";

    if (!productos || productos.length === 0) {
        contenedor.innerHTML = "<p>No hay productos disponibles.</p>";
        return;
    }

    // Cargar wishlist UNA sola vez
    const wishlist = await obtenerWishlist();
    const wishlistIds = wishlist.map(item => item.producto_id);

    productos.forEach(prod => {
        const card = document.createElement("div");
        card.classList.add("producto");
        card.dataset.categoria = prod.categoria || "";

        const tieneOferta = prod.ofertaP && prod.ofertaP > 0;
        const precioMostrar = tieneOferta ? prod.ofertaP : prod.precio;
        card.dataset.precio = precioMostrar;
        card.dataset.inventario = prod.inventario || 0;

        const sinStock = !prod.inventario || parseInt(prod.inventario) === 0;

        // Wishlist correcta usando la API
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

    if (typeof activarBotonesCarrito === 'function') {
        activarBotonesCarrito();
    }

    activarBotonesWishlist();
}

function limpiarFiltros() {
    document.getElementById('rangoPrecio').value = 100;
    document.getElementById('precioMax').textContent = '100';
    
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    document.querySelectorAll('.producto').forEach(producto => {
        producto.classList.remove('oculto');
    });

    cargarProductos();
}

function activarBotonesWishlist() {
    document.querySelectorAll('.btn-wishlist').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const productoId = btn.dataset.id;

            const token = localStorage.getItem("token");
            if (!token) {
                mostrarAlertaLogin();
                return;
            }

            // Obtener wishlist actual desde API
            const wishlist = await obtenerWishlist();
            const ids = wishlist.map(item => item.producto_id);
            const yaEsta = ids.includes(Number(productoId));

            // Construir objeto producto SOLO si se va a agregar
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