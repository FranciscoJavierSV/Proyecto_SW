async function confirmPurchase(event) {
    if (event?.preventDefault) event.preventDefault();

    // === DATOS DEL CLIENTE ===
    const customerName = document.getElementById("nombreCliente")?.value || "Cliente";
    const customerEmail = document.getElementById("emailCliente")?.value;

    if (!customerEmail) {
        return Swal.fire("Correo requerido", "Por favor ingresa el correo del cliente.", "warning");
    }

    const metodoPago = document.getElementById("metodoPago").value;
    if (!metodoPago) {
        return Swal.fire("Selecciona un método de pago", "", "warning");
    }

    // === OBTENER CARRITO DEL BACKEND ===
    let items = [];

    try {
        const data = await apiGet("/auth/cart", {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        });

        items = data.cart || [];
    } catch (err) {
        console.warn("Error obteniendo carrito, usando valores ejemplo.");
    }

    // Carrito de ejemplo si está vacío
    if (!items || items.length === 0) {
        items = [
            { nombre: "Producto A", cantidad: 2, precioUnitario: 150.0, subtotal: 300.0 },
            { nombre: "Producto B", cantidad: 1, precioUnitario: 200.0, subtotal: 200.0 }
        ];
    }

// === CREAR ORDEN ===
const orderResult = await apiPost(
    "/auth/ordenar",
    {
        customerName,
        customerEmail,
        metodoPago
    },
    {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
);


    if (!orderResult.success) {
        console.error(orderResult);
        return Swal.fire("Error", orderResult.message || "No se pudo crear la orden.", "error");
    }

    console.log("Orden creada con ID:", orderResult.saleId);

    // === GENERAR PDF ===
    const payload = {
        customerName,
        customerEmail,
        items,
        metodoPago
    };

    const pdfResult = await apiPost("/auth/ordenar/pdf", payload, {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
    });

    if (!pdfResult.success) {
        console.error(pdfResult);
        return Swal.fire("Error", pdfResult.message || "No se pudo generar el PDF", "error");
    }

    // === ALERTAS ===
    await Swal.fire({
        icon: "success",
        title: "Compra finalizada",
        showConfirmButton: true
    });

    await Swal.fire({
        icon: "success",
        title: "La nota se envió a tu correo electrónico",
        text: `Se envió a ${customerEmail}`,
        showConfirmButton: true
    });

    // === LIMPIAR CARRITO ===
    await apiDelete("/auth/cart", {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
    });

    // === ABRIR PDF EN NUEVA PESTAÑA ===
    if (pdfResult.pdfBase64) {
        const byteCharacters = atob(pdfResult.pdfBase64);
        const byteNumbers = Array.from(byteCharacters).map(c => c.charCodeAt(0));
        const byteArray = new Uint8Array(byteNumbers);

        const blob = new Blob([byteArray], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
    }

    // === REDIRECCIÓN FINAL ===
    setTimeout(() => {
        window.location.href = "../html/PaginaUsuarioLogueado.html";
    }, 1500);
}
 
document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("username");
    const nombreSpan = document.querySelector(".usuario-nombre");

    if (username && nombreSpan) {
        nombreSpan.textContent = `Hola, ${username}`;
    }

    const select = document.getElementById("metodoPago");
    if (select) select.addEventListener("change", mostrarFormularioPago);
});
