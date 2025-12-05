document.addEventListener("DOMContentLoaded", () => {
    // MOSTRAR NOMBRE DEL ADMIN LOGUEADO
    // Obtiene el nombre del usuario almacenado en localStorage
    // y lo muestra en el elemento con la clase .admin-name
    const username = localStorage.getItem("username");
    const nombreSpan = document.querySelector(".admin-name");

    if (username && nombreSpan) {
        nombreSpan.textContent = `Hola ${username} / Administrador`;
    }

    // CERRAR SESIÓN
    // Busca el botón de logout y, si existe, asigna el evento de cierre de sesión
    const logoutBtn = document.querySelector(".logout-btn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (event) {
            event.preventDefault();

            // Elimina credenciales almacenadas del usuario
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("refreshToken");

            // Redirige al usuario a la página principal (login)
            window.location.href = "../index.html";
        });
    }
});