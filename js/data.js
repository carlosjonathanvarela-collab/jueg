// data.js - Datos y configuración

const CATEGORIAS_GASTO = {
    alimentacion: { name: 'Alimentación', color: '#FF8042' },
    vivienda: { name: 'Vivienda', color: '#0088FE' },
    transporte: { name: 'Transporte', color: '#00C49F' },
    servicios: { name: 'Servicios', color: '#FFBB28' },
    entretenimiento: { name: 'Entretenimiento', color: '#A28DFF' },
    salud: { name: 'Salud', color: '#FF6B6B' },
    educacion: { name: 'Educación', color: '#4ECDC4' },
    deuda: { name: 'Pago de Deuda', color: '#C44E4E' },
    otros: { name: 'Otros', color: '#95A5A6' }
};

const PERFILES_RIESGO = {
    conservador: {
        nombre: 'Conservador',
        rentaFija: 70,
        rentaVariable: 30,
        tasaRetorno: 0.05,
        descripcion: 'Prioriza la preservación del capital.'
    },
    moderado: {
        nombre: 'Moderado',
        rentaFija: 50,
        rentaVariable: 50,
        tasaRetorno: 0.08,
        descripcion: 'Balance entre seguridad y crecimiento.'
    },
    agresivo: {
        nombre: 'Agresivo',
        rentaFija: 30,
        rentaVariable: 70,
        tasaRetorno: 0.10,
        descripcion: 'Busca maximizar rendimientos.'
    }
};

const DATOS_INICIALES = [
    { id: 1, tipo: 'ingreso', monto: 3500, categoria: 'Salario', fecha: '2024-12-01', descripcion: 'Sueldo Mensual' },
    { id: 2, tipo: 'gasto', monto: 800, categoria: 'vivienda', fecha: '2024-12-02', descripcion: 'Renta' },
    { id: 3, tipo: 'gasto', monto: 300, categoria: 'alimentacion', fecha: '2024-12-05', descripcion: 'Supermercado' },
    { id: 4, tipo: 'gasto', monto: 100, categoria: 'servicios', fecha: '2024-12-06', descripcion: 'Internet y Luz' },
    { id: 5, tipo: 'gasto', monto: 200, categoria: 'transporte', fecha: '2024-12-08', descripcion: 'Gasolina' },
    { id: 6, tipo: 'gasto', monto: 150, categoria: 'entretenimiento', fecha: '2024-12-10', descripcion: 'Cine y Cena' }
];

// Gestión de datos en localStorage
class DataManager {
    constructor() {
        this.loadData();
    }

    loadData() {
        const stored = localStorage.getItem('finanzas360_transactions');
        this.transacciones = stored ? JSON.parse(stored) : [...DATOS_INICIALES];
    }

    saveData() {
        localStorage.setItem('finanzas360_transactions', JSON.stringify(this.transacciones));
    }

    addTransaction(transaccion) {
        this.transacciones.unshift(transaccion);
        this.saveData();
    }

    deleteTransaction(id) {
        this.transacciones = this.transacciones.filter(t => t.id !== id);
        this.saveData();
    }

    getTransactions() {
        return this.transacciones;
    }

    // Cálculos
    calcularTotales() {
        return this.transacciones.reduce((acc, t) => {
            if (t.tipo === 'ingreso') acc.ingresos += t.monto;
            if (t.tipo === 'gasto') acc.gastos += t.monto;
            return acc;
        }, { ingresos: 0, gastos: 0 });
    }

    calcularGastosPorCategoria() {
        const map = {};
        this.transacciones
            .filter(t => t.tipo === 'gasto')
            .forEach(t => {
                if (!map[t.categoria]) map[t.categoria] = 0;
                map[t.categoria] += t.monto;
            });
        return map;
    }

    calcularTasaAhorro(totales) {
        if (totales.ingresos === 0) return 0;
        const saldo = totales.ingresos - totales.gastos;
        return ((Math.max(0, saldo) / totales.ingresos) * 100).toFixed(1);
    }

    calcularRatioDeuda() {
        const totales = this.calcularTotales();
        if (totales.ingresos === 0) return 0;
        const deuda = this.transacciones
            .filter(t => t.tipo === 'gasto' && t.categoria === 'deuda')
            .reduce((sum, t) => sum + t.monto, 0);
        return ((deuda / totales.ingresos) * 100).toFixed(1);
    }

    calcularFondoEmergencia() {
        const totales = this.calcularTotales();
        if (totales.gastos === 0) return 0;
        const saldo = totales.ingresos - totales.gastos;
        return (saldo / totales.gastos).toFixed(1);
    }

    calcularProyeccion(perfilRiesgo, ahorroMensual, anos = 20) {
        const data = [];
        let capital = ahorroMensual * 12;
        const aporteAnual = ahorroMensual * 12;
        const tasa = PERFILES_RIESGO[perfilRiesgo].tasaRetorno;

        for (let year = 0; year <= anos; year++) {
            data.push({
                year: year,
                capital: Math.round(capital)
            });
            capital = (capital + aporteAnual) * (1 + tasa);
        }
        return data;
    }
}

// Instancia global
const dataManager = new DataManager();
