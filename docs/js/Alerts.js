// ALERTA DE ÉXITO
function alertaExito(mensaje, titulo = "Éxito") {
    return Swal.fire({
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
