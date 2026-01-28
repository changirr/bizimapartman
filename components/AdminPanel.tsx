import React, { useState } from 'react';
import { getUnits, addSharedExpense, addPayment, addGeothermalRecord, getCleaningStatus, completeCleaning, updatePassword, addShopDebt, exportData, importData } from '../services/dataService';
import { TransactionType, UnitType } from '../types';
import { Save, RefreshCw, FileText, Download, Upload, CheckCircle, Flame, Zap, DollarSign } from 'lucide-react';

export const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'geo' | 'shared' | 'payment' | 'cleaning' | 'settings'>('geo');
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    const units = getUnits();
    const cleaningStatus = getCleaningStatus();

    // -- Forms --
    
    // Geothermal
    const [geoDate, setGeoDate] = useState(new Date().toISOString().split('T')[0]);
    const [geoUnitId, setGeoUnitId] = useState(units[0].id);
    const [geoAmount, setGeoAmount] = useState('');
    const [geoIdx1Start, setGeoIdx1Start] = useState('');
    const [geoIdx1End, setGeoIdx1End] = useState('');
    const [geoIdx2Start, setGeoIdx2Start] = useState('');
    const [geoIdx2End, setGeoIdx2End] = useState(''); // Dubleks extra

    const handleGeoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedUnit = units.find(u => u.id === geoUnitId);
        if(selectedUnit?.type === UnitType.SHOP) {
             addShopDebt(geoDate, parseFloat(geoAmount), "Dükkan Abonelik Borcu");
        } else {
             addGeothermalRecord(
                geoUnitId, 
                geoDate, 
                parseFloat(geoAmount), 
                parseFloat(geoIdx1Start), 
                parseFloat(geoIdx1End),
                geoIdx2Start ? parseFloat(geoIdx2Start) : undefined,
                geoIdx2End ? parseFloat(geoIdx2End) : undefined
            );
        }
        showMessage('Jeotermal kaydı eklendi!');
        setGeoAmount(''); setGeoIdx1Start(''); setGeoIdx1End('');
    };

    // Shared Expense
    const [expType, setExpType] = useState<TransactionType>(TransactionType.ELECTRICITY);
    const [expAmount, setExpAmount] = useState('');
    const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
    const [expDesc, setExpDesc] = useState('');

    const handleSharedSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addSharedExpense(expType, expDate, parseFloat(expAmount), expDesc);
        showMessage('Ortak gider paylaştırıldı!');
        setExpAmount(''); setExpDesc('');
    };

    // Payment
    const [payUnitId, setPayUnitId] = useState(units[0].id);
    const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
    const [payAmount, setPayAmount] = useState('');
    const [payDesc, setPayDesc] = useState('Aidat / Fatura Ödemesi');

    const handlePaySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addPayment(payUnitId, payDate, parseFloat(payAmount), payDesc);
        showMessage('Ödeme alındı!');
        setPayAmount('');
    };

    // Cleaning
    const [cleanDate, setCleanDate] = useState(new Date().toISOString().split('T')[0]);
    const [cleanDesc, setCleanDesc] = useState('Merdiven temizliği yaptırıldı');
    const [cleanPaid, setCleanPaid] = useState('');

    const handleCleanSubmit = () => {
        completeCleaning(cleanDate, cleanDesc, cleanPaid ? parseFloat(cleanPaid) : undefined);
        showMessage('Temizlik sırası güncellendi!');
        setCleanPaid('');
    };

    // Settings
    const [newPass, setNewPass] = useState('');
    const [jsonImport, setJsonImport] = useState('');

    const isDubleks = units.find(u => u.id === geoUnitId)?.name.includes('Dubleks');
    const isShop = units.find(u => u.id === geoUnitId)?.type === UnitType.SHOP;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 min-h-[600px] flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-2">
                <button onClick={() => setActiveTab('geo')} className={`p-3 text-left rounded-lg flex items-center gap-2 ${activeTab === 'geo' ? 'bg-orange-100 text-orange-700 font-bold' : 'hover:bg-slate-100'}`}>
                    <Flame size={18} /> Jeotermal
                </button>
                <button onClick={() => setActiveTab('shared')} className={`p-3 text-left rounded-lg flex items-center gap-2 ${activeTab === 'shared' ? 'bg-yellow-100 text-yellow-700 font-bold' : 'hover:bg-slate-100'}`}>
                    <Zap size={18} /> Elektrik / Asansör
                </button>
                <button onClick={() => setActiveTab('payment')} className={`p-3 text-left rounded-lg flex items-center gap-2 ${activeTab === 'payment' ? 'bg-green-100 text-green-700 font-bold' : 'hover:bg-slate-100'}`}>
                    <DollarSign size={18} /> Ödeme Girişi
                </button>
                <button onClick={() => setActiveTab('cleaning')} className={`p-3 text-left rounded-lg flex items-center gap-2 ${activeTab === 'cleaning' ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-slate-100'}`}>
                    <RefreshCw size={18} /> Merdiven Sırası
                </button>
                <div className="flex-grow"></div>
                <button onClick={() => setActiveTab('settings')} className={`p-3 text-left rounded-lg flex items-center gap-2 ${activeTab === 'settings' ? 'bg-slate-200 text-slate-800 font-bold' : 'hover:bg-slate-100'}`}>
                    <Save size={18} /> Yedek / Ayarlar
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-8">
                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 text-white ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                        <CheckCircle size={20} /> {message.text}
                    </div>
                )}

                {/* GEOTHERMAL TAB */}
                {activeTab === 'geo' && (
                    <form onSubmit={handleGeoSubmit} className="max-w-lg space-y-6">
                        <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Jeotermal & Dükkan Borçlandırma</h2>
                        <div>
                            <label className="block text-sm font-medium mb-1">Daire Seçin</label>
                            <select 
                                value={geoUnitId} 
                                onChange={(e) => setGeoUnitId(e.target.value)}
                                className="w-full p-2 border rounded"
                            >
                                {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium mb-1">Dönem (Tarih)</label>
                             <input type="date" value={geoDate} onChange={e => setGeoDate(e.target.value)} className="w-full p-2 border rounded" required />
                        </div>

                        {!isShop && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">İlk Endeks</label>
                                    <input type="number" value={geoIdx1Start} onChange={e => setGeoIdx1Start(e.target.value)} className="w-full p-2 border rounded" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Son Endeks</label>
                                    <input type="number" value={geoIdx1End} onChange={e => setGeoIdx1End(e.target.value)} className="w-full p-2 border rounded" required />
                                </div>
                            </div>
                        )}

                        {isDubleks && (
                             <div className="p-4 bg-slate-50 rounded border border-slate-200">
                                <p className="text-xs text-slate-500 mb-2">Dubleks 2. Sayaç (Opsiyonel)</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <input placeholder="2. Sayaç İlk" type="number" value={geoIdx2Start} onChange={e => setGeoIdx2Start(e.target.value)} className="w-full p-2 border rounded" />
                                    <input placeholder="2. Sayaç Son" type="number" value={geoIdx2End} onChange={e => setGeoIdx2End(e.target.value)} className="w-full p-2 border rounded" />
                                </div>
                             </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1">{isShop ? 'Abonelik / Borç Tutarı (TL)' : 'Hesaplanan Fatura Tutarı (TL)'}</label>
                            <input type="number" step="0.01" value={geoAmount} onChange={e => setGeoAmount(e.target.value)} className="w-full p-2 border rounded border-blue-300 ring-2 ring-blue-100" required />
                            <p className="text-xs text-slate-500 mt-1">Sistem otomatik hesap yapmaz, faturadaki tutarı buraya girin.</p>
                        </div>

                        <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded font-medium">Borç Kaydet</button>
                    </form>
                )}

                {/* SHARED EXPENSES TAB */}
                {activeTab === 'shared' && (
                    <form onSubmit={handleSharedSubmit} className="max-w-lg space-y-6">
                        <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Ortak Gider Girişi</h2>
                        <div className="bg-yellow-50 p-4 rounded text-sm text-yellow-800 mb-4">
                            Girdiğiniz tutar, Dükkan hariç <strong>3 daireye eşit</strong> bölünecektir.
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Gider Türü</label>
                            <select value={expType} onChange={(e) => setExpType(e.target.value as TransactionType)} className="w-full p-2 border rounded">
                                <option value={TransactionType.ELECTRICITY}>Elektrik Faturası</option>
                                <option value={TransactionType.ELEVATOR}>Asansör Bakım/Arıza</option>
                                <option value={TransactionType.OTHER_EXPENSE}>Diğer Giderler</option>
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium mb-1">Tarih</label>
                             <input type="date" value={expDate} onChange={e => setExpDate(e.target.value)} className="w-full p-2 border rounded" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Toplam Fatura Tutarı (TL)</label>
                            <input type="number" step="0.01" value={expAmount} onChange={e => setExpAmount(e.target.value)} className="w-full p-2 border rounded" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Açıklama</label>
                            <input type="text" value={expDesc} onChange={e => setExpDesc(e.target.value)} className="w-full p-2 border rounded" placeholder="Örn: Aralık 2024 Elektrik" required />
                        </div>
                        <button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded font-medium">Paylaştır ve Kaydet</button>
                    </form>
                )}

                {/* PAYMENT TAB */}
                {activeTab === 'payment' && (
                    <form onSubmit={handlePaySubmit} className="max-w-lg space-y-6">
                        <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Ödeme Al (Tahsilat)</h2>
                        <div>
                            <label className="block text-sm font-medium mb-1">Ödeme Yapan Daire</label>
                            <select value={payUnitId} onChange={(e) => setPayUnitId(e.target.value)} className="w-full p-2 border rounded">
                                {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium mb-1">Tarih</label>
                             <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} className="w-full p-2 border rounded" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Tutar (TL)</label>
                            <input type="number" step="0.01" value={payAmount} onChange={e => setPayAmount(e.target.value)} className="w-full p-2 border rounded" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Açıklama</label>
                            <input type="text" value={payDesc} onChange={e => setPayDesc(e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium">Tahsilatı İşle</button>
                    </form>
                )}

                {/* CLEANING TAB */}
                {activeTab === 'cleaning' && (
                    <div className="max-w-lg space-y-6">
                        <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Merdiven Temizliği Yönetimi</h2>
                        
                        <div className="bg-blue-50 p-6 rounded-lg text-center">
                            <h3 className="text-slate-500 uppercase text-xs font-bold mb-2">Şu Anki Sıra</h3>
                            <div className="text-3xl font-bold text-blue-700 mb-2">{cleaningStatus.nextUnit?.name}</div>
                            <p className="text-sm text-slate-600">Temizliği yaptırıp parasını ödemesi bekleniyor.</p>
                        </div>

                        <div className="border p-4 rounded-lg bg-white">
                            <h4 className="font-semibold mb-4">Sıradaki Daire İşlemi Tamamla</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">İşlem Tarihi</label>
                                    <input type="date" value={cleanDate} onChange={e => setCleanDate(e.target.value)} className="w-full p-2 border rounded" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Açıklama</label>
                                    <input type="text" value={cleanDesc} onChange={e => setCleanDesc(e.target.value)} className="w-full p-2 border rounded" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Ödenen Tutar (Opsiyonel)</label>
                                    <input type="number" value={cleanPaid} onChange={e => setCleanPaid(e.target.value)} className="w-full p-2 border rounded" placeholder="Abla ücreti..." />
                                </div>
                                <button onClick={handleCleanSubmit} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium">
                                    Temizlik Yapıldı & Sırayı Kaydır
                                </button>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-sm mb-2 text-slate-500">Gelecek Sıra Listesi</h4>
                            <ol className="list-decimal list-inside text-sm text-slate-700 bg-slate-50 p-4 rounded">
                                {cleaningStatus.queue.map((name, i) => (
                                    <li key={i} className={i === 0 ? 'font-bold text-blue-700' : ''}>{name}</li>
                                ))}
                            </ol>
                        </div>
                    </div>
                )}

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <div className="max-w-lg space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">Yönetici Şifresi</h2>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={newPass} 
                                    onChange={e => setNewPass(e.target.value)} 
                                    placeholder="Yeni şifre..."
                                    className="p-2 border rounded flex-1"
                                />
                                <button onClick={() => {
                                    if(newPass.length < 4) return showMessage('Şifre çok kısa', 'error');
                                    updatePassword(newPass);
                                    showMessage('Şifre değiştirildi');
                                    setNewPass('');
                                }} className="bg-slate-800 text-white px-4 rounded">Güncelle</button>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">Veri Yedekleme</h2>
                            <div className="flex flex-col gap-4">
                                <div className="p-4 bg-green-50 rounded border border-green-100">
                                    <p className="text-sm text-green-800 mb-2">Tüm apartman verilerini (işlemler, daireler, ayarlar) JSON dosyası olarak bilgisayarına indir.</p>
                                    <button onClick={() => {
                                        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportData());
                                        const downloadAnchorNode = document.createElement('a');
                                        downloadAnchorNode.setAttribute("href", dataStr);
                                        downloadAnchorNode.setAttribute("download", "melahat_simavlioglu_yedek.json");
                                        document.body.appendChild(downloadAnchorNode);
                                        downloadAnchorNode.click();
                                        downloadAnchorNode.remove();
                                    }} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded">
                                        <Download size={18} /> Yedeği İndir
                                    </button>
                                </div>

                                <div className="p-4 bg-blue-50 rounded border border-blue-100">
                                    <p className="text-sm text-blue-800 mb-2">Daha önce alınan yedeği geri yükle.</p>
                                    <textarea 
                                        className="w-full border p-2 text-xs h-20 mb-2 font-mono"
                                        placeholder="Yedek dosyasının içeriğini buraya yapıştır..."
                                        value={jsonImport}
                                        onChange={e => setJsonImport(e.target.value)}
                                    ></textarea>
                                    <button onClick={() => {
                                        if(importData(jsonImport)) {
                                            showMessage('Yedek başarıyla yüklendi. Sayfa yenileniyor...');
                                            setTimeout(() => window.location.reload(), 1500);
                                        } else {
                                            showMessage('Geçersiz yedek verisi', 'error');
                                        }
                                    }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded">
                                        <Upload size={18} /> Yedeği Yükle
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};