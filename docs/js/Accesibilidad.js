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
        alertaError("No hay usuario logueado");
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
    } else {
        icon.classList.replace("fa-sun", "fa-moon");
    }

    localStorage.setItem("theme", isDark ? "dark" : "light");
});

function updateFontSize(size) {
    document.documentElement.style.setProperty("--font-size", size + "px");
    localStorage.setItem("fontSize", size);
}

let size = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--font-size"));

increaseText.addEventListener("click", () => {
    size += 2;
    updateFontSize(size);
});

decreaseText.addEventListener("click", () => {
    if (size > 10) size -= 2;
    updateFontSize(size);
});

resetText.addEventListener("click", () => {
    size = 16;
    updateFontSize(size);
});

window.onload = () => {
    // tema
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        icon.classList.replace("fa-moon", "fa-sun");
    } else {
        icon.classList.replace("fa-sun", "fa-moon");
    }

    const savedSize = localStorage.getItem("fontSize");
    if (savedSize) {
        updateFontSize(parseInt(savedSize));
        size = parseInt(savedSize);
    }
};
