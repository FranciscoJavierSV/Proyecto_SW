const btnPanel = document.getElementById("accessibility-btn");
const panel = document.getElementById("accessibility-panel");
const toggleTheme = document.getElementById("toggle-theme");
const icon = document.getElementById("theme-icon");

const increaseText = document.getElementById("increase-text");
const decreaseText = document.getElementById("decrease-text");
const resetText = document.getElementById("reset-text");

let currentFontSize = 16;
let currentUserId = null;

function obtenerUsuarioActual() {
    const username = localStorage.getItem("username");
    
    if (username) {
        currentUserId = username;
        return currentUserId;
    }
    
    const usuarioLogueado = sessionStorage.getItem("usuarioLogueado");
    
    if (usuarioLogueado) {
        try {
            const usuario = JSON.parse(usuarioLogueado);
            currentUserId = usuario.idUsuario || usuario.id || usuario.email || usuario.username;
            return currentUserId;
        } catch (error) {
            currentUserId = usuarioLogueado;
            return currentUserId;
        }
    }
    
    return null;
}

function guardarPreferencia(clave, valor) {
    if (!currentUserId) {
        console.warn("No hay usuario logueado");
        return;
    }
    
    const claveCompleta = `accessibility_${currentUserId}_${clave}`;
    localStorage.setItem(claveCompleta, valor);
}

function obtenerPreferencia(clave) {
    if (!currentUserId) {
        return null;
    }
    
    const claveCompleta = `accessibility_${currentUserId}_${clave}`;
    return localStorage.getItem(claveCompleta);
}

function limpiarPreferenciasUsuario() {
    if (!currentUserId) {
        return;
    }
    
    localStorage.removeItem(`accessibility_${currentUserId}_theme`);
    localStorage.removeItem(`accessibility_${currentUserId}_fontSize`);
}

btnPanel.addEventListener("click", () => {
    panel.classList.toggle("hidden");
});

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

function updateFontSize(size) {
    if (size < 10) size = 10;
    if (size > 26) size = 26;
    
    console.log("Aplicando tamaño de fuente:", size + "px");
    
    document.documentElement.style.setProperty("--font-size", size + "px");
    document.body.style.fontSize = size + "px";
    
    guardarPreferencia("fontSize", size);
    currentFontSize = size;
}

increaseText.addEventListener("click", () => {
    currentFontSize += 2;
    updateFontSize(currentFontSize);
});

decreaseText.addEventListener("click", () => {
    currentFontSize -= 2;
    updateFontSize(currentFontSize);
});

resetText.addEventListener("click", () => {
    currentFontSize = 16;
    updateFontSize(currentFontSize);
});

function cargarPreferenciasAccesibilidad() {
    const userId = obtenerUsuarioActual();
    
    if (!userId) {
        console.log("No hay usuario logueado, usando valores por defecto");
        return;
    }
    
    console.log(`Cargando preferencias de accesibilidad para usuario: ${userId}`);
    
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

window.addEventListener("DOMContentLoaded", () => {
    cargarPreferenciasAccesibilidad();
});

if (document.readyState === "complete" || document.readyState === "interactive") {
    cargarPreferenciasAccesibilidad();
}

window.limpiarAccesibilidadAlCerrarSesion = limpiarPreferenciasAlCerrarSesion;