async function mostrarFormularioPago() {
    const metodo = document.getElementById("metodoPago").value;

    document.getElementById("pagoTarjeta").classList.add("oculto");
    document.getElementById("pagoOxxo").classList.add("oculto");
    document.getElementById("pagoTransferencia").classList.add("oculto");

    if (metodo === "tarjeta") document.getElementById("pagoTarjeta").classList.remove("oculto");
    if (metodo === "oxxo") document.getElementById("pagoOxxo").classList.remove("oculto");
    if (metodo === "transferencia") document.getElementById("pagoTransferencia").classList.remove("oculto");
}
 
async function confirmPurchase(event) {
    if (event?.preventDefault) event.preventDefault();

    // Datos del cliente
    const customerName = document.getElementById("nombreCliente")?.value || "Cliente";
    const customerEmail = document.getElementById("emailCliente")?.value;

    if (!customerEmail) {
        return Swal.fire("Correo requerido", "Por favor ingresa el correo del cliente.", "warning");
    }

    const metodoPago = document.getElementById("metodoPago").value;
    if (!metodoPago) return Swal.fire("Selecciona un método de pago", "", "warning");

    // === OBTENER CARRITO DEL BACKEND ===
    let items = [];
    try {
        const resp = await fetch("http://localhost:3000/api/auth/cart", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (resp.ok) {
            const data = await resp.json();

            // Tu backend envía esto:
            // { success: true, cart: [...] }
            items = data.cart || [];
        }
    } catch (err) {
        console.warn("Error obteniendo carrito, usando valores ejemplo.");
    }

    // Si no hay carrito real, llenar ejemplo
    if (!items || items.length === 0) {
        items = [
            { nombre: "Producto A", cantidad: 2, precioUnitario: 150.0, subtotal: 300.0 },
            { nombre: "Producto B", cantidad: 1, precioUnitario: 200.0, subtotal: 200.0 }
        ];
    }

    const orderResp = await fetch("http://localhost:3000/api/auth/ordenar", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    const orderResult = await orderResp.json();

    if (!orderResp.ok || !orderResult.success) {
        console.error(orderResult);
        return Swal.fire("Error", orderResult.message || "No se pudo crear la orden.", "error");
    }

    console.log("Orden creada con ID:", orderResult.saleId);

    // para generar pdf
    const payload = {
        customerName,
        customerEmail,
        items,
        metodoPago
    };

    const pdfResp = await fetch("http://localhost:3000/api/auth/ordenar/pdf", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload),
    });

    const result = await pdfResp.json();

    if (!pdfResp.ok || !result.success) {
        console.error(result);
        return Swal.fire("Error", result.message || "No se pudo generar el PDF", "error");
    }

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

    // se limpia carrito
    await fetch("http://localhost:3000/api/auth/cart", {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    }); 

    // el pdf se abre en una pestaña nueva
    if (result.pdfBase64) {
        const byteCharacters = atob(result.pdfBase64);
        const byteNumbers = Array.from(byteCharacters).map(c => c.charCodeAt(0));
        const byteArray = new Uint8Array(byteNumbers);

        const blob = new Blob([byteArray], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
    }

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
