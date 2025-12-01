document.addEventListener("DOMContentLoaded", () => {
    // ===================================
    // MOSTRAR NOMBRE DEL USUARIO LOGUEADO
    // ===================================
    const username = localStorage.getItem("username");
    const nombreSpan = document.querySelector(".usuario-nombre");

    if (username && nombreSpan) {
        nombreSpan.textContent = `Hola, ${username}`;
    }

    // ===================================
    // MOSTRAR / OCULTAR CARRITO
    // ===================================
    const carritoIcon = document.getElementById("carrito-icon");
    const panelCarrito = document.getElementById("panelCarrito");
    const cerrarBtn = document.getElementById("cerrarCarrito");
    
    if (carritoIcon) {
        carritoIcon.addEventListener("click", () => {
            panelCarrito.style.right = "0";
            cargarCarrito();
        });
    }
    if (cerrarBtn) {
        cerrarBtn.addEventListener("click", () => {
            panelCarrito.style.right = "-380px";
        });
    }

    // ===================================
    // CARGAR PRODUCTOS DESDE BACKEND
    // ===================================
    cargarProductos();
});

async function cargarProductos() {
    const grid = document.querySelector(".productos-grid");

    if (!grid) return;

    try {
        const res = await fetch(`${API_URL}/public/products`);
        const data = await res.json();

        if (!data.success) {
            grid.innerHTML = "<p>Error al cargar productos.</p>";
            return;
        }

        grid.innerHTML = ""; // limpia los productos estáticos

        data.products.forEach(prod => {
            const card = document.createElement("div");
            card.classList.add("producto-card");

            card.innerHTML = `
                <img src="../ImagenesGenerales/${prod.imagen}" alt="${prod.nombre}">
                <div class="producto-info">
                    <h3>${prod.nombre}</h3>
                    <p class="precio">$${prod.precio}</p>
                    <button class="btn-agregar" data-id="${prod.id}">Agregar al carrito</button>
                </div>
            `;

            grid.appendChild(card);
        });

        activarBotonesCarrito();

    } catch (error) {
        console.error("Error al cargar productos:", error);
        grid.innerHTML = "<p>No se pudieron cargar los productos.</p>";
    }
}

function activarBotonesCarrito() {
    const token = localStorage.getItem("token");

    document.querySelectorAll(".btn-agregar").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;

            const res = await fetch(`${API_URL}/auth/cart`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    productId: id,
                    quantity: 1
                })
            });

            const data = await res.json();

            if (data.success) {
                alert("Producto agregado al carrito");
                cargarCarrito();  // recarga solo la vista
            } else {
                alert(data.message || "Error al agregar producto");
            }
        });
    });
}

async function cargarCarrito() {
    const token = localStorage.getItem("token");
    const contenedor = document.querySelector(".carrito-productos");
    const subtotalElem = document.getElementById("subtotal");
    const ivaElem = document.getElementById("iva");
    const totalElem = document.getElementById("total");

    try {
        const res = await fetch(`${API_URL}/auth/cart`, {
            headers: { "Authorization": "Bearer " + token }
        });

        const data = await res.json();
        console.log("Respuesta del servidor carrito:", data);
        if (!data.success) {
            contenedor.innerHTML = "<p>Error al cargar carrito.</p>";
            return;
        }

        const cart = data.cart;

        if (!Array.isArray(cart) || cart.length === 0) {
            contenedor.innerHTML = '<p class="carrito-vacio">No hay productos aún.</p>';
            subtotalElem.textContent = "$0";
            ivaElem.textContent = "$0";
            totalElem.textContent = "$0";
            return;
        }

        contenedor.innerHTML = ""; // limpiar

        let subtotalTotal = 0;
        let ivaTotal = 0;
        let totalGeneral = 0;

        cart.forEach(item => {
            subtotalTotal += parseFloat(item.subtotal);
            ivaTotal += parseFloat(item.iva);
            totalGeneral += parseFloat(item.total);

            const div = document.createElement("div");
            div.classList.add("carrito-item");

            div.innerHTML = `
                <img src="../ImagenesGenerales/${item.imagen}" class="carrito-img">
                <div class="carrito-detalle">
                    <p>${item.nombre}</p>
                    <p>Cantidad: ${item.cantidad}</p>
                    <p>$${item.precio * item.cantidad}</p>
                </div>
                <button class="btn-eliminar" data-id="${item.id}">❌</button>
            `;

            contenedor.appendChild(div);
        });

        subtotalElem.textContent = `$${subtotalTotal.toFixed(2)}`;
        ivaElem.textContent = `$${ivaTotal.toFixed(2)}`;
        totalElem.textContent = `$${totalGeneral.toFixed(2)}`;

        activarBotonesEliminar();

    } catch (error) {
        console.error("Error cargando carrito:", error);
        contenedor.innerHTML = "<p>Error al cargar carrito.</p>";
    }
}

function activarBotonesEliminar() {
    const botones = document.querySelectorAll(".btn-eliminar");

    botones.forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            const token = localStorage.getItem("token");

            const res = await fetch(`${API_URL}/auth/cart/${id}`, {
                method: "DELETE",
                headers: { "Authorization": "Bearer " + token }
            });

            const data = await res.json();

            if (data.success) {
                console.log("Producto eliminado correctamente");
                cargarCarrito(); // refrescar
            } else {
                alert(data.message || "Error al eliminar producto");
            }
        });
    });
}

