// ALERTA DE ÉXITO
function alertaExito(mensaje, titulo = "Éxito") {
    Swal.fire({
        title: titulo,
        text: mensaje,
        icon: "success",
        confirmButtonColor: "#8b6b4a",
    });
}

// ALERTA DE ERROR
function alertaError(mensaje, titulo = "Error") {
    Swal.fire({
        title: titulo,
        text: mensaje,
        icon: "error",
        confirmButtonColor: "#8b6b4a",
    });
}

// ALERTA DE ADVERTENCIA
function alertaWarning(mensaje, titulo = "Aviso") {
    Swal.fire({
        title: titulo,
        text: mensaje,
        icon: "warning",
        confirmButtonColor: "#8b6b4a",
    });
}

// ALERTA DE INFORMACIÓN
function alertaInfo(mensaje, titulo = "Información") {
    Swal.fire({
        title: titulo,
        text: mensaje,
        icon: "info",
        confirmButtonColor: "#8b6b4a",
    });
}

// ALERTA DE CONFIRMACIÓN (RETORNA UNA PROMESA)
function alertaConfirmacion(mensaje, titulo = "Confirmar") {
    return Swal.fire({
        title: titulo,
        text: mensaje,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#8b6b4a",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí",
        cancelButtonText: "Cancelar"
    });
}

/*document.getElementById("loginForm").addEventListener("submit", function(e) {
e.preventDefault();

const correo = document.getElementById("correo").value.trim();
const pass = document.getElementById("pass").value.trim();

if (correo === "" || pass === "") {
    Swal.fire({
        icon: "error",
        title: "Campos incompletos",
        text: "Por favor, rellena todos los campos.",
        timer: 4000,
        timerProgressBar: true
    });
    return;
}

Swal.fire({
    icon: "success",
    title: "Bienvenido",
    text: "Sesión iniciada con éxito",
    showConfirmButton: true
});

});


document.addEventListener("DOMContentLoaded", () => {
    
const inputCorreo = document.getElementById("correo");
const inputToken = document.getElementById("token");
const inputNewPass = document.getElementById("newPassword");

const btnEnviar = document.querySelector(".btn-enviar");
const btnValidar = document.querySelector(".btn-validar");
const btnCambiar = document.querySelector(".btn-cambiar");

const paso1 = document.querySelector(".paso-1");
const paso2 = document.querySelector(".paso-2");
const paso3 = document.querySelector(".paso-3");

btnEnviar.addEventListener("click", () => {
    const correo = inputCorreo.value.trim();

    if (correo === "") {
        Swal.fire({
            icon: "error",
            title: "Correo vacío",
            text: "Por favor, ingresa tu correo registrado.",
            timer: 4000,
            timerProgressBar: true
        });
        return;
    }

    Swal.fire({
        icon: "success",
        title: "Token enviado",
        text: "Revisa tu correo para obtener el token.",
        timer: 4000,
        timerProgressBar: true
    });

    paso1.style.display = "none";
    paso2.style.display = "block";
});


btnValidar.addEventListener("click", () => {
    const token = inputToken.value.trim();

    if (token === "") {
        Swal.fire({
            icon: "error",
            title: "Token vacío",
            text: "Debes ingresar el token que se envió a tu correo.",
            timer: 4000,
            timerProgressBar: true
        });
        return;
    }

    Swal.fire({
        icon: "success",
        title: "Token válido",
        text: "Ahora puedes cambiar tu contraseña.",
        timer: 3000,
        timerProgressBar: true
    });

    paso2.style.display = "none";
    paso3.style.display = "block";
});


btnCambiar.addEventListener("click", () => {
    const newPass = inputNewPass.value.trim();

    if (newPass === "") {
        Swal.fire({
            icon: "error",
            title: "Contraseña vacía",
            text: "Por favor, ingresa tu nueva contraseña.",
            timer: 4000,
            timerProgressBar: true
        });
        return;
    }

    Swal.fire({
        icon: "success",
        title: "Contraseña cambiada",
        text: "Tu contraseña ha sido actualizada con éxito.",
        showConfirmButton: true
    });
});

});*/