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

document.getElementById("altaForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const campos = {
        nombre: document.getElementById("nombre"),
        imagen: document.getElementById("imagen"),
        categoria: document.getElementById("categoria"),
        descripcion: document.getElementById("descripcion"),
        precio: document.getElementById("precio"),
        stock: document.getElementById("stock"),
    };

    let valido = true;

    // limpiar errores previos
    document.querySelectorAll(".error-msg").forEach(el => el.remove());
    Object.values(campos).forEach(c => c.classList.remove("input-error"));

    // validar cada campo
    for (let key in campos) {
        if (campos[key].value.trim() === "") {
            valido = false;
            marcarError(campos[key], "Este campo es obligatorio");
        }
    }

    if (!valido) {
        alert("Por favor, completa todos los campos requeridos.");
        return;
    }

    // Datos preparados para enviar
    const data = {
        nombre: campos.nombre.value,
        imagen: campos.imagen.value,
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
            alert("Error: " + res.message);
            return;
        }

        alert("Producto registrado con éxito");
        document.getElementById("altaForm").reset();

    } catch (err) {
        console.error(err);
        alert("Ocurrió un error al registrar el producto.");
    }
});

// función para mostrar mensajes
function marcarError(input, mensaje) {
    input.classList.add("input-error");

    const error = document.createElement("p");
    error.classList.add("error-msg");
    error.textContent = mensaje;

    input.parentNode.appendChild(error);
}


