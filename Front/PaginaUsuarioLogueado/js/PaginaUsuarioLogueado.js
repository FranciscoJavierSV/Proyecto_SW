document.addEventListener("DOMContentLoaded", () => {

    const carritoIcon = document.getElementById("carrito-icon");
    const panelCarrito = document.getElementById("panelCarrito");
    const cerrarBtn = document.getElementById("cerrarCarrito");
    
    if (carritoIcon) {
        carritoIcon.addEventListener("click", () => {
            panelCarrito.style.right = "0";
        });
    }
    if (cerrarBtn) {
        cerrarBtn.addEventListener("click", () => {
            panelCarrito.style.right = "-380px";
        });
    }

});