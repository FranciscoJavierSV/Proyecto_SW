document.addEventListener("DOMContentLoaded", () => {
    // ============================================================
    // INICIALIZACIÓN DE LA PÁGINA
    // Carga los productos y activa los filtros al cargar la vista
    // ============================================================
    cargarProductos();
    inicializarFiltros();
});


async function cargarProductos() {
    const grid = document.querySelector(".grid-productos");
    if (!grid) return; // Si no existe el contenedor, no continuar

    try {
        // Solicitar productos al backend
        const data = await apiGet("/public/products");

        if (!data.success) {
            grid.innerHTML = "<p>Error al cargar productos.</p>";
            return;
        }

        // ============================================================
        // CARGAR WISHLIST SOLO SI EL USUARIO ESTÁ LOGUEADO
        // ============================================================
        let wishlistIds = [];
        const token = localStorage.getItem("token");

        if (token) {
            const wishlist = await obtenerWishlist();
            wishlistIds = wishlist.map(item => item.producto_id);
        }

        grid.innerHTML = ""; // Limpiar contenedor

        // ============================================================
        // RENDERIZAR CADA PRODUCTO
        // ============================================================
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

            // Estado del wishlist
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

        // Activar botones del carrito
        activarBotonesCarrito();

        // Activar wishlist (maneja alerta si no hay token)
        activarBotonesWishlist();

    } catch (error) {
        console.error("Error al cargar productos:", error);
        grid.innerHTML = "<p>No se pudieron cargar los productos.</p>";
    }
}


function activarBotonesWishlist() {
    // Seleccionar todos los botones de wishlist
    document.querySelectorAll('.btn-wishlist').forEach(btn => {

        btn.addEventListener('click', async (e) => {
            e.stopPropagation(); // Evita que el click abra el panel del carrito

            const productoId = btn.dataset.id;
            const token = localStorage.getItem("token");

            // ============================================================
            // SI NO HAY SESIÓN → MOSTRAR ALERTA Y OFRECER LOGIN
            // ============================================================
            if (!token) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: "No has iniciado sesión",
                        text: "¿Deseas iniciar sesión para agregar productos a tu lista de deseos?",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#8b6b4a",
                        cancelButtonColor: "#d33",
                        confirmButtonText: "Ir a iniciar sesión",
                        cancelButtonText: "Cancelar"
                    }).then(result => {
                        if (result.isConfirmed) {
                            window.location.href = "../html/IniciarSesion.html";
                        }
                    });
                }
                return;
            }

            // ============================================================
            // OBTENER WISHLIST ACTUAL DEL USUARIO
            // ============================================================
            const wishlist = await obtenerWishlist();
            const ids = wishlist.map(item => item.producto_id);
            const yaEsta = ids.includes(Number(productoId));

            // ============================================================
            // AGREGAR O ELIMINAR SEGÚN ESTADO ACTUAL
            // ============================================================
            if (yaEsta) {
                await eliminarDeWishlist(productoId);
            } else {
                await agregarAWishlist({ id: productoId });
            }

            // ============================================================
            // ACTUALIZAR TODOS LOS CORAZONES EN LA PÁGINA
            // ============================================================
            actualizarCorazones();
        });
    });
}
function activarBotonesCarrito() {
    // Selecciona todos los botones "Agregar al carrito"
    const botones = document.querySelectorAll(".btn-agregar");

    botones.forEach(btn => {
        btn.addEventListener("click", () => {
            const token = localStorage.getItem("token");

            // Si el usuario no está logueado → mostrar alerta y ofrecer login
            if (!token) {
                Swal.fire({
                    title: "No has iniciado sesión",
                    text: "¿Deseas iniciar sesión para agregar productos al carrito?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#8b6b4a",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Ir a iniciar sesión",
                    cancelButtonText: "Cancelar"
                }).then(result => {
                    if (result.isConfirmed) {
                        window.location.href = "../html/IniciarSesion.html";
                    }
                });
                return;
            }

            // Si hay token, aquí normalmente iría la lógica para agregar al carrito
            // (pero en este fragmento aún no se implementa)
        });
    });

    // Botón del ícono del carrito (parte superior)
    const btnCarrito = document.querySelector(".carrito");

    if (btnCarrito) {
        btnCarrito.addEventListener("click", () => {
            const token = localStorage.getItem("token");

            // Si no hay sesión → alerta
            if (!token) {
                Swal.fire({
                    title: "No has iniciado sesión",
                    text: "¿Deseas iniciar sesión para agregar productos al carrito?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#8b6b4a",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Ir a iniciar sesión",
                    cancelButtonText: "Cancelar"
                }).then(result => {
                    if (result.isConfirmed) {
                        window.location.href = "../html/IniciarSesion.html";
                    }
                });
                return;
            }
        });
    }
}


function inicializarFiltros() {
    // Elementos del filtro de precio
    const slider = document.getElementById('rangoPrecio');
    const precioMax = document.getElementById('precioMax');

    // Checkboxes de categorías
    const checkboxesCat = document.querySelectorAll('input[name="categoria"]');

    // Checkboxes de oferta
    const checkboxesOferta = document.querySelectorAll('input[name="oferta"]');

    // Botón para limpiar filtros
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
        // Obtener valores del filtro de precio
        const precioMaximo = Number(document.getElementById('rangoPrecio')?.value);

        // Categorías seleccionadas
        const categoriasSeleccionadas = Array.from(
            document.querySelectorAll('input[name="categoria"]:checked')
        ).map(cb => cb.value);

        // Filtros de oferta
        const conOferta = !!document.getElementById('conOferta')?.checked;
        const sinOferta = !!document.getElementById('sinOferta')?.checked;

        // Construcción de parámetros para la API
        const base = '/public/filtros';
        const params = new URLSearchParams();

        // Categorías
        categoriasSeleccionadas.forEach(cat => {
            params.append('categoria', cat);
        });

        // Precio
        if (!Number.isNaN(precioMaximo) && precioMaximo >= 0) {
            params.set('min', 0);
            params.set('max', precioMaximo);
        }

        // Oferta
        if (conOferta && !sinOferta) params.set('oferta', 'si');
        else if (!conOferta && sinOferta) params.set('oferta', 'no');

        // Construir URL final
        const url = params.toString() ? `${base}?${params.toString()}` : base;

        // Solicitud a la API
        const res = await apiGet(url);
        const productos = res.products || [];

        // Renderizar productos filtrados
        renderProductos(productos);

    } catch (err) {
        console.error("Error en aplicar filtros:", err);
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

    // Cargar wishlist solo si el usuario está logueado
    let wishlistIds = [];
    const token = localStorage.getItem("token");

    if (token) {
        const wishlist = await obtenerWishlist();
        wishlistIds = wishlist.map(item => item.producto_id);
    }

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

        // Wishlist: si no hay token → corazones vacíos
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

    // Reactivar botones después del render
    activarBotonesCarrito();
    activarBotonesWishlist();
}


function limpiarFiltros() {
    // Resetear slider
    const slider = document.getElementById('rangoPrecio');
    const precioMax = document.getElementById('precioMax');

    if (slider) slider.value = 100;
    if (precioMax) precioMax.textContent = '100';

    // Desmarcar checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    // Recargar productos sin filtros
    cargarProductos();
}