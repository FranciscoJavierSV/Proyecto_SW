const API_URL = "http://localhost:3000/api/auth";

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
        alert("Ingresa tu correo.");
        return;
    }

    const res = await fetch(`${API_URL}/recovery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo })
    });

    const data = await res.json();
    console.log("Paso 1:", data);

    if (!data.success) {
        alert(data.message);
        return;
    }

    alert("Token enviado. Revisa tu correo.");

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
        alert("Ingresa el token.");
        return;
    }

    const res = await fetch(`${API_URL}/validate-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: correoGuardado, token })
    });

    const data = await res.json();
    console.log("Paso 2:", data);

    if (!data.success) {
        alert("Token inválido o expirado.");
        return;
    }

    alert("Token válido. Ahora escribe tu nueva contraseña.");

    paso2.style.display = "none";
    paso3.style.display = "block";
});


// -----------------------------
// PASO 3 — CAMBIAR CONTRASEÑA
// -----------------------------
document.querySelector(".btn-cambiar").addEventListener("click", async () => {
    const newPassword = newPasswordInput.value.trim();

    if (!newPassword) {
        alert("Ingresa tu nueva contraseña.");
        return;
    }

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

    if (!data.success) {
        alert(data.message);
        return;
    }

    alert("Contraseña actualizada correctamente.");
    window.location.href = "IniciarSesion.html";
});
