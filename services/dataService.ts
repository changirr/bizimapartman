import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { AppState, CleaningLog, Transaction, TransactionType, Unit, UnitType, DashboardSummary } from '../types';
import { INITIAL_UNITS, INITIAL_CLEANING_QUEUE, DEFAULT_PASSWORD } from '../constants';

// --- Firebase Yapılandırması ---
// Bu bilgiler Vercel'e girdiğin Environment Variables'tan çekilir
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// Veriler Firebase'de bu isimle bir dökümanda saklanacak
const DOC_REF = doc(db, "apartman_verileri", "ana_durum");

// --- Kimlik Oluşturucu ---
const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Uygulama Durumu (State) ---
let state: AppState = {
    units: INITIAL_UNITS,
    transactions: [],
    cleaningLogs: [],
    cleaningQueue: INITIAL_CLEANING_QUEUE,
    password: DEFAULT_PASSWORD
};

// Verileri Firebase'e Kaydetme Fonksiyonu
const saveToFirebase = async () => {
    try {
        await setDoc(DOC_REF, state);
    } catch (e) {
        console.error("Firebase kayıt hatası:", e);
    }
};

// Uygulama açıldığında verileri Firebase'den çeken ana fonksiyon
export const syncWithFirebase = async () => {
    try {
        const docSnap = await getDoc(DOC_REF);
        if (docSnap.exists()) {
            state = docSnap.data() as AppState;
        } else {
            // Eğer veritabanı boşsa (ilk kurulum), başlangıç verilerini yükle
            await saveToFirebase();
        }
    } catch (e) {
        console.error("Firebase senkronizasyon hatası:", e);
    }
};

// --- Veri Erişim Fonksiyonları ---

export const checkPassword = (input: string): boolean => input === state.password;

export const updatePassword = async (newPass: string) => {
    state.password = newPass;
    await saveToFirebase();
};

export const getUnits = (): Unit[] => state.units;

export const getTransactions = (month?: string, unitId?: string): Transaction[] => {
    let filtered = state.transactions;
    if (month) filtered = filtered.filter(t => t.month === month);
    if (unitId) filtered = filtered.filter(t => t.unitId === unitId);
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getUnitBalance = (unitId: string): number => {
    const unitTrans = state.transactions.filter(t => t.unitId === unitId);
    let debt = 0;
    let paid = 0;
    unitTrans.forEach(t => {
        if (t.type === TransactionType.PAYMENT) paid += t.amount;
        else debt += t.amount;
    });
    return debt - paid;
};

export const getDashboardSummary = (month: string): DashboardSummary => {
    const monthTrans = state.transactions.filter(t => t.month === month);
    let totalExpense = 0, totalIncome = 0, geoTotal = 0;

    monthTrans.forEach(t => {
        if (t.type === TransactionType.PAYMENT) totalIncome += t.amount;
        else {
            totalExpense += t.amount;
            if (t.type === TransactionType.GEOTHERMAL) geoTotal += t.amount;
        }
    });

    let totalDebt = 0;
    state.units.forEach(u => {
        const balance = getUnitBalance(u.id);
        if (balance > 0) totalDebt += balance;
    });

    return { totalExpense, totalIncome, totalDebt, geoTotal };
};

// --- İşlem Mantığı ---

export const addPayment = async (unitId: string, date: string, amount: number, description: string) => {
    const newTrans: Transaction = {
        id: generateId(),
        unitId, date, month: date.substring(0, 7),
        amount, type: TransactionType.PAYMENT, description
    };
    state.transactions.push(newTrans);
    await saveToFirebase();
};

export const addSharedExpense = async (type: TransactionType, date: string, totalAmount: number, description: string) => {
    const targetUnits = state.units.filter(u => u.type === UnitType.RESIDENCE);
    const splitAmount = totalAmount / targetUnits.length;

    targetUnits.forEach(u => {
        state.transactions.push({
            id: generateId(),
            unitId: u.id,
            date,
            month: date.substring(0, 7),
            amount: parseFloat(splitAmount.toFixed(2)),
            type,
            description: `${description} (Pay: 1/${targetUnits.length})`
        });
    });
    await saveToFirebase();
};

export const completeCleaning = async (date: string, description: string, paidAmount?: number) => {
    const currentQueue = [...state.cleaningQueue];
    const doerId = currentQueue.shift();
    if (!doerId) return;

    currentQueue.push(doerId);
    state.cleaningLogs.push({
        id: generateId(),
        date,
        completedByUnitId: doerId,
        description,
        amountPaid: paidAmount
    });
    state.cleaningQueue = currentQueue;
    await saveToFirebase();
};

export const getCleaningStatus = () => {
    const lastLog = state.cleaningLogs[state.cleaningLogs.length - 1] || { completedByUnitId: 'u1', date: '' };
    const nextUnitId = state.cleaningQueue[0];
    return {
        lastCompleted: {
            unitName: state.units.find(u => u.id === lastLog.completedByUnitId)?.name || 'Bilinmiyor',
            date: lastLog.date
        },
        nextUnit: state.units.find(u => u.id === nextUnitId),
        queue: state.cleaningQueue.map(id => state.units.find(u => u.id === id)?.name)
    };
};

export const getCleaningLogs = () => state.cleaningLogs;