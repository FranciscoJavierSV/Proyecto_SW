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
});


/* ============================================================
   PREVIEW DE IMAGEN
============================================================ */
const imageInput = document.getElementById("imagen");
const preview = document.getElementById("imagePreview");

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];

    if (!file) {
        preview.innerHTML = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        preview.innerHTML = `<img src="${reader.result}" alt="Preview">`;
    };

    reader.readAsDataURL(file);
});



/* ============================================================
   SUBMIT FORM
============================================================ */
document.getElementById("altaForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const campos = {
        nombre: document.getElementById("nombre"),
        imagen: document.getElementById("imagen"),
        categoria: document.getElementById("categoria"),
        descripcion: document.getElementById("descripcion"),
        precio: document.getElementById("precio"),
        stock: document.getElementById("stock")
    };

    let valido = true;

    // limpiar errores previos
    document.querySelectorAll(".error-msg").forEach(el => el.remove());
    Object.values(campos).forEach(c => c.classList.remove("input-error"));

    // validar (imagen requiere validación especial)
    for (let key in campos) {

        if (key === "imagen") {
            // si no hay archivo seleccionado
            if (campos[key].files.length === 0) {
                valido = false;
                marcarError(campos[key], "Debe seleccionar una imagen");
            }
            continue;
        }

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

        const res = await apiPost("/account/mProducts", data, {
            Authorization: `Bearer ${token}`
        });

        if (!res.success) {
            alertaError(res.message);
            return;
        }

        alertaExito("Producto registrado con éxito");
        document.getElementById("altaForm").reset();
        preview.innerHTML = ""; // limpiar preview

    } catch (err) {
        console.error(err);
        alertaError("Ocurrió un error al registrar el producto.");
    }
});



/* ============================================================
   FUNCIÓN PARA MOSTRAR MENSAJES DE ERROR
============================================================ */
function marcarError(input, mensaje) {
    input.classList.add("input-error");

    const error = document.createElement("p");
    error.classList.add("error-msg");
    error.textContent = mensaje;

    input.parentNode.appendChild(error);
}
