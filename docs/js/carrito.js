function activarBotonesCarrito() {

  // Selecciona todos los botones "Agregar al carrito"
  document.querySelectorAll(".btn-agregar").forEach((btn) => {

    btn.addEventListener("click", async () => {

      const token = localStorage.getItem("token");

      // Si no hay sesión, no permite agregar
      if (!token) {
        alertaError("Debes iniciar sesión para agregar productos.");
        return;
      }

      // ID del producto desde el atributo data-id
      const productId = btn.dataset.id;

      // Petición al backend para agregar 1 unidad del producto
      const data = await apiPost(
        "/auth/cart",
        { productId, quantity: 1 },
        { Authorization: "Bearer " + token }
      );

      console.log("Respuesta agregar:", data);

      // Si se agregó correctamente
      if (data.success) {
        Swal.fire({
          text: "Producto agregado al carrito 🛒",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });

        // Recargar carrito visual
        cargarCarrito();

      } else {
        alertaError(data.message || "Error al agregar producto");
      }
    });
  });
}


async function cargarCarrito() {

  const token = localStorage.getItem("token");

  // Si no hay token, no cargar nada
  if (!token) {
    console.log("No hay token, usuario no logueado");
    return;
  }

  // Elementos del DOM donde se mostrará el carrito
  const contenedor = document.querySelector(".carrito-productos");
  const subtotalElem = document.getElementById("subtotal");
  const ivaElem = document.getElementById("iva");
  const totalElem = document.getElementById("total");
  const carritoCountElem = document.getElementById("carrito-count");

  try {
    // Obtener carrito desde el backend
    const data = await apiGet("/auth/cart", {
      Authorization: "Bearer " + token,
    });

    console.log("Respuesta del servidor carrito:", data);

    // Si hubo error en la API
    if (!data.success) {
      contenedor.innerHTML = "<p>Error al cargar carrito.</p>";
      return;
    }

    const cart = data.cart;

    // Calcular cantidad total de productos
    const cantidadTotal = cart.reduce((sum, item) => sum + item.cantidad, 0);
    carritoCountElem.textContent = cantidadTotal;

    // Si el carrito está vacío
    if (!Array.isArray(cart) || cart.length === 0) {
      contenedor.innerHTML = '<p class="carrito-vacio">No hay productos aún.</p>';
      subtotalElem.textContent = "$0";
      ivaElem.textContent = "$0";
      totalElem.textContent = "$0";
      return;
    }

    // Limpiar contenedor antes de renderizar
    contenedor.innerHTML = "";

    // Renderizar cada producto del carrito
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

    // Resumen de totales
    const resumen = data.resumen;

    subtotalElem.textContent = `$${resumen.subtotal.toFixed(2)}`;
    ivaElem.textContent = `$${resumen.iva.toFixed(2)}`;
    document.getElementById("envio").textContent = `$${resumen.envio.toFixed(2)}`;
    totalElem.textContent = `$${resumen.totalFinal.toFixed(2)}`;

    // Activar botones de eliminar y +/- cantidad
    activarBotonesEliminar();
    activarBotonesCantidad();

  } catch (error) {
    console.error("Error cargando carrito:", error);
    contenedor.innerHTML = "<p>Error al cargar carrito.</p>";
  }
}

function activarBotonesEliminar() {
  // Selecciona todos los botones de eliminar dentro del carrito
  const botones = document.querySelectorAll(".btn-eliminar");

  botones.forEach((btn) => {
    btn.addEventListener("click", async () => {
      // ID del registro del carrito (no del producto)
      const cartId = btn.dataset.cartId;
      const token = localStorage.getItem("token");

      // Petición DELETE al backend para eliminar un ítem del carrito
      const data = await apiDelete(`/auth/cart/${cartId}`, {
        Authorization: "Bearer " + token,
      });

      // Si se eliminó correctamente, recargar carrito
      if (data.success) {
        cargarCarrito();
      } else {
        alertaError(data.message);
      }
    });
  });
}

function activarBotonesCantidad() {
  // Botones para aumentar cantidad (+)
  document.querySelectorAll(".btn-mas").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const productId = btn.dataset.productId; // ID del producto
      const token = localStorage.getItem("token");

      // Petición PATCH para aumentar cantidad
      await apiPatch(
        `/auth/cart/${productId}`,
        { action: "add" },
        { Authorization: "Bearer " + token }
      );

      // Recargar carrito para reflejar cambios
      cargarCarrito();
    });
  });

  // Botones para disminuir cantidad (-)
  document.querySelectorAll(".btn-menos").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const productId = btn.dataset.productId; // ID del producto
      const token = localStorage.getItem("token");

      // Petición PATCH para disminuir cantidad
      await apiPatch(
        `/auth/cart/${productId}`,
        { action: "remove" },
        { Authorization: "Bearer " + token }
      );

      // Recargar carrito para reflejar cambios
      cargarCarrito();
    });
  });
}