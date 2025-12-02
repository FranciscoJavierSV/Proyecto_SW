/* =============================
   🟤 SWIPER DINÁMICO PRODUCTOS
============================= */

let swiper = null;

document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    inicializarContacto(); // también inicializa el formulario
});

async function cargarProductos() {
    const grid = document.querySelector(".swiper-wrapper");
    if (!grid) return;

    try {
        const data = await apiGet("/public/products");

        if (!data || !data.success) {
            grid.innerHTML = "<p>Error al cargar productos.</p>";
            return;
        }

        grid.innerHTML = ""; // limpiar

        // Crear slides
        data.products.forEach(prod => {
            const card = document.createElement("div");
            card.className = "swiper-slide";

            const img = document.createElement("img");
            img.src = `ImagenesGenerales/${prod.imagen}`;
            img.alt = prod.nombre || "Producto";

            card.appendChild(img);
            grid.appendChild(card);
        });

        // Inicializar Swiper
        if (swiper) {
            swiper.update();
        } else {
            swiper = new Swiper(".swiper", {
                loop: true,
                autoplay: { delay: 2000 },
                pagination: { el: ".swiper-pagination", clickable: true },
                navigation: {
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev"
                }
            });
        }

    } catch (error) {
        console.error("Error al cargar productos:", error);
        grid.innerHTML = "<p>No se pudieron cargar los productos.</p>";
    }
}


/* =============================
   🟤 FORMULARIO DE CONTACTO
============================= */

function inicializarContacto() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombre = document.getElementById("contactName").value.trim();
        const correo = document.getElementById("contactEmail").value.trim();
        const mensaje = document.getElementById("contactMessage").value.trim();

        const res = await fetch("http://localhost:3000/api/public/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, correo, mensaje })
        });

        const data = await res.json();
        console.log("Respuesta del backend:", data);

        if (data.success) {
            form.reset(); // limpiar
            alert("Mensaje enviado correctamente ✔");
        } else {
            alert("Hubo un error al enviar el mensaje.");
        }
    });
}
