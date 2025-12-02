document.addEventListener("DOMContentLoaded", () => {
    // ===================================
    // MOSTRAR NOMBRE DEL USUARIO LOGUEADO
    // ===================================
    const username = localStorage.getItem("username");
    const nombreSpan = document.querySelector(".usuario-nombre");

    if (username && nombreSpan) {
        nombreSpan.textContent = `Hola, ${username}`;
    }

    // ===================================
    // MOSTRAR / OCULTAR CARRITO
    // ===================================
    const carritoIcon = document.getElementById("carrito-icon");
    const panelCarrito = document.getElementById("panelCarrito");
    const cerrarBtn = document.getElementById("cerrarCarrito");
    
    if (carritoIcon) {
        carritoIcon.addEventListener("click", () => {
            panelCarrito.style.right = "0";
            cargarCarrito();
        });
    }
    if (cerrarBtn) {
        cerrarBtn.addEventListener("click", () => {
            panelCarrito.style.right = "-380px";
        });
    }
});