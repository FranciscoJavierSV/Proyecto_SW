
// ELEMENTOS HTML
const paso1 = document.querySelector(".paso-1");
const paso2 = document.querySelector(".paso-2");
const paso3 = document.querySelector(".paso-3");

const correoInput = document.getElementById("correo");
const tokenInput = document.getElementById("token");
const newPasswordInput = document.getElementById("newPassword");

// Pasar correo entre pasos
let correoGuardado = "";

// -----------------------------
// PASO 1 — ENVIAR TOKEN
// -----------------------------
document.querySelector(".btn-enviar").addEventListener("click", async () => {
    const correo = correoInput.value.trim();

    if (!correo) {
        alertaWarning("Ingresa tu correo");
        return;
    }

    const data = await apiPost("/auth/recovery", { correo });

    console.log("Paso 1:", data);

    if (!data.success) {
        alertaError(data.message);
        return;
    }

    alertaExito("Token enviado. Revisa tu correo.");

    correoGuardado = correo;

    paso1.style.display = "none";
    paso2.style.display = "block";
});


// -----------------------------
// PASO 2 — VALIDAR TOKEN
// -----------------------------
document.querySelector(".btn-validar").addEventListener("click", async () => {
    const token = tokenInput.value.trim();

    if (!token) {
        alertaWarning("Ingresa el token.");
        return;
    }

    const data = await apiPost("/auth/validate-token", { correo: correoGuardado, token } );

    console.log("Paso 2:", data);

    if (!data.success) {
        alertaError("Token inválido o expirado.");
        return;
    }

    alertaExito("Token válido. Ahora escribe tu nueva contraseña.");

    paso2.style.display = "none";
    paso3.style.display = "block";
});


// -----------------------------
// PASO 3 — CAMBIAR CONTRASEÑA
// -----------------------------
document.querySelector(".btn-cambiar").addEventListener("click", async () => {
    const newPassword = newPasswordInput.value.trim();

    if (!newPassword) {
        alertaWarning("Ingresa tu nueva contraseña.");
        return;
    }

    const data = await apiPost("/auth/change-password", { correo: correoGuardado, newPassword } );

    console.log("Paso 3:", data);

    if (!data.success) {
        alertaError(data.message);
        return;
    }

    alertaExito("Contraseña actualizada correctamente.");
    window.location.href = "IniciarSesion.html";
});
