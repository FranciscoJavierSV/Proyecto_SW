function mostrarFormularioPago() {
    const metodo = document.getElementById("metodoPago").value;

    document.getElementById("pagoTarjeta").classList.add("oculto");
    document.getElementById("pagoOxxo").classList.add("oculto");

    if (metodo === "tarjeta") {
        document.getElementById("pagoTarjeta").classList.remove("oculto");
    }
    if (metodo === "oxxo") {
        document.getElementById("pagoOxxo").classList.remove("oculto");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // ===================================
    // MOSTRAR NOMBRE DEL USUARIO LOGUEADO
    // ===================================
    const username = localStorage.getItem("username");
    const nombreSpan = document.querySelector(".usuario-nombre");

    if (username && nombreSpan) {
        nombreSpan.textContent = `Hola, ${username}`;
    }
});