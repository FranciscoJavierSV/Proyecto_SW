function obtenerWishlist() {
    var wishlist = localStorage.getItem('wishlist');
    if (wishlist) {
        return JSON.parse(wishlist);
    }
    return [];
}

function guardarWishlist(wishlist) {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function estaEnWishlist(productoId) {
    var wishlist = obtenerWishlist();
    for (var i = 0; i < wishlist.length; i++) {
        if (wishlist[i].id === productoId) {
            return true;
        }
    }
    return false;
}

function agregarAWishlist(producto) {
    var wishlist = obtenerWishlist();
    
    if (estaEnWishlist(producto.id)) {
        mostrarAlerta('Este producto ya está en tu lista de deseos', 'info');
        return;
    }
    
    wishlist.push(producto);
    guardarWishlist(wishlist);
    actualizarVistaWishlist();
    mostrarAlerta('Producto agregado a tu lista de deseos ❤️', 'success');
}

function eliminarDeWishlist(productoId) {
    var wishlist = obtenerWishlist();
    var nuevaWishlist = [];
    
    for (var i = 0; i < wishlist.length; i++) {
        if (wishlist[i].id !== productoId) {
            nuevaWishlist.push(wishlist[i]);
        }
    }
    
    guardarWishlist(nuevaWishlist);
    actualizarVistaWishlist();
    actualizarCorazones();
    mostrarAlerta('Producto eliminado de tu lista de deseos', 'info');
}

function actualizarVistaWishlist() {
    var contenedor = document.querySelector('.wishlist-productos');
    if (!contenedor) {
        return;
    }
    
    var wishlist = obtenerWishlist();
    
    if (wishlist.length === 0) {
        contenedor.innerHTML = '<p class="wishlist-vacio">Tu lista de deseos está vacía 💔</p>';
        return;
    }
    
    contenedor.innerHTML = '';
    
    for (var i = 0; i < wishlist.length; i++) {
        var producto = wishlist[i];
        var item = document.createElement('div');
        item.classList.add('wishlist-producto');
        
        var tieneOferta = false;
        if (producto.ofertaP && producto.ofertaP > 0) {
            tieneOferta = true;
        }
        
        var precioMostrar = producto.precio;
        if (tieneOferta) {
            precioMostrar = producto.ofertaP;
        }
        
        var precioAnterior = '';
        if (tieneOferta) {
            precioAnterior = '<span style="font-size: 12px; color: var(--text-secondary); text-decoration: line-through;">$' + parseFloat(producto.precio).toFixed(2) + '</span>';
        }
        
        item.innerHTML = '<img src="../ImagenesGenerales/' + producto.imagen + '" alt="' + producto.nombre + '">' +
            '<div class="wishlist-info">' +
                '<h4>' + producto.nombre + '</h4>' +
                '<p>$' + parseFloat(precioMostrar).toFixed(2) + ' MXN</p>' +
                precioAnterior +
            '</div>' +
            '<div class="wishlist-btns">' +
                '<button class="wishlist-btn-agregar" data-id="' + producto.id + '" title="Agregar al carrito">' +
                    '🛒 Agregar' +
                '</button>' +
                '<button class="wishlist-btn-eliminar" data-id="' + producto.id + '" title="Eliminar">' +
                    '🗑️ Quitar' +
                '</button>' +
            '</div>';
        
        contenedor.appendChild(item);
    }
    
    var botonesEliminar = document.querySelectorAll('.wishlist-btn-eliminar');
    for (var i = 0; i < botonesEliminar.length; i++) {
        botonesEliminar[i].addEventListener('click', function(e) {
            e.stopPropagation();
            var productoId = this.dataset.id;
            eliminarDeWishlist(productoId);
        });
    }

    var botonesAgregar = document.querySelectorAll('.wishlist-btn-agregar');
    for (var i = 0; i < botonesAgregar.length; i++) {
        botonesAgregar[i].addEventListener('click', function(e) {
            e.stopPropagation();
            var productoId = this.dataset.id;
            var token = localStorage.getItem("token");
            
            if (!token) {
                mostrarAlertaLogin();
                return;
            }
            
            var wishlist = obtenerWishlist();
            var producto = null;
            
            for (var j = 0; j < wishlist.length; j++) {
                if (wishlist[j].id === productoId) {
                    producto = wishlist[j];
                    break;
                }
            }
            
            if (producto) {
                apiPost(
                    "/auth/cart",
                    { productId: producto.id, quantity: 1 },
                    { Authorization: "Bearer " + token }
                ).then(function(data) {
                    if (data.success) {
                        mostrarAlerta('Producto agregado al carrito 🛒', 'success');
                        if (typeof cargarCarrito === 'function') {
                            cargarCarrito();
                        }
                        if (typeof actualizarBadgeCarrito === 'function') {
                            actualizarBadgeCarrito();
                        }
                    } else {
                        mostrarAlerta(data.message || 'Error al agregar al carrito', 'error');
                    }
                }).catch(function(error) {
                    console.error('Error al agregar al carrito:', error);
                    mostrarAlerta('Error al agregar al carrito', 'error');
                });
            }
        });
    }
}

function actualizarCorazones() {
    var botones = document.querySelectorAll('.btn-wishlist');
    
    for (var i = 0; i < botones.length; i++) {
        var btn = botones[i];
        var productoId = btn.dataset.id;
        
        if (estaEnWishlist(productoId)) {
            btn.classList.add('active');
            btn.innerHTML = '❤️';
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '🤍';
        }
    }
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
        }).then(function(result) {
            if (result.isConfirmed) {
                window.location.href = "../html/IniciarSesion.html";
            }
        });
    }
}

function inicializarPanelWishlist() {
    var wishlistBtn = document.getElementById('wishlist-btn');
    var wishlistPanel = document.getElementById('wishlist-panel');
    
    if (wishlistBtn && wishlistPanel) {
        wishlistBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            if (wishlistPanel.classList.contains('hidden')) {
                wishlistPanel.classList.remove('hidden');
                actualizarVistaWishlist();
            } else {
                wishlistPanel.classList.add('hidden');
            }
        });

        document.addEventListener('click', function(e) {
            var clickEnPanel = wishlistPanel.contains(e.target);
            var clickEnBtn = wishlistBtn.contains(e.target);
            
            if (!clickEnPanel && !clickEnBtn) {
                wishlistPanel.classList.add('hidden');
            }
        });

        wishlistPanel.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    actualizarVistaWishlist();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarPanelWishlist);
} else {
    inicializarPanelWishlist();
}