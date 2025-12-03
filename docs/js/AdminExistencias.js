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

    cargarExistencias();
});

// -----------------------------
// Cargar productos desde tu API
// -----------------------------
async function cargarExistencias() {
    try {
        data = await apiGet('/public/products');
        
        const productos = data.products;

        llenarEstadisticas(productos);
        llenarTabla(productos);

    } catch (error) {
        console.error("Error obteniendo productos:", error);
        Swal.fire("Error", "No se pudieron cargar las existencias", "error");
    }
}

// ---------------------------------------------
// Tarjetas superiores (total, stock normal/bajo)
// ---------------------------------------------
function llenarEstadisticas(productos) {
    const total = productos.length;

    const stockNormal = 15;
    const stockBajo = 6;

    document.querySelectorAll(".stat-number")[0].textContent = total;
    document.querySelectorAll(".stat-number")[1].textContent = stockNormal;
    document.querySelectorAll(".stat-number")[2].textContent = stockBajo;
}

// ---------------------------------------------
// Llenado de tabla
// ---------------------------------------------
function llenarTabla(productos) {
    const tbody = document.querySelector(".inventory-table tbody");
    tbody.innerHTML = "";

    const limiteBajo = 8;

    productos.forEach(prod => {
        const tr = document.createElement("tr");

        const estado = prod.inventario < limiteBajo
            ? `<span class="status low">Bajo</span>`
            : `<span class="status ok">OK</span>`;

        tr.innerHTML = `
            <td>${prod.nombre}</td>
            <td>${prod.categoria}</td>
            <td class="stock-number">${prod.inventario}</td>
            <td>${prod.descripcion}</td>
            <td>${estado}</td>
        `;

        tbody.appendChild(tr);
    });
}