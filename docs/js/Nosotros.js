document.addEventListener("DOMContentLoaded", () => {
    inicializarCarrito();
});

function inicializarCarrito() {
    const carritoIcon = document.querySelector('.carrito');
    if (!carritoIcon) return;

    carritoIcon.addEventListener('click', function() {
        const username = localStorage.getItem('username');
        const token = localStorage.getItem('token');
        
        if (!username && !token) {
             
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
        } else {
            window.location.href = 'html/PaginaUsuarioLogueado.html';
        }
    });
}