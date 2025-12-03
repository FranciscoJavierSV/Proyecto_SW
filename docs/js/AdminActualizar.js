let selectedProductId = null;
let currentImageName = null;  // ← Guardará la imagen original

document.addEventListener("DOMContentLoaded", () => {

    // Mostrar nombre de admin logueado
    const username = localStorage.getItem("username");
    const nombreSpan = document.querySelector(".admin-name");

    if (username && nombreSpan) {
        nombreSpan.textContent = `Hola ${username} / Administrador`;
    }

    // Cerrar sesión
    const logoutBtn = document.querySelector(".logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (event) => {
            event.preventDefault(); 
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("refreshToken");
            window.location.href = "../index.html";
        });
    }

    // Cargar productos dinámicamente
    cargarProductos();
});


// ---------------------- VARIABLES IMPORTANTES ----------------------

const form = document.getElementById("updateForm");
const imagenInput = document.getElementById("imagen");
const imagePreview = document.getElementById("imagePreview");
const btnUpdate = document.getElementById("btnUpdate");

let token = localStorage.getItem("token");


// ---------------------- CARGAR PRODUCTOS ----------------------

async function cargarProductos() {
    const grid = document.querySelector(".products-grid");
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
            card.classList.add("product-card");

            card.innerHTML = `
                <img src="../ImagenesGenerales/${prod.imagen}" alt="${prod.nombre}">
                <h3>${prod.nombre}</h3>
                <p>Stock: ${prod.inventario}</p>
                <span class="category-tag">${prod.categoria}</span>
            `;

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
    selectedProductId = prod.id;
    currentImageName = prod.imagen;  // ← Guardamos la imagen actual

    document.getElementById("nombre").value = prod.nombre;
    document.getElementById("descripcion").value = prod.descripcion;
    document.getElementById("precio").value = prod.precio;
    document.getElementById("stock").value = prod.inventario;
    document.getElementById("categoria").value = prod.categoria;
    document.getElementById("ofertaP").value = prod.ofertaP || "";

    // Mostrar imagen actual
    imagePreview.innerHTML = `
        <img src="../ImagenesGenerales/${prod.imagen}" style="max-width: 150px;">
    `;

    btnUpdate.disabled = false;
}



// ---------------------- VALIDAR CAMPOS ----------------------

function validarCampos() {
    const nombre = document.getElementById("nombre").value.trim();
    const precio = document.getElementById("precio").value;
    const categoria = document.getElementById("categoria").value;
    const descripcion = document.getElementById("descripcion").value.trim();
    const stock = document.getElementById("stock").value;

    if (!nombre || !precio || !categoria || !descripcion || !stock) {
        alert("⚠️ Por favor llena todos los campos obligatorios.");
        return false;
    }

    return true;
}



// ---------------------- ACTUALIZAR PRODUCTO ----------------------

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!selectedProductId) {
        alert("Selecciona un producto primero.");
        return;
    }

    // Validación antes de enviar
    if (!validarCampos()) return;

    // Determinar si se subió nueva imagen
    let finalImageName = currentImageName;

    if (imagenInput.files.length > 0) {
        finalImageName = imagenInput.files[0].name;  // nueva imagen
    }

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
        const response = await apiPut(
            `/account/mProducts/${selectedProductId}`,
            productData,
            { Authorization: `Bearer ${token}` }
        );

        if (response.success) {
            alert("Producto actualizado correctamente");
            location.reload();
        } else {
            alert("Error al actualizar producto");
        }

    } catch (error) {
        console.error(error);
        alert("No se pudo actualizar el producto");
    }
});
