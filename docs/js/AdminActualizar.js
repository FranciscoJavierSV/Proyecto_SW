let selectedProductId = null;              // ID del producto seleccionado para editar
let currentImageName = null;               // Guarda el nombre de la imagen actual del producto

document.addEventListener("DOMContentLoaded", () => {

    // Mostrar nombre del administrador logueado
    const username = localStorage.getItem("username");
    const nombreSpan = document.querySelector(".admin-name");

    if (username && nombreSpan) {
        nombreSpan.textContent = `Hola ${username} / Administrador`;
    }

    // Botón de cerrar sesión
    const logoutBtn = document.querySelector(".logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (event) => {
            event.preventDefault();
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("refreshToken");
            window.location.href = "../index.html"; // Redirige al inicio
        });
    }

    // Cargar productos al iniciar la página
    cargarProductos();
});


// ---------------------- VARIABLES IMPORTANTES ----------------------

const form = document.getElementById("updateForm");       // Formulario de actualización
const imagenInput = document.getElementById("imagen");    // Input de imagen
const imagePreview = document.getElementById("imagePreview"); // Contenedor de vista previa
const btnUpdate = document.getElementById("btnUpdate");   // Botón de actualizar

let token = localStorage.getItem("token");                // Token del usuario logueado

// Vista previa de imagen al seleccionar un archivo
imagenInput.addEventListener("change", () => {
    if (imagenInput.files && imagenInput.files[0]) {
        const newImgURL = URL.createObjectURL(imagenInput.files[0]); // Crea URL temporal
        imagePreview.innerHTML = `
            <img src="${newImgURL}" style="max-width: 150px;">
        `;
    }
});


// ---------------------- CARGAR PRODUCTOS ----------------------

async function cargarProductos() {
    const grid = document.querySelector(".products-grid");
    if (!grid) return;

    try {
        const data = await apiGet("/public/products"); // Obtiene productos del backend

        if (!data.success) {
            grid.innerHTML = "<p>Error al cargar productos.</p>";
            return;
        }

        grid.innerHTML = ""; // Limpia el grid

        // Crear tarjetas de productos
        data.products.forEach(prod => {
            const card = document.createElement("div");
            card.classList.add("product-card");

            card.innerHTML = `
                <img src="../ImagenesGenerales/${prod.imagen}" alt="${prod.nombre}">
                <h3>${prod.nombre}</h3>
                <p>Stock: ${prod.inventario}</p>
                <span class="category-tag">${prod.categoria}</span>
            `;

            // Al hacer clic, se selecciona el producto
            card.addEventListener("click", () => {
                selectProduct(prod);
            });

            grid.appendChild(card);
        });

    } catch (err) {
        console.error(err);
    }
}


// ---------------------- SELECCIONAR PRODUCTO ----------------------

function selectProduct(prod) {
    selectedProductId = prod.id;         // Guarda ID del producto
    currentImageName = prod.imagen;      // Guarda imagen actual

    // Rellena los campos del formulario con los datos del producto
    document.getElementById("nombre").value = prod.nombre;
    document.getElementById("descripcion").value = prod.descripcion;
    document.getElementById("precio").value = prod.precio;
    document.getElementById("stock").value = prod.inventario;
    document.getElementById("categoria").value = prod.categoria;
    document.getElementById("ofertaP").value = prod.ofertaP || "";

    // Muestra la imagen actual
    imagePreview.innerHTML = `
        <img src="../ImagenesGenerales/${prod.imagen}" style="max-width: 150px;">
    `;

    btnUpdate.disabled = false; // Habilita el botón de actualizar
}


// ---------------------- VALIDAR CAMPOS ----------------------

function validarCampos() {
    const nombre = document.getElementById("nombre").value.trim();
    const precio = document.getElementById("precio").value;
    const categoria = document.getElementById("categoria").value;
    const descripcion = document.getElementById("descripcion").value.trim();
    const stock = document.getElementById("stock").value;

    // Verifica que todos los campos obligatorios estén llenos
    if (!nombre || !precio || !categoria || !descripcion || !stock) {
        alertaWarning("Por favor llena todos los campos obligatorios");
        return false;
    }

    return true;
}


// ---------------------- ACTUALIZAR PRODUCTO ----------------------

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!selectedProductId) {
        alertaWarning("Selecciona un producto primero.");
        return;
    }

    // Validación previa
    if (!validarCampos()) return;

    // Determinar si se subió una nueva imagen
    let finalImageName = currentImageName;

    if (imagenInput.files.length > 0) {
        finalImageName = imagenInput.files[0].name; // Usa la nueva imagen
    }

    // Datos a enviar al backend
    const productData = {
        nombre: document.getElementById("nombre").value.trim(),
        precio: parseFloat(document.getElementById("precio").value),
        ofertaP: document.getElementById("ofertaP").value || null,
        categoria: document.getElementById("categoria").value,
        inventario: parseInt(document.getElementById("stock").value),
        descripcion: document.getElementById("descripcion").value.trim(),
        imagen: finalImageName
    };

    try {
        // Enviar actualización al backend
        const response = await apiPut(
            `/account/mProducts/${selectedProductId}`,
            productData,
            { Authorization: `Bearer ${token}` }
        );

        if (response.success) {
            await alertaExito("Producto actualizado correctamente");
            location.reload(); // Recarga la página para ver cambios
        } else {
            alertaError("Error al actualizar producto");
        }

    } catch (error) {
        console.error(error);
        alertaError("No se pudo actualizar el producto");
    }
});