document.addEventListener("DOMContentLoaded", () => {
    // MOSTRAR NOMBRE DEL ADMIN LOGUEADO
    const username = localStorage.getItem("username");
    const nombreSpan = document.querySelector(".admin-name");

    // Si existe un usuario guardado, mostrarlo en la interfaz
    if (username && nombreSpan) {
        nombreSpan.textContent = `Hola ${username} / Administrador`;
    }

    // CERRAR SESIÓN
    const logoutBtn = document.querySelector(".logout-btn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (event) {
            event.preventDefault();

            // Eliminar credenciales del almacenamiento local
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("refreshToken");

            // Redirigir al inicio
            window.location.href = "../index.html";
        });
    }

    // Cargar productos al iniciar la página
    cargarProductos();
});


/* ============================================================
   CARGAR LISTA DE PRODUCTOS PARA ELIMINAR
============================================================ */
async function cargarProductos() {
    const deleteList = document.querySelector(".delete-list");

    if (!deleteList) return; // Si no existe el contenedor, no continúa

    try {
        const data = await apiGet("/public/products"); // Obtener productos del backend

        // Si hubo error en la API
        if (!data.success) {
            deleteList.innerHTML = `
                <div class="table-header">
                    <span>Imagen</span>
                    <span>Nombre</span>
                    <span>Stock</span>
                    <span>Categoría</span>
                    <span>Acción</span>
                </div>
                <p style="text-align: center; padding: 20px; color: #e57d90;">Error al cargar productos.</p>
            `;
            return;
        }

        // Encabezado de la tabla
        deleteList.innerHTML = `
            <div class="table-header">
                <span>Imagen</span>
                <span>Nombre</span>
                <span>Stock</span>
                <span>Categoría</span>
                <span>Acción</span>
            </div>
        `;

        // Si no hay productos
        if (data.products.length === 0) {
            deleteList.innerHTML += `
                <p style="text-align: center; padding: 30px; color: #7a7a7a; grid-column: 1 / -1;">
                    No hay productos disponibles para eliminar.
                </p>
            `;
            return;
        }

        // Crear cada fila de producto
        data.products.forEach(prod => {
            const productItem = document.createElement("div");
            productItem.classList.add("product-item");

            productItem.innerHTML = `
                <img src="../ImagenesGenerales/${prod.imagen}" alt="${prod.nombre}" class="product-image">
                <h4>${prod.nombre}</h4>
                <p><strong>${prod.inventario}</strong></p>
                <p>${prod.categoria}</p>
                <button class="btn-delete" data-id="${prod.id}">Eliminar</button>
            `;

            deleteList.appendChild(productItem);
        });

        // Asignar evento a cada botón de eliminar
        document.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", confirmarEliminacion);
        });

    } catch (error) {
        console.error("Error al cargar productos:", error);

        // Mostrar mensaje de error si la API falla
        deleteList.innerHTML = `
            <div class="table-header">
                <span>Imagen</span>
                <span>Nombre</span>
                <span>Stock</span>
                <span>Categoría</span>
                <span>Acción</span>
            </div>
            <p style="text-align: center; padding: 20px; color: #e57d90;">No se pudieron cargar los productos.</p>
        `;
    }
}


/* ============================================================
   CONFIRMAR Y ELIMINAR PRODUCTO
============================================================ */
async function confirmarEliminacion(e) {
    const id = e.target.dataset.id; // ID del producto a eliminar

    // Mostrar alerta de confirmación
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción es permanente y no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#95a5a6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    // Si el usuario cancela, no hace nada
    if (!result.isConfirmed) return;

    try {
        const token = localStorage.getItem("token");

        // Llamada a la API para eliminar el producto
        const res = await apiDelete(`/account/mProducts/${id}`, {
            Authorization: `Bearer ${token}`
        });

        // Si la API devuelve error
        if (!res.success) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: res.message || 'No se pudo eliminar el producto'
            });
            return;
        }

        // Eliminación exitosa
        await Swal.fire({
            icon: 'success',
            title: '¡Eliminado!',
            text: 'Producto eliminado correctamente',
            timer: 2000,
            showConfirmButton: false
        });

        // Recargar lista de productos
        cargarProductos();

    } catch (error) {
        console.error("Error al eliminar producto:", error);

        // Error inesperado
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar el producto. Intenta nuevamente.'
        });
    }
}