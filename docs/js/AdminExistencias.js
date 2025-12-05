document.addEventListener("DOMContentLoaded", () => {
    // MOSTRAR NOMBRE DEL ADMIN LOGUEADO
    const username = localStorage.getItem("username");
    const nombreSpan = document.querySelector(".admin-name");

    // Si existe un usuario guardado, mostrarlo en la interfaz
    if (username && nombreSpan) {
        nombreSpan.textContent = `Hola ${username} / Administrador`;
    }
 
    // CERRAR SESIÓN
    const logoutBtn = document.querySelector(".logout-btn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (event) {
            event.preventDefault();

            // Eliminar credenciales del almacenamiento local
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("refreshToken");

            // Redirigir al inicio
            window.location.href = "../index.html";
        });
    }

    // Cargar existencias al iniciar la página
    cargarExistencias();
});


// -----------------------------
// Cargar productos desde tu API
// -----------------------------
async function cargarExistencias() {
    try {
        data = await apiGet('/public/products'); // Solicita productos al backend
        
        const productos = data.products; // Lista de productos recibidos

        // Llenar estadísticas y tabla con los productos
        llenarEstadisticas(productos);
        llenarTabla(productos);

    } catch (error) {
        console.error("Error obteniendo productos:", error);
        alertaError("No se pudieron cargar las existencias");
    }
}


// ---------------------------------------------
// Tarjetas superiores (total, stock normal/bajo)
// ---------------------------------------------
function llenarEstadisticas(productos) {
    const total = productos.length; // Total de productos

    // Valores estáticos para mostrar en tarjetas
    const stockNormal = 15;
    const stockBajo = 6;

    // Insertar valores en las tarjetas superiores
    document.querySelectorAll(".stat-number")[0].textContent = total;
    document.querySelectorAll(".stat-number")[1].textContent = stockNormal;
    document.querySelectorAll(".stat-number")[2].textContent = stockBajo;
}


// ---------------------------------------------
// Llenado de tabla de inventario
// ---------------------------------------------
function llenarTabla(productos) {
    const tbody = document.querySelector(".inventory-table tbody");
    tbody.innerHTML = ""; // Limpiar tabla antes de llenarla

    const limiteBajo = 8; // Límite para marcar inventario como "bajo"

    productos.forEach(prod => {
        const tr = document.createElement("tr");

        // Determinar estado del inventario
        const estado = prod.inventario < limiteBajo
            ? `<span class="status low">Bajo</span>`
            : `<span class="status ok">OK</span>`;

        // Crear fila con datos del producto
        tr.innerHTML = `
            <td>${prod.nombre}</td>
            <td>${prod.categoria}</td>
            <td class="stock-number">${prod.inventario}</td>
            <td>${prod.precio}</td>
            <td>${prod.descripcion}</td>
            <td>${estado}</td>
        `;

        tbody.appendChild(tr); // Agregar fila a la tabla
    });
}