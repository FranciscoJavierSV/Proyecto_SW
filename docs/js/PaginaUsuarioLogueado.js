document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("username");
    const nombreSpan = document.querySelector(".usuario-nombre");

    if (username && nombreSpan) {
        nombreSpan.textContent = `Hola, ${username}`;
    }
 
    const carritoIcon = document.getElementById("carrito-icon");
    const panelCarrito = document.getElementById("panelCarrito");
    const cerrarBtn = document.getElementById("cerrarCarrito");

    console.log("carritoIcon:", carritoIcon);
    console.log("panelCarrito:", panelCarrito);
    console.log("cerrarBtn:", cerrarBtn);

    if (carritoIcon && panelCarrito) {
        carritoIcon.addEventListener("click", (e) => {
            e.stopPropagation();
            console.log("🛒 Click en carrito detectado!");
            console.log("Right ANTES:", panelCarrito.style.right);
            
            panelCarrito.style.right = "0px";
            panelCarrito.style.display = "flex";
            
            console.log("Right DESPUÉS:", panelCarrito.style.right);
            
            cargarCarrito();
        });
    }

    if (cerrarBtn) {
        cerrarBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            console.log("Cerrando carrito");
            panelCarrito.style.right = "-380px";
        });
    }

    document.addEventListener("click", (e) => {
        if (panelCarrito && carritoIcon) {
            const clickDentroCarrito = panelCarrito.contains(e.target);
            const clickEnIcono = carritoIcon.contains(e.target);
            const estiloRight = window.getComputedStyle(panelCarrito).right;
            const carritoAbierto = estiloRight === "0px";
            
            if (!clickDentroCarrito && !clickEnIcono && carritoAbierto) {
                panelCarrito.style.right = "-380px";
            }
        }
    });

    const token = localStorage.getItem("token");
    if (token) {
        actualizarBadgeCarrito();
    }

    cargarProductos();

    const logoutBtn = document.querySelector(".logout-btn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (event) {
            event.preventDefault(); 

            if (typeof window.limpiarAccesibilidadAlCerrarSesion === 'function') {
                window.limpiarAccesibilidadAlCerrarSesion();
            }

            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("refreshToken");

            window.location.href = "../index.html";
        });
    }
});

async function cargarProductos() {
    const grid = document.querySelector(".productos-grid");

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
            card.classList.add("producto-card");
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
                <div class="producto-info">
                    <h3>${prod.nombre}</h3>
                    <h4>${prod.descripcion || 'Sin descripción'}</h4>
                    <p class="precio">$${precioMostrar}</p>
                    ${tieneOferta && !sinStock ? `<p class="precio-anterior">Antes: $${prod.precio}</p>` : ''}
                    <button class="btn-agregar" data-id="${prod.id}" ${sinStock ? 'disabled' : ''}>
                        ${sinStock ? 'No disponible' : 'Agregar al carrito'}
                    </button>
                </div>
            `;

            if (sinStock) {
                card.classList.add("sin-stock");
            }

            grid.appendChild(card);
        });

        activarBotonesCarrito();

    } catch (error) {
        console.error("Error al cargar productos:", error);
        grid.innerHTML = "<p>No se pudieron cargar los productos.</p>";
    }
}

async function actualizarBadgeCarrito() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const carritoCountElem = document.getElementById("carrito-count");
    
    try {
        const data = await apiGet("/auth/cart", {
            Authorization: "Bearer " + token,
        });

        if (data.success && Array.isArray(data.cart)) {
            const cantidadTotal = data.cart.reduce((sum, item) => sum + item.cantidad, 0);
            carritoCountElem.textContent = cantidadTotal;
        }
    } catch (error) {
        console.error("Error actualizando badge:", error);
    }
}