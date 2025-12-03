// ui.js - Manejo de la interfaz de usuario

class UIManager {
    constructor() {
        this.currentTab = 'dashboard';
        this.currentProfile = 'moderado';
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.closest('.nav-btn')));
        });

        // Transaction form
        const form = document.getElementById('transactionForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleAddTransaction(e));
        }

        // Toggle buttons
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleToggleType(e));
        });

        // Investment profile buttons
        document.querySelectorAll('.profile-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleProfileChange(e));
        });

        // Delete transaction buttons (delegated)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.delete-btn')) {
                this.handleDeleteTransaction(e);
            }
        });
    }

    switchTab(btn) {
        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');

        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

        // Show selected tab
        const tabName = btn.dataset.tab;
        this.currentTab = tabName;
        const tabElement = document.getElementById(tabName);
        if (tabElement) {
            tabElement.classList.add('active');
        }

        // Update title
        this.updatePageTitle();

        // Trigger updates
        setTimeout(() => this.updateDashboard(), 100);
    }

    updatePageTitle() {
        const titles = {
            dashboard: 'Resumen General',
            transactions: 'Control de Gastos',
            health: 'Salud Financiera',
            investments: 'Estrategia de Inversión'
        };
        document.getElementById('page-title').textContent = titles[this.currentTab] || 'Panel Principal';
    }

    handleToggleType(e) {
        const group = e.target.closest('.toggle-group');
        group.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        const type = e.target.dataset.type;
        const categoriaGroup = document.getElementById('categoriaGroup');
        if (type === 'ingreso') {
            categoriaGroup.style.display = 'none';
        } else {
            categoriaGroup.style.display = 'block';
        }
    }

    handleAddTransaction(e) {
        e.preventDefault();

        const monto = parseFloat(document.getElementById('monto').value);
        const descripcion = document.getElementById('descripcion').value;
        const tipo = document.querySelector('.toggle-btn.active').dataset.type;
        const categoria = tipo === 'ingreso' ? 'Salario' : document.getElementById('categoria').value;

        if (!monto || !descripcion) {
            alert('Por favor completa todos los campos');
            return;
        }

        const transaction = {
            id: Date.now(),
            tipo,
            monto,
            categoria,
            descripcion,
            fecha: new Date().toISOString().split('T')[0]
        };

        dataManager.addTransaction(transaction);

        // Clear form
        e.target.reset();
        document.querySelector('.toggle-btn.active').classList.remove('active');
        document.querySelector('[data-type="gasto"]').classList.add('active');

        // Update views
        this.updateTransactionsTable();
        this.updateDashboard();
    }

    handleDeleteTransaction(e) {
        const row = e.target.closest('tr');
        const id = parseInt(row.dataset.id);

        if (confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
            dataManager.deleteTransaction(id);
            this.updateTransactionsTable();
            this.updateDashboard();
        }
    }

    handleProfileChange(e) {
        const btn = e.target.closest('.profile-btn');
        document.querySelectorAll('.profile-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.currentProfile = btn.dataset.profile;
        ChartsManager.updateInvestmentCharts(this.currentProfile);
    }

    updatePageTitle() {
        const titles = {
            dashboard: 'Resumen General',
            transactions: 'Control de Gastos',
            health: 'Salud Financiera',
            investments: 'Estrategia de Inversión'
        };
        document.getElementById('page-title').textContent = titles[this.currentTab] || 'Panel Principal';
    }

    updateDashboard() {
        if (this.currentTab !== 'dashboard' && this.currentTab !== 'health' && this.currentTab !== 'investments') {
            return;
        }

        const transactions = dataManager.getTransactions();
        const totales = dataManager.calcularTotales();
        const saldo = totales.ingresos - totales.gastos;
        const tasaAhorro = dataManager.calcularTasaAhorro(totales);

        // Update dashboard cards
        document.getElementById('saldo').textContent = `$${Math.max(0, saldo).toLocaleString('es-CO')}`;
        document.getElementById('ingresos').textContent = `$${totales.ingresos.toLocaleString('es-CO')}`;
        document.getElementById('gastos').textContent = `$${totales.gastos.toLocaleString('es-CO')}`;
        document.getElementById('tasaAhorro').textContent = `${tasaAhorro}%`;

        const tasaMsg = tasaAhorro >= 20 ? '¡Excelente ritmo!' : 'Intenta llegar al 20%';
        document.getElementById('tasaAhorroMsg').textContent = tasaMsg;

        // Update patrimonio
        const ahorroMensual = Math.max(0, saldo);
        const proyeccion = dataManager.calcularProyeccion(this.currentProfile, ahorroMensual, 20);
        const patrimonio = proyeccion[proyeccion.length - 1]?.capital || 0;
        document.getElementById('patrimonio').textContent = `$${patrimonio.toLocaleString('es-CO')}`;

        // Update charts
        ChartsManager.updateDashboardCharts(totales, saldo);

        // Update health indicators
        this.updateHealthIndicators();
    }

    updateHealthIndicators() {
        const transactions = dataManager.getTransactions();
        const totales = dataManager.calcularTotales();
        const saldo = totales.ingresos - totales.gastos;
        const tasaAhorro = dataManager.calcularTasaAhorro(totales);
        const ratioDeuda = dataManager.calcularRatioDeuda();
        const fondoEmergencia = dataManager.calcularFondoEmergencia();

        document.getElementById('healthSavingsRate').textContent = `${tasaAhorro}%`;
        document.getElementById('healthSavingsMsg').textContent = 
            tasaAhorro >= 20 ? '¡Excelente! Estás por encima del 20% recomendado.' : 'Objetivo: Intenta llegar al 20%.';

        document.getElementById('healthDebtRatio').textContent = `${ratioDeuda}%`;
        document.getElementById('healthDebtMsg').textContent = 
            ratioDeuda <= 30 ? 'Saludable. Mantienes tus deudas bajo control.' : 'Alerta. Destinar más del 30-40% es riesgoso.';

        document.getElementById('healthEmergency').textContent = fondoEmergencia;
    }

    updateTransactionsTable() {
        const transactions = dataManager.getTransactions();
        const tbody = document.querySelector('#transactionsTable tbody');
        const emptyMsg = document.getElementById('emptyMsg');

        if (transactions.length === 0) {
            tbody.innerHTML = '';
            emptyMsg.style.display = 'block';
            return;
        }

        emptyMsg.style.display = 'none';
        tbody.innerHTML = transactions.map(t => `
            <tr data-id="${t.id}">
                <td>${t.descripcion}</td>
                <td>
                    <span class="category-badge ${t.tipo === 'ingreso' ? 'income' : ''}">
                        ${t.tipo === 'ingreso' ? 'Ingreso' : CATEGORIAS_GASTO[t.categoria]?.name || t.categoria}
                    </span>
                </td>
                <td>${t.fecha}</td>
                <td style="text-align: right; font-weight: bold; color: ${t.tipo === 'ingreso' ? '#10b981' : '#0f172a'}">
                    ${t.tipo === 'gasto' ? '-' : '+'}$${t.monto.toLocaleString('es-CO')}
                </td>
                <td style="text-align: right;">
                    <button class="delete-btn" title="Eliminar">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

// Instancia global
const uiManager = new UIManager();
