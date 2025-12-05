const API_URL = "http://localhost:3000/api/auth";

// ELEMENTOS HTML
// Referencias a los contenedores de cada paso del proceso
const paso1 = document.querySelector(".paso-1");
const paso2 = document.querySelector(".paso-2");
const paso3 = document.querySelector(".paso-3");

// Inputs del formulario
const correoInput = document.getElementById("correo");
const tokenInput = document.getElementById("token");
const newPasswordInput = document.getElementById("newPassword");

// Variable para conservar el correo entre pasos
let correoGuardado = "";


// -----------------------------
// PASO 1 — ENVIAR TOKEN
// Solicita al backend que envíe un token al correo del usuario
// -----------------------------
document.querySelector(".btn-enviar").addEventListener("click", async () => {
    const correo = correoInput.value.trim();

    // Validación básica
    if (!correo) {
        alertaWarning("Ingresa tu correo");
        return;
    }

    // Petición al backend para generar y enviar token
    const res = await fetch(`${API_URL}/recovery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo })
    });

    const data = await res.json();
    console.log("Paso 1:", data);

    // Si falla, mostrar error
    if (!data.success) {
        alertaError(data.message);
        return;
    }

    alertaExito("Token enviado. Revisa tu correo.");

    // Guardar correo para los siguientes pasos
    correoGuardado = correo;

    // Avanzar al paso 2
    paso1.style.display = "none";
    paso2.style.display = "block";
});


// -----------------------------
// PASO 2 — VALIDAR TOKEN
// Verifica que el token ingresado sea válido y no haya expirado
// -----------------------------
document.querySelector(".btn-validar").addEventListener("click", async () => {
    const token = tokenInput.value.trim();

    // Validación básica
    if (!token) {
        alertaWarning("Ingresa el token.");
        return;
    }

    // Petición al backend para validar token
    const res = await fetch(`${API_URL}/validate-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: correoGuardado, token })
    });

    const data = await res.json();
    console.log("Paso 2:", data);

    // Si el token no es válido
    if (!data.success) {
        alertaError("Token inválido o expirado.");
        return;
    }

    alertaExito("Token válido. Ahora escribe tu nueva contraseña.");

    // Avanzar al paso 3
    paso2.style.display = "none";
    paso3.style.display = "block";
});


// -----------------------------
// PASO 3 — CAMBIAR CONTRASEÑA
// Envía la nueva contraseña al backend para actualizarla
// -----------------------------
document.querySelector(".btn-cambiar").addEventListener("click", async () => {
    const newPassword = newPasswordInput.value.trim();

    // Validación básica
    if (!newPassword) {
        alertaWarning("Ingresa tu nueva contraseña.");
        return;
    }

    // Petición al backend para cambiar contraseña
    const res = await fetch(`${API_URL}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            correo: correoGuardado,
            newPassword
        })
    });

    const data = await res.json();
    console.log("Paso 3:", data);

    // Si falla, mostrar error
    if (!data.success) {
        alertaError(data.message);
        return;
    }

    alertaExito("Contraseña actualizada correctamente.");

    // Redirigir al login
    window.location.href = "IniciarSesion.html";
});