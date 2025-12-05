// Botón que abre/cierra el panel de accesibilidad
const btnPanel = document.getElementById("accessibility-btn");
// Panel de accesibilidad
const panel = document.getElementById("accessibility-panel");
// Botón para cambiar tema claro/oscuro
const toggleTheme = document.getElementById("toggle-theme");
// Icono del botón de tema
const icon = document.getElementById("theme-icon");

// Botones para modificar tamaño de texto
const increaseText = document.getElementById("increase-text");
const decreaseText = document.getElementById("decrease-text");
const resetText = document.getElementById("reset-text");

// Tamaño de fuente actual
let currentFontSize = 16;
// ID del usuario actual (para guardar preferencias personalizadas)
let currentUserId = null;

// Obtiene el usuario actual desde localStorage o sessionStorage
function obtenerUsuarioActual() {
    const username = localStorage.getItem("username");
    
    // Si existe en localStorage, lo usa
    if (username) {
        currentUserId = username;
        return currentUserId;
    }
    
    // Si no, intenta obtenerlo desde sessionStorage
    const usuarioLogueado = sessionStorage.getItem("usuarioLogueado");
    
    if (usuarioLogueado) {
        try {
            // Intenta parsear JSON
            const usuario = JSON.parse(usuarioLogueado);
            currentUserId = usuario.idUsuario || usuario.id || usuario.email || usuario.username;
            return currentUserId;
        } catch (error) {
            // Si no es JSON válido, usa el valor tal cual
            currentUserId = usuarioLogueado;
            return currentUserId;
        }
    }
    
    return null; // No hay usuario
}

// Guarda una preferencia de accesibilidad para el usuario actual
function guardarPreferencia(clave, valor) {
    if (!currentUserId) {
        console.warn("No hay usuario logueado");
        alertaError("No hay usuario logueado");
        return;
    }
    
    const claveCompleta = `accessibility_${currentUserId}_${clave}`;
    localStorage.setItem(claveCompleta, valor);
}

// Obtiene una preferencia guardada del usuario actual
function obtenerPreferencia(clave) {
    if (!currentUserId) {
        return null;
    }
    
    const claveCompleta = `accessibility_${currentUserId}_${clave}`;
    return localStorage.getItem(claveCompleta);
}

// Elimina todas las preferencias del usuario actual
function limpiarPreferenciasUsuario() {
    if (!currentUserId) {
        return;
    }
    
    localStorage.removeItem(`accessibility_${currentUserId}_theme`);
    localStorage.removeItem(`accessibility_${currentUserId}_fontSize`);
}

// Abre/cierra el panel de accesibilidad
btnPanel.addEventListener("click", () => {
    panel.classList.toggle("hidden");
});

// Cambia entre tema claro y oscuro
toggleTheme.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");

    if (isDark) {
        icon.classList.replace("fa-moon", "fa-sun");
        guardarPreferencia("theme", "dark");
    } else {
        icon.classList.replace("fa-sun", "fa-moon");
        guardarPreferencia("theme", "light");
    }
});

// Aplica un tamaño de fuente dentro de los límites permitidos
function updateFontSize(size) {
    if (size < 10) size = 10;   // Límite mínimo
    if (size > 26) size = 26;   // Límite máximo
    
    console.log("Aplicando tamaño de fuente:", size + "px");
    
    document.documentElement.style.setProperty("--font-size", size + "px");
    document.body.style.fontSize = size + "px";
    
    guardarPreferencia("fontSize", size);
    currentFontSize = size;
}

// Aumentar tamaño de texto
increaseText.addEventListener("click", () => {
    currentFontSize += 2;
    updateFontSize(currentFontSize);
});

// Disminuir tamaño de texto
decreaseText.addEventListener("click", () => {
    currentFontSize -= 2;
    updateFontSize(currentFontSize);
});

// Restaurar tamaño de texto por defecto
resetText.addEventListener("click", () => {
    currentFontSize = 16;
    updateFontSize(currentFontSize);
});

// Carga las preferencias guardadas del usuario
function cargarPreferenciasAccesibilidad() {
    const userId = obtenerUsuarioActual();
    
    if (!userId) {
        console.log("No hay usuario logueado, usando valores por defecto");
        return;
    }
    
    console.log(`Cargando preferencias de accesibilidad para usuario: ${userId}`);
    
    // Tema guardado
    const savedTheme = obtenerPreferencia("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        icon.classList.replace("fa-moon", "fa-sun");
    } else {
        document.body.classList.remove("dark");
        if (icon.classList.contains("fa-sun")) {
            icon.classList.replace("fa-sun", "fa-moon");
        }
    }

    // Tamaño de fuente guardado
    const savedSize = obtenerPreferencia("fontSize");
    console.log("Tamaño guardado:", savedSize);
    
    if (savedSize) {
        const size = parseInt(savedSize);
        console.log("Aplicando tamaño guardado:", size);
        currentFontSize = size;
        document.documentElement.style.setProperty("--font-size", size + "px");
        document.body.style.fontSize = size + "px";
    } else {
        console.log("Sin tamaño guardado, usando 16px");
        currentFontSize = 16;
        document.documentElement.style.setProperty("--font-size", "16px");
        document.body.style.fontSize = "16px";
    }
}

// Limpia preferencias visuales al cerrar sesión
function limpiarPreferenciasAlCerrarSesion() {
    document.body.classList.remove("dark");
    if (icon.classList.contains("fa-sun")) {
        icon.classList.replace("fa-sun", "fa-moon");
    }
    currentFontSize = 16;
    document.documentElement.style.setProperty("--font-size", "16px");
    document.body.style.fontSize = "16px";
    currentUserId = null;
}

// Cargar preferencias al iniciar la página
window.addEventListener("DOMContentLoaded", () => {
    cargarPreferenciasAccesibilidad();
});

// Cargar preferencias si el documento ya está listo
if (document.readyState === "complete" || document.readyState === "interactive") {
    cargarPreferenciasAccesibilidad();
}

// Exponer función global para limpiar accesibilidad al cerrar sesión
window.limpiarAccesibilidadAlCerrarSesion = limpiarPreferenciasAlCerrarSesion;