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