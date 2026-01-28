export enum UnitType {
    RESIDENCE = 'DAIRE',
    SHOP = 'DUKKAN'
}

export interface Unit {
    id: string;
    name: string;
    residentName: string;
    ownerName?: string;
    phone: string;
    type: UnitType;
    floor?: number;
}

export enum TransactionType {
    GEOTHERMAL = 'JEOTERMAL',
    ELECTRICITY = 'ELEKTRIK',
    ELEVATOR = 'ASANSOR',
    OTHER_EXPENSE = 'DIGER',
    PAYMENT = 'ODEME', // Income
    CLEANING = 'TEMIZLIK'
}

export interface Transaction {
    id: string;
    unitId: string;
    date: string; // YYYY-MM-DD
    month: string; // YYYY-MM used for grouping
    amount: number;
    type: TransactionType;
    description: string;
    
    // Geothermal specific
    geoIndexStart?: number;
    geoIndexEnd?: number;
    geoIndexStart2?: number; // For Dubleks second meter
    geoIndexEnd2?: number;   // For Dubleks second meter
}

export interface CleaningLog {
    id: string;
    date: string;
    completedByUnitId: string;
    amountPaid?: number; // Optional
    description: string;
}

export interface AppState {
    units: Unit[];
    transactions: Transaction[];
    cleaningLogs: CleaningLog[];
    cleaningQueue: string[]; // Unit IDs in order
    password: string;
}

export interface DashboardSummary {
    totalExpense: number;
    totalIncome: number;
    totalDebt: number;
    geoTotal: number;
}