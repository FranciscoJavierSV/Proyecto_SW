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

    // ===================================
    // CARGAR PRODUCTOS DESDE BACKEND
    // ===================================
    cargarProductos();
});

async function cargarProductos() {
    const grid = document.querySelector(".productos-grid");

    if (!grid) return;
 
    try {
        const data = await apiGet("/public/products");

        if (!data.success) {
            grid.innerHTML = "<p>Error al cargar productos.</p>";
            return;
        }

        grid.innerHTML = ""; // limpia los productos estáticos

        data.products.forEach(prod => {
            const card = document.createElement("div");
            card.classList.add("producto-card");

            card.innerHTML = `
                <img src="../ImagenesGenerales/${prod.imagen}" alt="${prod.nombre}">
                <div class="producto-info">
                    <h3>${prod.nombre}</h3>
                    <p class="precio">$${prod.precio}</p>
                    <button class="btn-agregar" data-id="${prod.id}">Agregar al carrito</button>
                </div>
            `;

            grid.appendChild(card);
        });

        activarBotonesCarrito();

    } catch (error) {
        console.error("Error al cargar productos:", error);
        grid.innerHTML = "<p>No se pudieron cargar los productos.</p>";
    }
}
