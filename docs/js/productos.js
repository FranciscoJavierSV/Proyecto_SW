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
            const estaEnWishlistActual = typeof estaEnWishlist === 'function' && estaEnWishlist(prod.id);
            const iconoCorazon = estaEnWishlistActual ? '❤️' : '🤍';
            const claseActiva = estaEnWishlistActual ? 'active' : '';

            card.innerHTML = `
                ${tieneOferta ? '<span class="badge-oferta">¡OFERTA!</span>' : ''}
                ${sinStock ? '<span class="badge-sin-stock">Agotado</span>' : ''}
                <button class="btn-wishlist ${claseActiva}" data-id="${prod.id}" title="Agregar a lista de deseos">
                    ${iconoCorazon}
                </button>
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

        activarBotonesCarrito();
        activarBotonesWishlist();

    } catch (error) {
        console.error("Error al cargar productos:", error);
        grid.innerHTML = "<p>No se pudieron cargar los productos.</p>";
    }
}

function activarBotonesWishlist() {
    document.querySelectorAll('.btn-wishlist').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productoId = btn.dataset.id;

            const productoCard = btn.closest('.producto');
            const nombre = productoCard.querySelector('h3').textContent;
            const descripcion = productoCard.querySelector('.descripcion').textContent;
            const imagen = productoCard.querySelector('img').src.split('/').pop();
            const precioTexto = productoCard.querySelector('.precio').textContent;
            const precio = parseFloat(precioTexto.replace(/[^0-9.]/g, ''));
            
            const precioOfertaElem = productoCard.querySelector('.precio-oferta');
            const ofertaP = precioOfertaElem ? parseFloat(precioOfertaElem.textContent.replace(/[^0-9.]/g, '')) : 0;
            
            const producto = {
                id: productoId,
                nombre: nombre,
                descripcion: descripcion,
                imagen: imagen,
                precio: precio,
                ofertaP: ofertaP,
                categoria: productoCard.dataset.categoria
            };
            if (typeof estaEnWishlist === 'function' && estaEnWishlist(productoId)) {
                if (typeof eliminarDeWishlist === 'function') {
                    eliminarDeWishlist(productoId);
                }
            } else {
                if (typeof agregarAWishlist === 'function') {
                    agregarAWishlist(producto);
                }
            }
            if (typeof actualizarCorazones === 'function') {
                actualizarCorazones();
            }
        });
    });
}

function activarBotonesCarrito() {
    const botones = document.querySelectorAll(".btn-agregar");

    botones.forEach(btn => {
        btn.addEventListener("click", () => {
            const token = localStorage.getItem("token");

            if (!token) {
                Swal.fire({
                    title: "No has iniciado sesión",
                    text: "¿Deseas iniciar sesión para agregar productos al carrito?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#8b6b4a",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Ir a iniciar sesión",
                    cancelButtonText: "Cancelar"
                }).then(result => {
                    if (result.isConfirmed) {
                        window.location.href = "../html/IniciarSesion.html"; 
                    }
                });
                return;
            }
        });
    });

    const btnCarrito = document.querySelector(".carrito");
    if (btnCarrito) {
        btnCarrito.addEventListener("click", () => {
            const token = localStorage.getItem("token");

            if (!token) {
                Swal.fire({
                    title: "No has iniciado sesión",
                    text: "¿Deseas iniciar sesión para agregar productos al carrito?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#8b6b4a",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Ir a iniciar sesión",
                    cancelButtonText: "Cancelar"
                }).then(result => {
                    if (result.isConfirmed) {
                        window.location.href = "../html/IniciarSesion.html"; 
                    }
                });
                return;
            }
        });
    }
}

async function aplicarFiltros() {
  try {
    const precioMaximo = Number(document.getElementById('rangoPrecio')?.value);
    const categoriasSeleccionadas = Array.from(
      document.querySelectorAll('input[name="categoria"]:checked')
    ).map(cb => cb.value);

    const conOferta = !!document.getElementById('conOferta')?.checked;
    const sinOferta = !!document.getElementById('sinOferta')?.checked;

    let url = '/public/filtros';

    // PRIORIDAD 1: Categoría
    if (categoriasSeleccionadas.length > 0) {
      url += `?categoria=${encodeURIComponent(categoriasSeleccionadas[0])}`;
    }

    // PRIORIDAD 2: Precio
    else if (!Number.isNaN(precioMaximo) && precioMaximo >= 0) {
      url += `?min=0&max=${precioMaximo}`;
    }

    // PRIORIDAD 3: Oferta
    else if (conOferta && !sinOferta) {
      url += `?oferta=si`;
    } else if (!conOferta && sinOferta) {
      url += `?oferta=no`;
    }

    console.log("[aplicarFiltros] URL ->", url);

    const res = await apiGet(url);
    const productos = res.products || [];

    renderProductos(productos);

  } catch (err) {
    console.error("Error en aplicar filtros:", err);
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

        const estaEnWishlistActual = typeof estaEnWishlist === 'function' && estaEnWishlist(prod.id);
        const iconoCorazon = estaEnWishlistActual ? '❤️' : '🤍';
        const claseActiva = estaEnWishlistActual ? 'active' : '';

        card.innerHTML = `
            ${tieneOferta ? '<span class="badge-oferta">¡OFERTA!</span>' : ''}
            ${sinStock ? '<span class="badge-sin-stock">Agotado</span>' : ''}
            <button class="btn-wishlist ${claseActiva}" data-id="${prod.id}" title="Agregar a lista de deseos">
                ${iconoCorazon}
            </button>
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

    activarBotonesCarrito();
    activarBotonesWishlist(); 
}
function limpiarFiltros() {
    // Reset slider
    const slider = document.getElementById('rangoPrecio');
    const precioMax = document.getElementById('precioMax');

    if (slider) slider.value = 100;
    if (precioMax) precioMax.textContent = '100';

    // Reset checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    // Recargar todos los productos desde el backend
    cargarProductos();
}