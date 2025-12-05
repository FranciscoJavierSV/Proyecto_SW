// ===============================
// OBTENER WISHLIST DESDE API
// Obtiene la lista de deseos del usuario autenticado.
// Si no hay token → retorna un arreglo vacío.
// ===============================
async function obtenerWishlist() {
    const token = localStorage.getItem("token");
    if (!token) return [];

    try {
        const res = await apiGet("/auth/wishlist", {
            Authorization: "Bearer " + token
        });

        // La API devuelve res.data con los productos
        return res.data || [];
    } catch (err) {
        console.error("Error obteniendo wishlist:", err);
        return [];
    }
}


// ===============================
// VERIFICAR SI UN PRODUCTO ESTÁ EN WISHLIST
// Devuelve true/false según si el producto está guardado.
// ===============================
async function estaEnWishlist(productoId) {
    const wishlist = await obtenerWishlist();
    return wishlist.some(item => item.producto_id == productoId);
}


// ===============================
// AGREGAR A WISHLIST (API)
// Envía el ID del producto al backend para guardarlo.
// Si no hay sesión → muestra alerta de login.
// ===============================
async function agregarAWishlist(producto) {
    const token = localStorage.getItem("token");
    if (!token) {
        mostrarAlertaLogin();
        return;
    }

    try {
        const res = await apiPost(
            "/auth/wishlist",
            { productId: producto.id },
            { Authorization: "Bearer " + token }
        );

        mostrarAlerta(res.message || "Agregado a wishlist ❤️", "success");

        // Actualizar vista y corazones globalmente
        actualizarVistaWishlist();
        actualizarCorazones();

    } catch (err) {
        console.error("Error agregando a wishlist:", err);
        mostrarAlerta("Error al agregar a wishlist", "error");
    }
}


// ===============================
// ELIMINAR DE WISHLIST (API)
// Elimina un producto de la lista de deseos.
// ===============================
async function eliminarDeWishlist(productoId) {
    const token = localStorage.getItem("token");
    if (!token) {
        mostrarAlertaLogin();
        return;
    }

    try {
        const res = await apiDelete(
            `/auth/wishlist/${productoId}`,
            { Authorization: "Bearer " + token }
        );

        mostrarAlerta(res.message || "Eliminado de wishlist", "info");

        // Actualizar vista y corazones globalmente
        actualizarVistaWishlist();
        actualizarCorazones();

    } catch (err) {
        console.error("Error eliminando de wishlist:", err);
        mostrarAlerta("Error al eliminar", "error");
    }
}


// ===============================
// RENDERIZAR WISHLIST
// Construye dinámicamente la vista de la lista de deseos.
// Incluye botones para eliminar y agregar al carrito.
// ===============================
async function actualizarVistaWishlist() {
    const contenedor = document.querySelector('.wishlist-productos');
    if (!contenedor) return;

    const wishlist = await obtenerWishlist();

    // Si está vacía → mensaje amigable
    if (wishlist.length === 0) {
        contenedor.innerHTML = '<p class="wishlist-vacio">Tu lista de deseos está vacía 💔</p>';
        return;
    }

    contenedor.innerHTML = '';

    wishlist.forEach(producto => {
        const item = document.createElement('div');
        item.classList.add('wishlist-producto');

        const tieneOferta = producto.ofertaP && producto.ofertaP > 0;
        const precioMostrar = tieneOferta ? producto.ofertaP : producto.precio;

        // Precio tachado si hay oferta
        const precioAnterior = tieneOferta
            ? `<span style="font-size: 12px; color: var(--text-secondary); text-decoration: line-through;">$${parseFloat(producto.precio).toFixed(2)}</span>`
            : '';

        // Plantilla del producto en wishlist
        item.innerHTML = `
            <img src="../ImagenesGenerales/${producto.imagen}" alt="${producto.nombre}">
            <div class="wishlist-info">
                <h4>${producto.nombre}</h4>
                <p>$${parseFloat(precioMostrar).toFixed(2)} MXN</p>
                ${precioAnterior}
            </div>

            <div class="wishlist-btns">
                <button class="wishlist-btn-agregar" data-id="${producto.producto_id}" title="Agregar al carrito">🛒 Agregar</button>
                <button class="wishlist-btn-eliminar" data-id="${producto.producto_id}" title="Eliminar">🗑️ Quitar</button>
            </div>
        `;

        contenedor.appendChild(item);
    });

    // Botón eliminar de wishlist
    document.querySelectorAll('.wishlist-btn-eliminar').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            eliminarDeWishlist(btn.dataset.id);
        });
    });

    // Botón agregar al carrito desde wishlist
    document.querySelectorAll('.wishlist-btn-agregar').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            agregarProductoDesdeWishlist(btn.dataset.id);
        });
    });
}

// ===============================
// AGREGAR PRODUCTO AL CARRITO DESDE WISHLIST
// Envía el producto seleccionado al carrito del usuario.
// Si no hay sesión → muestra alerta de login.
// ===============================
async function agregarProductoDesdeWishlist(productoId) {
    const token = localStorage.getItem("token");
    if (!token) {
        mostrarAlertaLogin();
        return;
    }

    try {
        // Petición al backend para agregar 1 unidad del producto
        const res = await apiPost(
            "/auth/cart",
            { productId: productoId, quantity: 1 },
            { Authorization: "Bearer " + token }
        );

        // Si se agregó correctamente
        if (res.success) {
            mostrarAlerta("Producto agregado al carrito 🛒", "success");

            // Actualizar carrito si las funciones existen
            if (typeof cargarCarrito === "function") cargarCarrito();
            if (typeof actualizarBadgeCarrito === "function") actualizarBadgeCarrito();

        } else {
            mostrarAlerta(res.message || "Error al agregar al carrito", "error");
        }

    } catch (err) {
        console.error("Error al agregar al carrito:", err);
        mostrarAlerta("Error al agregar al carrito", "error");
    }
}


// ===============================
// ACTUALIZAR CORAZONES EN PRODUCTOS
// Recorre todos los botones de wishlist y actualiza su estado
// según si el producto está o no en la lista de deseos.
// ===============================
async function actualizarCorazones() {
    const wishlist = await obtenerWishlist();
    const ids = wishlist.map(p => p.producto_id);

    document.querySelectorAll('.btn-wishlist').forEach(btn => {
        const id = btn.dataset.id;

        if (ids.includes(Number(id))) {
            btn.classList.add('active');
            btn.innerHTML = '❤️';
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '🤍';
        }
    });
}


// ===============================
// ALERTAS
// Muestra alertas con SweetAlert2 si está disponible,
// de lo contrario usa alert().
// ===============================
function mostrarAlerta(mensaje, tipo) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            text: mensaje,
            icon: tipo,
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    } else {
        alert(mensaje);
    }
}


// ===============================
// ALERTA DE LOGIN
// Se usa cuando el usuario intenta usar una función protegida
// sin haber iniciado sesión.
// ===============================
function mostrarAlertaLogin() {
    if (typeof Swal !== 'undefined') {
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
    }
}


// ===============================
// PANEL DE WISHLIST
// Controla la apertura/cierre del panel lateral de wishlist.
// También actualiza la vista al abrirlo.
// ===============================
function inicializarPanelWishlist() {
    const wishlistBtn = document.getElementById('wishlist-btn');
    const wishlistPanel = document.getElementById('wishlist-panel');

    if (wishlistBtn && wishlistPanel) {

        // Abrir/cerrar panel al hacer clic en el botón
        wishlistBtn.addEventListener('click', async e => {
            e.stopPropagation();

            if (wishlistPanel.classList.contains('hidden')) {
                wishlistPanel.classList.remove('hidden');
                await actualizarVistaWishlist(); // Recargar contenido
            } else {
                wishlistPanel.classList.add('hidden');
            }
        });

        // Cerrar panel si se hace clic fuera de él
        document.addEventListener('click', e => {
            const clickEnPanel = wishlistPanel.contains(e.target);
            const clickEnBtn = wishlistBtn.contains(e.target);

            if (!clickEnPanel && !clickEnBtn) {
                wishlistPanel.classList.add('hidden');
            }
        });

        // Evitar que clics dentro del panel lo cierren
        wishlistPanel.addEventListener('click', e => e.stopPropagation());
    }

    // Cargar wishlist al iniciar
    actualizarVistaWishlist();
}

// ===============================
// INICIALIZAR
// Ejecuta la inicialización del panel dependiendo del estado del DOM.
// ===============================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarPanelWishlist);
} else {
    inicializarPanelWishlist();
}