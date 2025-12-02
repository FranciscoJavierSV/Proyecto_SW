let swiper = null; // variable global para el swiper

document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
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

        // limpiar
        grid.innerHTML = "";

        // Agregar slides
        data.products.forEach(prod => {
            const card = document.createElement("div");
            card.className = "swiper-slide";

            // Ajusta la ruta de la imagen según la ubicación real de la carpeta
            // Si ImagenesGenerales está en la raíz con index.html: "ImagenesGenerales/..."
            // Si está en otra carpeta, cámbialo aquí.
            const img = document.createElement("img");
            img.src = `ImagenesGenerales/${prod.imagen}`;
            img.alt = prod.nombre || "Producto";

            card.appendChild(img);
            grid.appendChild(card);
        });

        // Inicializar o actualizar Swiper después de añadir slides
        if (typeof Swiper === "undefined") {
            console.warn("Swiper no está cargado aún. Asegúrate de incluir el script de Swiper antes de Principal.js.");
            return;
        }

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
