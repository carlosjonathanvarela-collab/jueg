// charts.js - Gráficos con Chart.js

class ChartsManager {
    static gasto_chart = null;
    static flujo_chart = null;
    static portfolio_chart = null;
    static projection_chart = null;

    static updateDashboardCharts(totales, saldo) {
        this.updateGastosChart();
        this.updateFlujoChart(totales);
    }

    static updateGastosChart() {
        const gastoPorCategoria = dataManager.calcularGastosPorCategoria();
        
        const labels = Object.keys(gastoPorCategoria).map(cat => CATEGORIAS_GASTO[cat]?.name || cat);
        const data = Object.values(gastoPorCategoria);
        const colors = Object.keys(gastoPorCategoria).map(cat => CATEGORIAS_GASTO[cat]?.color || '#999');

        const ctx = document.getElementById('gastos-chart');
        if (!ctx) return;

        if (this.gasto_chart) {
            this.gasto_chart.destroy();
        }

        this.gasto_chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderColor: 'white',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12,
                                weight: 500
                            },
                            color: '#64748b'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function(context) {
                                return `$${context.parsed.toLocaleString('es-CO')}`;
                            }
                        }
                    }
                }
            }
        });
    }

    static updateFlujoChart(totales) {
        const ctx = document.getElementById('flujo-chart');
        if (!ctx) return;

        if (this.flujo_chart) {
            this.flujo_chart.destroy();
        }

        this.flujo_chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Ingresos', 'Gastos'],
                datasets: [{
                    label: 'Monto',
                    data: [totales.ingresos, totales.gastos],
                    backgroundColor: ['#10b981', '#ef4444'],
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                indexAxis: 'x',
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return `$${context.parsed.y.toLocaleString('es-CO')}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return `$${value / 1000}k`;
                            },
                            color: '#94a3b8',
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            color: '#f1f5f9'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#64748b',
                            font: {
                                size: 13,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    static updateInvestmentCharts(perfilRiesgo) {
        this.updatePortfolioChart(perfilRiesgo);
        this.updateProjectionChart(perfilRiesgo);
        this.updateReturnRate(perfilRiesgo);
    }

    static updatePortfolioChart(perfilRiesgo) {
        const profile = PERFILES_RIESGO[perfilRiesgo];
        const ctx = document.getElementById('portfolio-chart');
        if (!ctx) return;

        if (this.portfolio_chart) {
            this.portfolio_chart.destroy();
        }

        this.portfolio_chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Renta Fija (Bonos/Deuda)', 'Renta Variable (Acciones)'],
                datasets: [{
                    data: [profile.rentaFija, profile.rentaVariable],
                    backgroundColor: ['#0088FE', '#00C49F'],
                    borderColor: 'white',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12,
                                weight: 500
                            },
                            color: '#64748b'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    static updateProjectionChart(perfilRiesgo) {
        const transactions = dataManager.getTransactions();
        const totales = dataManager.calcularTotales();
        const saldo = totales.ingresos - totales.gastos;
        const ahorroMensual = Math.max(0, saldo);

        const ctx = document.getElementById('projection-chart');
        if (!ctx) return;

        if (this.projection_chart) {
            this.projection_chart.destroy();
        }

        if (ahorroMensual === 0) {
            ctx.parentElement.innerHTML = '<div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8fafc; border-radius: 8px; border: 1px dashed #e2e8f0;"><p style="color: #94a3b8; font-weight: 500;">Necesitas tener un saldo positivo (ahorro) para ver proyecciones.</p><button onclick="uiManager.switchTab(document.querySelector(\'[data-tab=transactions]\')); " style="margin-top: 12px; padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;">Ir a transacciones</button></div>';
            return;
        }

        const proyeccion = dataManager.calcularProyeccion(perfilRiesgo, ahorroMensual, 20);

        this.projection_chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: proyeccion.map(d => `Año ${d.year}`),
                datasets: [{
                    label: 'Capital Acumulado',
                    data: proyeccion.map(d => d.capital),
                    borderColor: '#4F46E5',
                    backgroundColor: 'rgba(79, 70, 229, 0.05)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#4F46E5'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function(context) {
                                return `Capital: $${context.parsed.y.toLocaleString('es-CO')}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return `$${(value / 1000).toFixed(0)}k`;
                            },
                            color: '#94a3b8',
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            color: '#f1f5f9'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#64748b',
                            font: {
                                size: 11
                            },
                            maxRotation: 45,
                            minRotation: 0
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    static updateReturnRate(perfilRiesgo) {
        const rate = (PERFILES_RIESGO[perfilRiesgo].tasaRetorno * 100).toFixed(0);
        const rateElement = document.getElementById('returnRate');
        if (rateElement) {
            rateElement.textContent = `${rate}%`;
        }
    }
}
