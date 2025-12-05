// ============================================================
// LIMPIAR SESIÓN AL ENTRAR A LA PÁGINA PRINCIPAL
// Se eliminan token y username para evitar sesiones previas
// ============================================================
localStorage.removeItem("token");
localStorage.removeItem("username");

let swiper = null;

// ============================================================
// INICIALIZACIÓN GENERAL AL CARGAR LA PÁGINA
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();      // Carga imágenes del slider
    inicializarContacto();  // Activa formulario de contacto
    inicializarCarrito();   // Activa comportamiento del ícono del carrito
});


// ============================================================
// CARGAR PRODUCTOS PARA EL SLIDER (Swiper)
// Obtiene productos desde la API y los muestra como imágenes
// ============================================================
async function cargarProductos() {
    const grid = document.querySelector(".swiper-wrapper");
    if (!grid) return;

    try {
        const data = await apiGet("/public/products");

        if (!data || !data.success) {
            grid.innerHTML = "<p>Error al cargar productos.</p>";
            return;
        }

        grid.innerHTML = "";

        // Crear una diapositiva por producto
        data.products.forEach(prod => {
            const card = document.createElement("div");
            card.className = "swiper-slide";

            const img = document.createElement("img");
            img.src = `ImagenesGenerales/${prod.imagen}`;
            img.alt = prod.nombre || "Producto";

            card.appendChild(img);
            grid.appendChild(card);
        });

        // Inicializar o actualizar Swiper
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


// ============================================================
// FORMULARIO DE CONTACTO
// Envía datos al backend y muestra alertas según la respuesta
// ============================================================
function inicializarContacto() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombre = document.getElementById("contactName").value.trim();
        const correo = document.getElementById("contactEmail").value.trim();
        const mensaje = document.getElementById("contactMessage").value.trim();

        const data = await apiPost("/public/contact", {
            nombre,
            correo,
            mensaje
        });

        console.log("Respuesta del backend:", data);

        if (data.success) {
            form.reset();
            alertaExito("Tu mensaje ha sido enviado correctamente", "Mensaje enviado");
        } else {
            alertaError("Hubo un error al enviar el mensaje");
        }
    });
}


// ============================================================
// INICIALIZAR ÍCONO DEL CARRITO
// Si no hay sesión → alerta y opción de iniciar sesión
// Si hay sesión → redirige a la página del usuario
// ============================================================
function inicializarCarrito() {
    const carritoIcon = document.querySelector('.carrito');
    if (!carritoIcon) return;

    carritoIcon.addEventListener('click', function() {
        const username = localStorage.getItem('username');
        const token = localStorage.getItem('token');

        // Si no hay sesión → mostrar alerta
        if (!username && !token) {
            Swal.fire({
                title: "No has iniciado sesión",
                text: "¿Deseas iniciar sesión para agregar productos al carrito?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#8b6b4a",
                cancelButtonColor: "#d33",
                confirmButtonText: "Ir a iniciar sesión",
                cancelButtonText: "Cancelar"
            }).then(result => {
                if (result.isConfirmed) {
                    window.location.href = "../html/IniciarSesion.html";
                }
            });

        } else {
            // Si hay sesión → ir a la página del usuario
            window.location.href = 'html/PaginaUsuarioLogueado.html';
        }
    });
}