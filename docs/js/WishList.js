
function obtenerWishlist() {
    const wishlist = localStorage.getItem('wishlist');
    return wishlist ? JSON.parse(wishlist) : [];
}

function guardarWishlist(wishlist) {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function estaEnWishlist(productoId) {
    const wishlist = obtenerWishlist();
    return wishlist.some(item => item.id === productoId);
}

// Agregar producto a la wishlist
function agregarAWishlist(producto) {
    const wishlist = obtenerWishlist();
    
    if (estaEnWishlist(producto.id)) {
        mostrarAlerta('Este producto ya está en tu lista de deseos', 'info');
        return;
    }
    
    wishlist.push(producto);
    guardarWishlist(wishlist);
    actualizarVistaWishlist();
    mostrarAlerta('Producto agregado a tu lista de deseos ❤️', 'success');
}

// Eliminar producto de la wishlist
function eliminarDeWishlist(productoId) {
    let wishlist = obtenerWishlist();
    wishlist = wishlist.filter(item => item.id !== productoId);
    guardarWishlist(wishlist);
    actualizarVistaWishlist();
    actualizarCorazones();
    mostrarAlerta('Producto eliminado de tu lista de deseos', 'info');
}

// Actualizar la vista del panel de wishlist
function actualizarVistaWishlist() {
    const contenedor = document.querySelector('.wishlist-productos');
    if (!contenedor) return;
    
    const wishlist = obtenerWishlist();
    
    if (wishlist.length === 0) {
        contenedor.innerHTML = '<p class="wishlist-vacio">No hay productos en tu lista de deseos</p>';
        return;
    }
    
    contenedor.innerHTML = '';
    
    wishlist.forEach(producto => {
        const item = document.createElement('div');
        item.classList.add('wishlist-item');
        
        const tieneOferta = producto.ofertaP && producto.ofertaP > 0;
        const precioMostrar = tieneOferta ? producto.ofertaP : producto.precio;
        
        item.innerHTML = `
            <img src="../ImagenesGenerales/${producto.imagen}" alt="${producto.nombre}" class="wishlist-img">
            <div class="wishlist-detalle">
                <h4>${producto.nombre}</h4>
                <p class="wishlist-precio">$${parseFloat(precioMostrar).toFixed(2)} MXN</p>
                ${tieneOferta ? `<p class="wishlist-precio-anterior">Antes: $${parseFloat(producto.precio).toFixed(2)}</p>` : ''}
            </div>
            <div class="wishlist-acciones">
                <button class="btn-wishlist-carrito" data-id="${producto.id}" title="Agregar al carrito">
                    🛒
                </button>
                <button class="btn-wishlist-eliminar" data-id="${producto.id}" title="Eliminar">
                    ❌
                </button>
            </div>
        `;
        
        contenedor.appendChild(item);
    });
    
    document.querySelectorAll('.btn-wishlist-eliminar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productoId = btn.dataset.id;
            eliminarDeWishlist(productoId);
        });
    });

    document.querySelectorAll('.btn-wishlist-carrito').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const productoId = btn.dataset.id;
            const token = localStorage.getItem("token");
            
            if (!token) {
                mostrarAlertaLogin();
                return;
            }
            
            // Agregar al carrito (usando la misma lógica del carrito.js)
            try {
                const producto = obtenerWishlist().find(p => p.id === productoId);
                if (producto) {
                    await agregarAlCarrito(producto);
                }
            } catch (error) {
                console.error('Error al agregar al carrito:', error);
            }
        });
    });
}

function actualizarCorazones() {
    document.querySelectorAll('.btn-wishlist').forEach(btn => {
        const productoId = btn.dataset.id;
        if (estaEnWishlist(productoId)) {
            btn.classList.add('active');
            btn.innerHTML = '❤️';
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '🤍';
        }
    });
}

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

function inicializarPanelWishlist() {
    const wishlistBtn = document.getElementById('wishlist-btn');
    const wishlistPanel = document.getElementById('wishlist-panel');
    
    if (wishlistBtn && wishlistPanel) {
        wishlistBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            wishlistPanel.classList.toggle('hidden');
            actualizarVistaWishlist();
        });

        document.addEventListener('click', (e) => {
            if (!wishlistPanel.contains(e.target) && !wishlistBtn.contains(e.target)) {
                wishlistPanel.classList.add('hidden');
            }
        });

        wishlistPanel.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarPanelWishlist);
} else {
    inicializarPanelWishlist();
}