document.addEventListener("DOMContentLoaded", () => {
    // MOSTRAR NOMBRE DEL ADMIN LOGUEADO
    const username = localStorage.getItem("username");
    const nombreSpan = document.querySelector(".admin-name");

    if (username && nombreSpan) {
        nombreSpan.textContent = `Hola ${username} / Administrador`;
    }

    // CERRAR SESIÓN    
    const logoutBtn = document.querySelector(".logout-btn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (event) {
            event.preventDefault(); 

            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("refreshToken");

            window.location.href = "../index.html";
        });
    }

    // CARGAR PRODUCTOS DESDE BACKEND
    cargarProductos();
}); 

async function cargarProductos() {
    const grid = document.querySelector(".delete-list");

    if (!grid) return;

    try {
        const data = await apiGet("/public/products");

        if (!data.success) {
            grid.innerHTML = "<p>Error al cargar productos.</p>";
            return;
        }

        grid.innerHTML = "";

        data.products.forEach(prod => {
            const card = document.createElement("div");
            card.classList.add("delete-item");

            card.innerHTML = `
                <div class="product-info">
                    <img src="../ImagenesGenerales/${prod.imagen}" alt="${prod.nombre}">
                    <h3>${prod.nombre}</h3>
                    <p>Stock actual: <strong>${prod.inventario}</strong></p>
                    <span class="category-tag">${prod.categoria}</span>
                </div>
                <button class="btn-delete" data-id="${prod.id}">Eliminar</button>
            `;

            grid.appendChild(card);
        });

        // ASIGNAR EVENTOS A TODOS LOS BOTONES
        document.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", confirmarEliminacion);
        });

    } catch (error) {
        console.error("Error al cargar productos:", error);
        grid.innerHTML = "<p>No se pudieron cargar los productos.</p>";
    }
}

async function confirmarEliminacion(e) {
    const id = e.target.dataset.id;

    const confirmar = confirm("¿Seguro que deseas eliminar este producto? Esta acción es permanente.");

    if (!confirmar) return;

    try {
        const token = localStorage.getItem("token");

        const res = await apiDelete(`/account/mProducts/${id}`, {
            Authorization: `Bearer ${token}`
        });

        if (!res.success) {
            alert("Error al eliminar: " + res.message);
            return;
        }

        alert("Producto eliminado correctamente.");

        // Recargar lista
        cargarProductos();

    } catch (error) {
        console.error("Error al eliminar producto:", error);
        alert("No se pudo eliminar el producto.");
    }
}

