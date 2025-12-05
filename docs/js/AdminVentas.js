document.addEventListener("DOMContentLoaded", async () => {
    // MOSTRAR NOMBRE DEL ADMIN LOGUEADO
    // Obtiene el nombre almacenado en localStorage y lo muestra en la interfaz
    const username = localStorage.getItem("username");
    const nombreSpan = document.querySelector(".admin-name");

    if (username && nombreSpan) {
        nombreSpan.textContent = `Hola ${username} / Administrador`;
    }

    // CERRAR SESIÓN
    // Elimina credenciales y redirige al login
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

    // Token del administrador para llamadas protegidas
    const token = localStorage.getItem("token");

    /* ============================================================
       1. OBTENER DATOS PARA LA GRÁFICA DE CATEGORÍAS
    ============================================================ */
    const chartData = await apiGet('/account/sales/chart', {
        Authorization: `Bearer ${token}`
    });

    console.log("DATOS DE LA GRAFICA:", chartData);

    // Categorías esperadas
    const categorias = ["bebida", "salado", "dulce"];

    // Extraer cantidades por categoría
    const cantidades = categorias.map(cat => {
        let obj = chartData.categorias.find(c => c.categoria === cat);
        return obj ? Number(obj.cantidad) : 0;
    });

    // Total de ventas sumadas
    const total = cantidades.reduce((a, b) => a + b, 0);

    // Mostrar porcentajes en tarjetas
    if (total === 0) {
        document.getElementById("bebida-percent").innerText = "0%";
        document.getElementById("salado-percent").innerText = "0%";
        document.getElementById("postre-percent").innerText = "0%";
    } else {
        document.getElementById("bebida-percent").innerText = ((cantidades[0] / total) * 100).toFixed(1) + "%";
        document.getElementById("salado-percent").innerText = ((cantidades[1] / total) * 100).toFixed(1) + "%";
        document.getElementById("postre-percent").innerText = ((cantidades[2] / total) * 100).toFixed(1) + "%";
    }

    /* ============================================================
       GRAFICAR PIE CHART
    ============================================================ */
    let ctx = document.getElementById("ventasChart").getContext("2d");

    new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Bebida", "Salado", "Dulce"],
            datasets: [{
                data: cantidades,
                backgroundColor: ["#913d4cff", "#e57d90", "#f8c6cfff"]
            }]
        },
        options: { plugins: { legend: { display: false } } }
    });

    /* ============================================================
       2. OBTENER VENTAS POR PRODUCTO
    ============================================================ */
    const productosData = await apiGet('/account/sales/products', {
        Authorization: `Bearer ${token}`
    });

    console.log("DATOS DE PRODUCTOS:", productosData);

    renderVentasPorProducto(productosData);

    /* ============================================================
       3. OBTENER TOTAL GENERAL DE LA EMPRESA
    ============================================================ */
    const empresaTotal = await apiGet('/account/sales/company-total', {
        Authorization: `Bearer ${token}`
    });

    console.log("TOTAL GENERAL:", empresaTotal);

    document.getElementById("total-general").innerHTML =
        `<strong>$${empresaTotal.totalGeneral}MXN</strong>`;
});


/* ============================================================
   RENDERIZAR LISTA DE VENTAS POR PRODUCTO
============================================================ */
function renderVentasPorProducto(data) {
    // Zonas donde se mostrarán los productos por categoría
    const zonas = {
        bebida: document.getElementById("ventas-bebida"),
        salado: document.getElementById("ventas-salado"),
        dulce: document.getElementById("ventas-dulce")
    };

    // Limpiar contenido previo
    Object.values(zonas).forEach(z => z.innerHTML = "");

    // Recorrer categorías y productos
    for (let categoria in data.categorias) {
        data.categorias[categoria].forEach(prod => {
            zonas[categoria].innerHTML += `
                <li>
                    <span>${prod.producto}</span>
                    <span class="ventas-count">${prod.cantidadVendida} uds</span>
                    <span class="ventas-count">$${prod.totalGenerado}</span>
                </li>
            `;
        });
    }
}