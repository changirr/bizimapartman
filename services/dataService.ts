import { AppState, CleaningLog, Transaction, TransactionType, Unit, UnitType, DashboardSummary } from '../types';
import { INITIAL_UNITS, INITIAL_CLEANING_QUEUE, DEFAULT_PASSWORD, STORAGE_KEY } from '../constants';

// --- Helper for IDs ---
const generateId = () => Math.random().toString(36).substr(2, 9);

// --- State Management ---
const getInitialState = (): AppState => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    
    // Seed initial cleaning log
    const initialCleaning: CleaningLog = {
        id: generateId(),
        date: new Date(Date.now() - 12096e5).toISOString().split('T')[0], // 2 weeks ago
        completedByUnitId: 'u3',
        description: 'Sistem başlangıç kaydı - Merdiven temizliği yaptırıldı ve ödedi',
        amountPaid: 0
    };

    return {
        units: INITIAL_UNITS,
        transactions: [],
        cleaningLogs: [initialCleaning],
        cleaningQueue: INITIAL_CLEANING_QUEUE,
        password: DEFAULT_PASSWORD
    };
};

let state: AppState = getInitialState();

const saveState = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

// --- Public Accessors ---

export const checkPassword = (input: string): boolean => {
    return input === state.password;
};

export const updatePassword = (newPass: string) => {
    state.password = newPass;
    saveState();
};

export const getUnits = (): Unit[] => state.units;

export const getTransactions = (month?: string, unitId?: string): Transaction[] => {
    let filtered = state.transactions;
    if (month) {
        filtered = filtered.filter(t => t.month === month);
    }
    if (unitId) {
        filtered = filtered.filter(t => t.unitId === unitId);
    }
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getUnitBalance = (unitId: string): number => {
    const unitTrans = state.transactions.filter(t => t.unitId === unitId);
    let debt = 0;
    let paid = 0;

    unitTrans.forEach(t => {
        if (t.type === TransactionType.PAYMENT) {
            paid += t.amount;
        } else {
            debt += t.amount;
        }
    });

    return debt - paid; // Positive means debt
};

export const getDashboardSummary = (month: string): DashboardSummary => {
    const monthTrans = state.transactions.filter(t => t.month === month);
    
    let totalExpense = 0; // Bills charged to residents
    let totalIncome = 0; // Payments collected
    let geoTotal = 0;

    monthTrans.forEach(t => {
        if (t.type === TransactionType.PAYMENT) {
            totalIncome += t.amount;
        } else {
            totalExpense += t.amount;
            if (t.type === TransactionType.GEOTHERMAL) {
                geoTotal += t.amount;
            }
        }
    });

    // Total Debt is global, not just this month
    let totalDebt = 0;
    state.units.forEach(u => {
        const balance = getUnitBalance(u.id);
        if (balance > 0) totalDebt += balance;
    });

    return {
        totalExpense,
        totalIncome,
        totalDebt,
        geoTotal
    };
};

// --- Action Logic ---

export const addPayment = (unitId: string, date: string, amount: number, description: string) => {
    const month = date.substring(0, 7);
    const newTrans: Transaction = {
        id: generateId(),
        unitId,
        date,
        month,
        amount,
        type: TransactionType.PAYMENT,
        description
    };
    state.transactions.push(newTrans);
    saveState();
};

// Calculates split and adds debt to units
export const addSharedExpense = (
    type: TransactionType,
    date: string,
    totalAmount: number,
    description: string,
    file?: any // Placeholder for file logic
) => {
    const month = date.substring(0, 7);
    
    // Logic: Electric split 3 ways (No Shop), Elevator split 3 ways (No Shop), Others split 3 ways (Default)
    // If requirement changes to include shop in "Other", modify here.
    // Prompt says: Electric (3 daire), Elevator (3 daire), Other (Default: 3 daire)
    
    const targetUnits = state.units.filter(u => u.type === UnitType.RESIDENCE); // Exclude Shop
    const splitAmount = totalAmount / targetUnits.length;

    targetUnits.forEach(u => {
        const t: Transaction = {
            id: generateId(),
            unitId: u.id,
            date,
            month,
            amount: parseFloat(splitAmount.toFixed(2)),
            type,
            description: `${description} (Pay: 1/${targetUnits.length})`
        };
        state.transactions.push(t);
    });
    saveState();
};

export const addGeothermalRecord = (
    unitId: string,
    date: string,
    amount: number,
    idx1Start: number, idx1End: number,
    idx2Start?: number, idx2End?: number
) => {
    const month = date.substring(0, 7);
    const t: Transaction = {
        id: generateId(),
        unitId,
        date,
        month,
        amount,
        type: TransactionType.GEOTHERMAL,
        description: `Jeotermal Faturası - ${month}`,
        geoIndexStart: idx1Start,
        geoIndexEnd: idx1End,
        geoIndexStart2: idx2Start,
        geoIndexEnd2: idx2End
    };
    state.transactions.push(t);
    saveState();
};

export const addShopDebt = (date: string, amount: number, description: string) => {
    const month = date.substring(0, 7);
    const shop = state.units.find(u => u.type === UnitType.SHOP);
    if (!shop) return;

    const t: Transaction = {
        id: generateId(),
        unitId: shop.id,
        date,
        month,
        amount,
        type: TransactionType.GEOTHERMAL, // Or Other, but usually Subscription debt goes here
        description: description || "Dükkan Abonelik Borcu"
    };
    state.transactions.push(t);
    saveState();
};

// --- Cleaning Module ---

export const getCleaningStatus = () => {
    const lastLog = state.cleaningLogs[state.cleaningLogs.length - 1];
    const currentQueue = state.cleaningQueue;
    
    const nextUnitId = currentQueue[0];
    const nextUnit = state.units.find(u => u.id === nextUnitId);
    
    return {
        lastCompleted: {
            unitName: state.units.find(u => u.id === lastLog.completedByUnitId)?.name || 'Bilinmiyor',
            date: lastLog.date
        },
        nextUnit: nextUnit,
        queue: currentQueue.map(id => state.units.find(u => u.id === id)?.name)
    };
};

export const completeCleaning = (date: string, description: string, paidAmount?: number) => {
    const currentQueue = [...state.cleaningQueue];
    const doerId = currentQueue.shift(); // Remove first
    
    if (!doerId) return;

    currentQueue.push(doerId); // Add to end (Rotation)

    const log: CleaningLog = {
        id: generateId(),
        date,
        completedByUnitId: doerId,
        description,
        amountPaid: paidAmount
    };

    state.cleaningLogs.push(log);
    state.cleaningQueue = currentQueue;
    saveState();
};

export const getCleaningLogs = () => state.cleaningLogs;

// --- Data Export/Import ---
export const exportData = () => JSON.stringify(state);
export const importData = (json: string) => {
    try {
        const parsed = JSON.parse(json);
        if (parsed.units && parsed.transactions) {
            state = parsed;
            saveState();
            return true;
        }
    } catch (e) {
        return false;
    }
    return false;
};