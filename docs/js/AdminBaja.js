document.addEventListener("DOMContentLoaded", () => {
    // MOSTRAR NOMBRE DEL ADMIN LOGUEADO
    const username = localStorage.getItem("username");
    const nombreSpan = document.querySelector(".admin-name");

    if (username && nombreSpan) {
        nombreSpan.textContent = `Hola ${username} / Administrador`;
    }

    // CERRAR SESIÓN    
    const logoutBtn = document.querySelector(".logout-btn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (event) {
            event.preventDefault(); 

            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("refreshToken");

            window.location.href = "../index.html";
        });
    }

    cargarProductos();
}); 

async function cargarProductos() {
    const deleteList = document.querySelector(".delete-list");

    if (!deleteList) return;

    try {
        const data = await apiGet("/public/products");

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
        deleteList.innerHTML = `
            <div class="table-header">
                <span>Imagen</span>
                <span>Nombre</span>
                <span>Stock</span>
                <span>Categoría</span>
                <span>Acción</span>
            </div>
        `;

        if (data.products.length === 0) {
            deleteList.innerHTML += `
                <p style="text-align: center; padding: 30px; color: #7a7a7a; grid-column: 1 / -1;">
                    No hay productos disponibles para eliminar.
                </p>
            `;
            return;
        }

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

        document.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", confirmarEliminacion);
        });

    } catch (error) {
        console.error("Error al cargar productos:", error);
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

async function confirmarEliminacion(e) {
    const id = e.target.dataset.id;
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

    if (!result.isConfirmed) return;

    try {
        const token = localStorage.getItem("token");

        const res = await apiDelete(`/account/mProducts/${id}`, {
            Authorization: `Bearer ${token}`
        });

        if (!res.success) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: res.message || 'No se pudo eliminar el producto'
            });
            return;
        }

        await Swal.fire({
            icon: 'success',
            title: '¡Eliminado!',
            text: 'Producto eliminado correctamente',
            timer: 2000,
            showConfirmButton: false
        });
        cargarProductos();

    } catch (error) {
        console.error("Error al eliminar producto:", error);
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar el producto. Intenta nuevamente.'
        });
    }
}