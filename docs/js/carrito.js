function activarBotonesCarrito() {

  document.querySelectorAll(".btn-agregar").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        alertaError("Debes iniciar sesión para agregar productos.");
        return;
      }

      const productId = btn.dataset.id;

      const data = await apiPost(
        "/auth/cart",
        { productId, quantity: 1 },
        { Authorization: "Bearer " + token }
      );
 
       console.log("Respuesta agregar:", data); // <-- IMPORTANTE

      if (data.success) {
        cargarCarrito();
      } else {
        alertaError(data.message || "Error al agregar producto");
      }
    });
  });
} 
 
async function cargarCarrito() {
  const token = localStorage.getItem("token");
  
  // Si no hay token, no hacer nada
  if (!token) {
    console.log("No hay token, usuario no logueado");
    return;
  }

  const contenedor = document.querySelector(".carrito-productos");
  const subtotalElem = document.getElementById("subtotal");
  const ivaElem = document.getElementById("iva");
  const totalElem = document.getElementById("total");
  const carritoCountElem = document.getElementById("carrito-count");

  try {
    const data = await apiGet("/auth/cart", {
      Authorization: "Bearer " + token,
    });

    console.log("Respuesta del servidor carrito:", data);
    
    if (!data.success) {
      contenedor.innerHTML = "<p>Error al cargar carrito.</p>";
      return;
    }

    const cart = data.cart;

    const cantidadTotal = cart.reduce((sum, item) => sum + item.cantidad, 0);
    carritoCountElem.textContent = cantidadTotal;

    if (!Array.isArray(cart) || cart.length === 0) {
      contenedor.innerHTML = '<p class="carrito-vacio">No hay productos aún.</p>';
      subtotalElem.textContent = "$0";
      ivaElem.textContent = "$0";
      totalElem.textContent = "$0";
      return;
    }

    contenedor.innerHTML = ""; // limpiar

    cart.forEach((item) => {
      const div = document.createElement("div");
      div.classList.add("carrito-item");

      div.innerHTML = `
        <img src="../ImagenesGenerales/${item.imagen}" class="carrito-img">
        <div class="carrito-detalle">
          <p>${item.nombre}</p>
          <div class="cantidad-control">
            <button class="btn-menos" data-product-id="${item.producto_id}">-</button>
            <span class="cantidad">${item.cantidad}</span>
            <button class="btn-mas" data-product-id="${item.producto_id}">+</button>
          </div>
          <p>$${Number(item.subtotal).toFixed(2)}</p>
        </div>
        <button class="btn-eliminar" data-cart-id="${item.id}">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      `;

      contenedor.appendChild(div);
    });


    const resumen = data.resumen;

    subtotalElem.textContent = `$${resumen.subtotal.toFixed(2)}`;
    ivaElem.textContent = `$${resumen.iva.toFixed(2)}`;
    document.getElementById("envio").textContent = `$${resumen.envio.toFixed(2)}`;
    totalElem.textContent = `$${resumen.totalFinal.toFixed(2)}`;


    activarBotonesEliminar();
    activarBotonesCantidad();
  } catch (error) {
    console.error("Error cargando carrito:", error);
    contenedor.innerHTML = "<p>Error al cargar carrito.</p>";
  }
}

function activarBotonesEliminar() {
  const botones = document.querySelectorAll(".btn-eliminar");

  botones.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const cartId = btn.dataset.cartId;
      const token = localStorage.getItem("token");

      const data = await apiDelete(`/auth/cart/${cartId}`, {
        Authorization: "Bearer " + token,
      });

      if (data.success) {
        cargarCarrito();
      } else {
        alertaError(data.message);
      }
    });
  });
}

function activarBotonesCantidad() {
  // Botones +
  document.querySelectorAll(".btn-mas").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const productId = btn.dataset.productId;
      const token = localStorage.getItem("token");

      await apiPatch(
        `/auth/cart/${productId}`,
        { action: "add" },
        { Authorization: "Bearer " + token }
      );

      cargarCarrito();
    });
  });

  // Botones -
  document.querySelectorAll(".btn-menos").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const productId = btn.dataset.productId;
      const token = localStorage.getItem("token");

      await apiPatch(
        `/auth/cart/${productId}`,
        { action: "remove" },
        { Authorization: "Bearer " + token }
      );

      cargarCarrito();
    });
  });
}