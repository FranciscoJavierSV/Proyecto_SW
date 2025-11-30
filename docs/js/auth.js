document.addEventListener("DOMContentLoaded", () => {

    // ====================================================
    //  LOGIN
    // ====================================================
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const correo = document.getElementById("correo").value.trim();
            const contrasena = document.getElementById("pass").value.trim();

            if (!correo || !contrasena) {
                alert("Ingresa todos los campos");
                return;
            }

            const res = await apiPost("/public/login", { correo, contrasena });

            if (!res || !res.success) {
                alert(res?.message || "Datos inválidos");
                return;
            } 

            // Guardar tokens y datos
            localStorage.setItem("token", res.token);
            localStorage.setItem("refreshToken", res.refreshToken);
            localStorage.setItem("username", res.user.username);

            window.location.href = "PaginaUsuarioLogueado.html";
        });
    }


    // ====================================================
    //  REGISTRO
    // ====================================================
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const username  = document.getElementById("nombre").value.trim();
            const correo    = document.getElementById("correo").value.trim();
            const pais      = document.getElementById("pais").value;
            const pass      = document.getElementById("pass").value.trim();
            const pass2     = document.getElementById("pass2").value.trim();

            if (!username || !correo || !pais || !pass || !pass2) {
                alert("Completa todos los campos");
                return;
            }

            if (pass !== pass2) {
                alert("Las contraseñas no coinciden");
                return;
            }

            const res = await apiPost("/public/register", {
                username,
                contrasena: pass,
                correo,
                pais  
            });

            if (!res.success) {
                alert(res.message || "Error al crear cuenta");
                return;
            }

            alert("Cuenta creada correctamente. Inicia sesión.");
            window.location.href = "IniciarSesion.html";
        });
    }


    // ====================================================
    //  CARGAR PAISES DINÁMICAMENTE
    // ====================================================
    const selectPais = document.getElementById("pais");

    if (selectPais) {
        cargarPaises();
    }

    async function cargarPaises() {
        try {
            const response = await fetch("http://localhost:3000/api/public/paises");
            const data = await response.json();

            if (data.success) {
                data.paises.forEach(p => {
                    const option = document.createElement("option");
                    option.value = p.id;
                    option.textContent = p.nombre;
                    selectPais.appendChild(option);
                });
            } else {
                console.error("Error cargando países");
            }

        } catch (error) {
            console.error("Error al obtener países:", error);
        }
    }

});
