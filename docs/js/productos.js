document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    inicializarFiltros();
});

async function cargarProductos() {
    // CORREGIDO: Cambié 'productos-grid' a 'grid-productos' para que coincida con tu HTML
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
            card.dataset.categoria = prod.categoria || "";
            card.dataset.precio = prod.precio || 0;
            card.dataset.inventario = prod.inventario || 0;

            const tieneOferta = prod.ofertaP && prod.ofertaP > 0;
            const precioMostrar = tieneOferta ? prod.ofertaP : prod.precio;
            // Verificar si hay inventario (considerar null, undefined, 0, "0")
            const sinStock = !prod.inventario || parseInt(prod.inventario) === 0;

            // Debug en consola para verificar
            console.log(`Producto: ${prod.nombre}, Inventario: ${prod.inventario}, Sin stock: ${sinStock}`);

            card.innerHTML = `
                ${tieneOferta ? '<span class="badge-oferta">¡OFERTA!</span>' : ''}
                ${sinStock ? '<span class="badge-sin-stock">Agotado</span>' : ''}
                <img src="../ImagenesGenerales/${prod.imagen}" alt="${prod.nombre}">
                <h3>${prod.nombre}</h3>
                <p class="descripcion">${prod.descripcion || 'Sin descripción'}</p>
                <p class="precio">${precioMostrar} MXN</p>
                ${tieneOferta && !sinStock ? `<p class="precio-anterior">Antes: ${prod.precio} MXN</p>` : ''}
                <button class="btn-agregar" data-id="${prod.id}" ${sinStock ? 'disabled' : ''}>
                    ${sinStock ? 'No disponible' : 'Agregar al carrito'}
                </button>
            `;

            if (sinStock) {
                card.classList.add("sin-stock");
            }

            grid.appendChild(card);
        });

        // Activar botones de agregar al carrito (lo maneja carrito.js)
        if (typeof activarBotonesCarrito === 'function') {
            activarBotonesCarrito();
        }

    } catch (error) {
        console.error("Error al cargar productos:", error);
        grid.innerHTML = "<p>No se pudieron cargar los productos.</p>";
    }
}

function inicializarFiltros() {
    const slider = document.getElementById('rangoPrecio');
    const precioMax = document.getElementById('precioMax');
    const checkboxesCat = document.querySelectorAll('input[name="categoria"]');
    const checkboxesOferta = document.querySelectorAll('input[name="oferta"]');
    const btnLimpiar = document.querySelector('.btn-limpiar-filtros');

    if (slider && precioMax) {
        slider.addEventListener('input', function() {
            precioMax.textContent = this.value;
            aplicarFiltros();
        });
    }

    checkboxesCat.forEach(checkbox => {
        checkbox.addEventListener('change', aplicarFiltros);
    });

    checkboxesOferta.forEach(checkbox => {
        checkbox.addEventListener('change', aplicarFiltros);
    });

    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', limpiarFiltros);
    }
}

function aplicarFiltros() {
    const productos = document.querySelectorAll('.producto');
    const precioMaximo = parseInt(document.getElementById('rangoPrecio').value);
    
    const categoriasSeleccionadas = Array.from(document.querySelectorAll('input[name="categoria"]:checked'))
        .map(cb => cb.value);
    
    const conOferta = document.getElementById('conOferta')?.checked;
    const sinOferta = document.getElementById('sinOferta')?.checked;

    productos.forEach(producto => {
        let mostrar = true;
        
        const precio = parseFloat(producto.dataset.precio);
        const categoria = producto.dataset.categoria;
        const tieneOferta = producto.querySelector('.badge-oferta') !== null;

        if (precio > precioMaximo) {
            mostrar = false;
        }

        if (categoriasSeleccionadas.length > 0 && !categoriasSeleccionadas.includes(categoria)) {
            mostrar = false;
        }

        if (conOferta && !tieneOferta) {
            mostrar = false;
        }
        
        if (sinOferta && tieneOferta) {
            mostrar = false;
        }

        producto.classList.toggle('oculto', !mostrar);
    });
}

function limpiarFiltros() {
    document.getElementById('rangoPrecio').value = 10000;
    document.getElementById('precioMax').textContent = '10000';
    
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    document.querySelectorAll('.producto').forEach(producto => {
        producto.classList.remove('oculto');
    });
}