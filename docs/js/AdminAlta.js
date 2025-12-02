const ctx = document.getElementById('inventoryChart').getContext('2d');
        
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Bebida', 'Salado', 'Postre'],
                datasets: [{
                    data: [25, 40, 35],
                    backgroundColor: ['#C19A6B', '#8B6B4A', '#D4C4B0'],
                    borderColor: '#FFFFFF',
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                }
            }
        });