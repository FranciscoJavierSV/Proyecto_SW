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
});

/* ============================================================
   PREVIEW DE IMAGEN
   Muestra una vista previa de la imagen seleccionada
============================================================ */
const imageInput = document.getElementById("imagen");
const preview = document.getElementById("imagePreview");

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];

    // Si no hay archivo, limpiar preview
    if (!file) {
        preview.innerHTML = "";
        return;
    }

    // Leer archivo como base64 para mostrarlo
    const reader = new FileReader();
    reader.onload = () => {
        preview.innerHTML = `<img src="${reader.result}" alt="Preview">`;
    };

    reader.readAsDataURL(file);
});

/* ============================================================
   SUBMIT FORM
   Validación y envío del formulario de alta de productos
============================================================ */
document.getElementById("altaForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Campos del formulario
    const campos = {
        nombre: document.getElementById("nombre"),
        imagen: document.getElementById("imagen"),
        categoria: document.getElementById("categoria"),
        descripcion: document.getElementById("descripcion"),
        precio: document.getElementById("precio"),
        stock: document.getElementById("stock")
    };

    let valido = true;

    // Limpiar errores previos
    document.querySelectorAll(".error-msg").forEach(el => el.remove());
    Object.values(campos).forEach(c => c.classList.remove("input-error"));

    // Validación general
    for (let key in campos) {

        if (key === "imagen") {
            // Validación especial para imagen
            if (campos[key].files.length === 0) {
                valido = false;
                marcarError(campos[key], "Debe seleccionar una imagen");
            }
            continue;
        }

        // Validar campos vacíos
        if (campos[key].value.trim() === "") {
            valido = false;
            marcarError(campos[key], "Este campo es obligatorio");
        }
    }

    if (!valido) {
        alert("Por favor, completa todos los campos requeridos.");
        return;
    }


    /* ============================================================
       OBTENER SOLO EL NOMBRE DEL ARCHIVO (archivo.png)
    ============================================================ */
    const archivo = campos.imagen.files[0];
    const nombreImagen = archivo ? archivo.name : "";


    /* ============================================================
       ARMAR EL OBJETO PARA ENVIAR A LA API
    ============================================================ */
    const data = {
        nombre: campos.nombre.value,
        imagen: nombreImagen,
        categoria: campos.categoria.value,
        descripcion: campos.descripcion.value,
        precio: parseFloat(campos.precio.value),
        inventario: parseInt(campos.stock.value),
        ofertaP: parseFloat(document.getElementById("ofertaP").value) || null
    };


    try {
        const token = localStorage.getItem("token");

        // Enviar datos al backend
        const res = await apiPost("/account/mProducts", data, {
            Authorization: `Bearer ${token}`
        });

        if (!res.success) {
            alertaError(res.message);
            return;
        }

        alertaExito("Producto registrado con éxito");

        // Limpiar formulario y preview
        document.getElementById("altaForm").reset();
        preview.innerHTML = "";

    } catch (err) {
        console.error(err);
        alertaError("Ocurrió un error al registrar el producto.");
    }
});

/* ============================================================
   FUNCIÓN PARA MOSTRAR MENSAJES DE ERROR
   Agrega un mensaje debajo del input y marca el campo en rojo
============================================================ */
function marcarError(input, mensaje) {
    input.classList.add("input-error");

    const error = document.createElement("p");
    error.classList.add("error-msg");
    error.textContent = mensaje;

    input.parentNode.appendChild(error);
}