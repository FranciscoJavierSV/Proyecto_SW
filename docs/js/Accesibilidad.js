const btnPanel = document.getElementById("accessibility-btn");
const panel = document.getElementById("accessibility-panel");
const toggleTheme = document.getElementById("toggle-theme");
const icon = document.getElementById("theme-icon");

const increaseText = document.getElementById("increase-text");
const decreaseText = document.getElementById("decrease-text");
const resetText = document.getElementById("reset-text");

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
