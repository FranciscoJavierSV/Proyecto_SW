// ===============================
// OBTENER WISHLIST DESDE API
// ===============================
async function obtenerWishlist() {
    const token = localStorage.getItem("token");
    if (!token) return [];

    try {
        const res = await apiGet("/auth/wishlist", {
            Authorization: "Bearer " + token
        });

        return res.data || [];
    } catch (err) {
        console.error("Error obteniendo wishlist:", err);
        return [];
    }
}

// ===============================
// VERIFICAR SI UN PRODUCTO ESTÁ EN WISHLIST
// ===============================
async function estaEnWishlist(productoId) {
    const wishlist = await obtenerWishlist();
    return wishlist.some(item => item.producto_id == productoId);
}

// ===============================
// AGREGAR A WISHLIST (API)
// ===============================
async function agregarAWishlist(producto) {
    const token = localStorage.getItem("token");
    if (!token) {
        mostrarAlertaLogin();
        return;
    }

    const productId = producto.producto_id || producto.id;

    try {
        const res = await apiPost(
            "/auth/wishlist",
            { productId },
            { Authorization: "Bearer " + token }
        );

        mostrarAlerta(res.message || "Agregado a wishlist ❤️", "success");
        actualizarVistaWishlist();
        actualizarCorazones();
    } catch (err) {
        console.error("Error agregando a wishlist:", err);
        mostrarAlerta("Error al agregar a wishlist", "error");
    }
}


// ===============================
// ELIMINAR DE WISHLIST (API)
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
        actualizarVistaWishlist();
        actualizarCorazones();
    } catch (err) {
        console.error("Error eliminando de wishlist:", err);
        mostrarAlerta("Error al eliminar", "error");
    }
}

// ===============================
// RENDERIZAR WISHLIST
// ===============================
async function actualizarVistaWishlist() {
    const contenedor = document.querySelector('.wishlist-productos');
    if (!contenedor) return;

    const wishlist = await obtenerWishlist();

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

        const precioAnterior = tieneOferta
            ? `<span style="font-size: 12px; color: var(--text-secondary); text-decoration: line-through;">$${parseFloat(producto.precio).toFixed(2)}</span>`
            : '';

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

    // Botón eliminar
    document.querySelectorAll('.wishlist-btn-eliminar').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            eliminarDeWishlist(btn.dataset.id);
        });
    });

    // Botón agregar al carrito
    document.querySelectorAll('.wishlist-btn-agregar').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            agregarProductoDesdeWishlist(btn.dataset.id);
        });
    });
}

// ===============================
// AGREGAR PRODUCTO AL CARRITO DESDE WISHLIST
// ===============================
async function agregarProductoDesdeWishlist(productoId) {
    const token = localStorage.getItem("token");
    if (!token) {
        mostrarAlertaLogin();
        return;
    }

    try {
        const res = await apiPost(
            "/auth/cart",
            { productId: productoId, quantity: 1 },
            { Authorization: "Bearer " + token }
        );

        if (res.success) {
            mostrarAlerta("Producto agregado al carrito 🛒", "success");
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
// ===============================
function inicializarPanelWishlist() {
    const wishlistBtn = document.getElementById('wishlist-btn');
    const wishlistPanel = document.getElementById('wishlist-panel');

    if (wishlistBtn && wishlistPanel) {
        wishlistBtn.addEventListener('click', async e => {
            e.stopPropagation();

            if (wishlistPanel.classList.contains('hidden')) {
                wishlistPanel.classList.remove('hidden');
                await actualizarVistaWishlist();
            } else {
                wishlistPanel.classList.add('hidden');
            }
        });

        document.addEventListener('click', e => {
            const clickEnPanel = wishlistPanel.contains(e.target);
            const clickEnBtn = wishlistBtn.contains(e.target);

            if (!clickEnPanel && !clickEnBtn) {
                wishlistPanel.classList.add('hidden');
            }
        });

        wishlistPanel.addEventListener('click', e => e.stopPropagation());
    }

    actualizarVistaWishlist();
}

// ===============================
// INICIALIZAR
// ===============================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarPanelWishlist);
} else {
    inicializarPanelWishlist();
}