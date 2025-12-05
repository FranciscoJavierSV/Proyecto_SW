document.addEventListener("DOMContentLoaded", () => {

    // ============================================================
    // MOSTRAR NOMBRE DEL USUARIO LOGUEADO
    // Obtiene el nombre almacenado en localStorage y lo muestra
    // en el elemento con la clase .usuario-nombre
    // ============================================================
    const username = localStorage.getItem("username");
    const nombreSpan = document.querySelector(".usuario-nombre");

    if (username && nombreSpan) {
        nombreSpan.textContent = `Hola, ${username}`;
    }

    // Cargar carrito al iniciar la página
    cargarCarrito();

    // ============================================================
    // MANEJO DEL PANEL LATERAL DEL CARRITO
    // ============================================================
    const carritoIcon = document.getElementById("carrito-icon");   // Icono del carrito
    const panelCarrito = document.getElementById("panelCarrito");  // Panel lateral del carrito
    const cerrarBtn = document.getElementById("cerrarCarrito");    // Botón para cerrar panel

    // Abrir panel del carrito
    if (carritoIcon) {
        carritoIcon.addEventListener("click", () => {
            panelCarrito.style.right = "0"; // Mover panel hacia adentro
            cargarCarrito();                // Recargar contenido del carrito
        });
    }

    // Cerrar panel del carrito
    if (cerrarBtn) {
        cerrarBtn.addEventListener("click", () => {
            panelCarrito.style.right = "-380px"; // Ocultar panel
        });
    }
});