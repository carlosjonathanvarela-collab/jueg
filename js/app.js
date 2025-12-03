// app.js - Inicialización de la aplicación

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar la aplicación
    initializeApp();
});

function initializeApp() {
    // Cargar datos y renderizar
    updateAllViews();
}

function updateAllViews() {
    // Actualizar tabla de transacciones
    uiManager.updateTransactionsTable();

    // Actualizar dashboard
    uiManager.updateDashboard();

    // Actualizar gráficos de inversión
    ChartsManager.updateInvestmentCharts(uiManager.currentProfile);
}

// Actualizar vista cuando se vuelve a la pestaña (visibilidad)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        updateAllViews();
    }
});
