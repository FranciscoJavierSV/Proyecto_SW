document.addEventListener("DOMContentLoaded", async () => {
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
    const token = localStorage.getItem("token");

    // 1. Datos para GRÁFICA
    const chartData = await apiGet('/account/sales/chart', {
        Authorization: `Bearer ${token}`
    });
    const categorias = ["bebida", "salado", "dulce"];
    const cantidades = categorias.map(cat => {
        let obj = chartData.categorias.find(c => c.categoria === cat);
        return obj ? obj.cantidad : 0;
    });

    const total = cantidades.reduce((a, b) => a + b, 0);

    document.getElementById("bebida-percent").innerText = ((cantidades[0] / total) * 100).toFixed(1) + "%";
    document.getElementById("salado-percent").innerText = ((cantidades[1] / total) * 100).toFixed(1) + "%";
    document.getElementById("postre-percent").innerText = ((cantidades[2] / total) * 100).toFixed(1) + "%";

    // Graficar
    let ctx = document.getElementById("ventasChart").getContext("2d");
    new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Bebida", "Salado", "Dulce"],
            datasets: [{
                data: cantidades,
                backgroundColor: ["#C19A6B", "#8B6B4A", "#D4C4B0"]
            }]
        },
        options: { plugins: { legend: { display: false } } }
    });

    // 2. Datos de totales
    const productosData = await apiGet('/account/sales/products', {
        Authorization: `Bearer ${token}`
    });

    renderVentasPorProducto(productosData);

    const empresaTotal = await apiGet('/account/sales/company-total', {
        Authorization: `Bearer ${token}`
    });

    document.getElementById("total-general").innerHTML =
    `<strong>$${empresaTotal.totalGeneral}MXN</strong>`;
});

function renderVentasPorProducto(data) {
    const zonas = {
        bebida: document.getElementById("ventas-bebida"),
        salado: document.getElementById("ventas-salado"),
        dulce: document.getElementById("ventas-dulce")
    };

    // Limpia contenido previo
    Object.values(zonas).forEach(z => z.innerHTML = "");

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
