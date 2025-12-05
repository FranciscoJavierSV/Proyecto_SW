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

        // Solo cargar wishlist si el usuario está logueado
        let wishlistIds = [];
        const token = localStorage.getItem("token");

        if (token) {
            const wishlist = await obtenerWishlist();
            wishlistIds = wishlist.map(item => item.producto_id);
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

            const estaEnWishlistActual = wishlistIds.includes(prod.id);
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
        activarBotonesWishlist(); // Aquí se maneja la alerta si no hay token

    } catch (error) {
        console.error("Error al cargar productos:", error);
        grid.innerHTML = "<p>No se pudieron cargar los productos.</p>";
    }
}

function activarBotonesWishlist() {
    document.querySelectorAll('.btn-wishlist').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const productoId = btn.dataset.id;

            const token = localStorage.getItem("token");
            if (!token) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: "No has iniciado sesión",
                        text: "¿Deseas iniciar sesión para agregar productos a tu lista de deseos?",
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
                }
                return;
            }

            // Obtener wishlist actual
            const wishlist = await obtenerWishlist();
            const ids = wishlist.map(item => item.producto_id);
            const yaEsta = ids.includes(Number(productoId));

            if (yaEsta) {
                await eliminarDeWishlist(productoId);
            } else {
                await agregarAWishlist({ id: productoId });
            }

            // Actualizar corazones en toda la página
            actualizarCorazones();
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
    const precioMaximo = Number(document.getElementById('rangoPrecio')?.value);
    const categoriasSeleccionadas = Array.from(
      document.querySelectorAll('input[name="categoria"]:checked')
    ).map(cb => cb.value);
  
    const conOferta = !!document.getElementById('conOferta')?.checked;
    const sinOferta = !!document.getElementById('sinOferta')?.checked;
 
    const base = '/public/filtros';
    const params = new URLSearchParams();
 
    // Categoría
    categoriasSeleccionadas.forEach(cat => {
        params.append('categoria', cat);
    });
 
    // Precio
    if (!Number.isNaN(precioMaximo) && precioMaximo >= 0) {
      params.set('min', 0);
      params.set('max', precioMaximo);
    }
 
    // Oferta
    if (conOferta && !sinOferta) params.set('oferta', 'si');
    else if (!conOferta && sinOferta) params.set('oferta', 'no');
 
    const url = params.toString() ? `${base}?${params.toString()}` : base;
 
    const res = await apiGet(url);
    const productos = res.products || [];
 
    renderProductos(productos);
 
  } catch (err) {
    console.error("Error en aplicar filtros:", err);
    renderProductos([]);
  }
}

async function renderProductos(productos) {
    const contenedor = document.querySelector(".grid-productos");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (!productos || productos.length === 0) {
        contenedor.innerHTML = "<p>No hay productos disponibles.</p>";
        return;
    }

    // Solo cargar wishlist si el usuario está logueado
    let wishlistIds = [];
    const token = localStorage.getItem("token");

    if (token) {
        const wishlist = await obtenerWishlist();
        wishlistIds = wishlist.map(item => item.producto_id);
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

        // Si no hay token → wishlistIds = [] → corazones vacíos
        const estaEnWishlistActual = wishlistIds.includes(prod.id);
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
    activarBotonesWishlist(); // Maneja alerta si no hay token
}

function limpiarFiltros() {
    const slider = document.getElementById('rangoPrecio');
    const precioMax = document.getElementById('precioMax');

    if (slider) slider.value = 100;
    if (precioMax) precioMax.textContent = '100';

    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    cargarProductos();
}