document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    inicializarFiltros();
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
            card.dataset.categoria = prod.categoria || "";
            card.dataset.precio = prod.precio || 0;
            card.dataset.inventario = prod.inventario || 0;

            const tieneOferta = prod.ofertaP && prod.ofertaP > 0;
            const precioMostrar = tieneOferta ? prod.ofertaP : prod.precio;
            const sinStock = !prod.inventario || parseInt(prod.inventario) === 0;

            console.log(`Producto: ${prod.nombre}, Inventario: ${prod.inventario}, Sin stock: ${sinStock}`);

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

async function aplicarFiltros() {
  try {
    const rangoInput = document.getElementById('rangoPrecio');
    const precioMaximo = rangoInput ? Number(rangoInput.value) : NaN;

    const categoriasSeleccionadas = Array.from(
      document.querySelectorAll('input[name="categoria"]:checked')
    ).map(cb => cb.value);

    const conOferta = !!document.getElementById('conOferta')?.checked;
    const sinOferta = !!document.getElementById('sinOferta')?.checked;

    const base = '/public/products';
    const params = new URLSearchParams();

    // precio: solo si es número (>=0)
    if (!Number.isNaN(precioMaximo) && precioMaximo >= 0) {
      params.set('min', 0);
      params.set('max', precioMaximo);
    }

    // categoría: enviar la primera seleccionada 
    if (categoriasSeleccionadas.length > 0) {
      params.set('categoria', categoriasSeleccionadas[0]);
    }

    if (conOferta && !sinOferta) params.set('oferta', 'si');
    else if (!conOferta && sinOferta) params.set('oferta', 'no');

    const url = params.toString() ? `${base}?${params.toString()}` : base;
    console.log('[aplicarFiltros] URL ->', url);

    const res = await apiGet(url); 

    console.log('[aplicarFiltros] respuesta ->', res);

    let productos = res.products || res.product || [];

    // Aplicar filtrado final en frontend 
    let resultado = productos.slice();

    if (!Number.isNaN(precioMaximo) && precioMaximo >= 0) {
      resultado = resultado.filter(p => {
        const tieneOferta = p.ofertaP && Number(p.ofertaP) > 0;
        const precioReal = tieneOferta ? Number(p.ofertaP) : Number(p.precio);
        return !Number.isNaN(precioReal) && precioReal <= precioMaximo;
      });
    }

    if (categoriasSeleccionadas.length > 0) {
      resultado = resultado.filter(p => categoriasSeleccionadas.includes(p.categoria));
    }

    if (conOferta && !sinOferta) {
      resultado = resultado.filter(p => p.ofertaP && Number(p.ofertaP) > 0);
    } else if (!conOferta && sinOferta) {
      resultado = resultado.filter(p => !p.ofertaP || p.ofertaP === '' || Number(p.ofertaP) === 0);
    }

    renderProductos(resultado);

  }catch (err) {
    console.error('Error en aplicar filtros: ', err);
    renderProductos([]);
  }
}

function renderProductos(productos) {
    const contenedor = document.querySelector(".grid-productos");
    if (!contenedor) return;
    
    contenedor.innerHTML = "";

    if (!productos || productos.length === 0) {
        contenedor.innerHTML = "<p>No hay productos disponibles.</p>";
        return;
    }

    productos.forEach(prod => {
        const card = document.createElement("div");
        card.classList.add("producto");
        card.dataset.categoria = prod.categoria || "";

        const tieneOferta = prod.ofertaP && prod.ofertaP > 0;
        const precioMostrar = tieneOferta ? prod.ofertaP : prod.precio;
        card.dataset.precio = precioMostrar;
        card.dataset.inventario = prod.inventario || 0;

        const sinStock = !prod.inventario || parseInt(prod.inventario) === 0;

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

        contenedor.appendChild(card);
    });

    if (typeof activarBotonesCarrito === 'function') {
        activarBotonesCarrito();
    }
}

function limpiarFiltros() {
    document.getElementById('rangoPrecio').value = 100;
    document.getElementById('precioMax').textContent = '100';
    
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    document.querySelectorAll('.producto').forEach(producto => {
        producto.classList.remove('oculto');
    });

    cargarProductos();
}