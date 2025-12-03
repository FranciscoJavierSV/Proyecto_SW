document.addEventListener("DOMContentLoaded", () => {
    // CARGAR PRODUCTOS DESDE BACKEND
    cargarProductos();
});

async function cargarProductos() {
    const grid = document.querySelector(".grid-productos");

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
            card.classList.add("producto");

            // Mostrar precio normal tachado y precio de oferta si existe
            let priceHtml = '';
            if (prod.ofertaP && prod.ofertaP !== null && prod.ofertaP !== '') {
                priceHtml = `
                    <div class="precio">
                        <span class="precio-original">$${parseFloat(prod.precio).toFixed(2)}</span>
                        <br>
                        <span class="precio-oferta">$${parseFloat(prod.ofertaP).toFixed(2)}</span>
                    </div>
                `;
            } else {
                priceHtml = `<div class="precio">$${parseFloat(prod.precio).toFixed(2)}</div>`;
            }

            card.innerHTML = `
                <img src="../ImagenesGenerales/${prod.imagen}" alt="${prod.nombre}">
                <h3>${prod.nombre}</h3>
                <h4>${prod.descripcion}</h4>
                ${priceHtml}
            `;

            grid.appendChild(card);
        });


    } catch (error) {
        console.error("Error al cargar productos:", error);
        grid.innerHTML = "<p>No se pudieron cargar los productos.</p>";
    }
}
