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
            const captchaIngresado = document.getElementById("captcha-input").value;
            const tokenCaptcha = window.tokenCaptcha;

            if (!correo || !contrasena || !captchaIngresado || !tokenCaptcha) {
                alertaWarning("Ingresa todos los campos");
                return;
            }

            const res = await apiPost("/public/login", { correo, contrasena, captchaIngresado, tokenCaptcha });

            
            const token = res?.token ?? res?.data?.token ?? null;
            const refreshToken = res?.refreshToken ?? res?.data?.refreshToken ?? null;
            const user = res?.user ?? res?.data?.user ?? null;
            const success = res?.success ?? (token !== null);

            if (!success || !token) {
                alertaError(res?.message || "Datos inválidos");
                cargarCaptcha();
                return;
            }

            // Guardar tokens y datos
            localStorage.setItem("token", token);
            if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
            if (user?.username) localStorage.setItem("username", user.username);
            else if (res?.username) localStorage.setItem("username", res.username);

            if(res.user.rol === "admin"){
                Swal.fire({
                    title: "¡Bienvenid@!",
                    text: "Inicio de sesión exitoso",
                    icon: "success",
                    confirmButtonColor: "#8b6b4a",
                    timer: 1800,
                    timerProgressBar: true,
                    showConfirmButton: false
                }).then(() => { window.location.href = "AdminPrincipal.html"; });
            }
            else{
                Swal.fire({
                    title: "¡Bienvenido administrador!",
                    text: "Inicio de sesión exitoso",
                    icon: "success",
                    confirmButtonColor: "#ec85b2ff",
                    timer: 1800,
                    timerProgressBar: true,
                    showConfirmButton: false
                }).then(() => { window.location.href = "PaginaUsuarioLogueado.html"; });
                
            }
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
                alertaWarning("Completa todos los campos");
                return;
            }

            if (pass !== pass2) {
                alertaError("Las contraseñas no coinciden");
                return;
            }

            const res = await apiPost("/public/register", {
                username,
                contrasena: pass,
                correo,
                pais  
            });

            if (!res.success) {
                alertaError(res.message || "Error al crear cuenta");
                return;
            }

            alertaExito("Cuenta creada correctamente. Inicia sesión.");
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
            const data = await apiGet("/public/paises");

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

    // ==========================================
    // CAPTCHA
    // ==========================================
    const captchaImg = document.getElementById("captchaImg");
    const btnNuevoCaptcha = document.querySelector(".btn-nuevo");

    if (captchaImg) {
        cargarCaptcha();
    }

    if (btnNuevoCaptcha) {
        btnNuevoCaptcha.addEventListener("click", cargarCaptcha);
    }

    async function cargarCaptcha() {
        try {
            const data = await apiGet("/public/generarCaptcha");
            // Insertar SVG en el div
            captchaImg.innerHTML = data.svg;
            // Guardar token temporal
            window.tokenCaptcha = data.token;
        } catch (error) {
            console.error("Error cargando captcha:", error);
        }
    }

});