 let bebida = 12 + 8 + 15 + 20;
    let salado = 25 + 18 + 30 + 10;
    let postre = 22 + 35 + 28;

    let total = bebida + salado + postre;

    document.getElementById("bebida-percent").innerText = ((bebida / total) * 100).toFixed(1) + "%";
    document.getElementById("salado-percent").innerText = ((salado / total) * 100).toFixed(1) + "%";
    document.getElementById("postre-percent").innerText = ((postre / total) * 100).toFixed(1) + "%";

    let ctx = document.getElementById("ventasChart").getContext("2d");

    new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Bebida", "Salado", "Postre"],
            datasets: [{
                data: [bebida, salado, postre],
                backgroundColor: ["#C19A6B", "#8B6B4A", "#D4C4B0"]
            }]
        },
        options: {
            plugins: {
                legend: { display: false }
            }
        }
    });