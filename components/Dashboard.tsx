import React, { useState, useMemo } from 'react';
import { getDashboardSummary, getUnits, getUnitBalance, getTransactions, getCleaningStatus } from '../services/dataService';
import { Unit, TransactionType } from '../types';
import { Users, Droplet, Zap, ArrowRight, Wallet, History } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

export const Dashboard: React.FC = () => {
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7));
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

    const summary = useMemo(() => getDashboardSummary(selectedMonth), [selectedMonth]);
    const units = getUnits();
    const cleaningStatus = getCleaningStatus();

    const unitTransactions = useMemo(() => {
        if (!selectedUnit) return [];
        return getTransactions(undefined, selectedUnit.id);
    }, [selectedUnit]);

    // Format currency
    const tryFormatter = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });

    // Chart Data
    const chartData = [
        { name: 'Gelir', value: summary.totalIncome, color: '#10b981' },
        { name: 'Gider', value: summary.totalExpense, color: '#ef4444' },
    ];

    const handleUnitClick = (unit: Unit) => {
        setSelectedUnit(unit);
        // Scroll to detail
        setTimeout(() => {
            document.getElementById('unit-detail')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    return (
        <div className="space-y-8">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="text-slate-500 text-sm mb-1">Seçili Ay</div>
                    <input 
                        type="month" 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full border-none p-0 text-xl font-bold text-slate-800 bg-transparent focus:ring-0 cursor-pointer"
                    />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <div className="text-slate-500 text-sm mb-1">Bu Ay Toplam Gider</div>
                        <div className="text-2xl font-bold text-slate-800">{tryFormatter.format(summary.totalExpense)}</div>
                    </div>
                    <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                        <Wallet size={20} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <div className="text-slate-500 text-sm mb-1">Bu Ay Toplam Gelir</div>
                        <div className="text-2xl font-bold text-slate-800">{tryFormatter.format(summary.totalIncome)}</div>
                    </div>
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <Wallet size={20} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <div className="text-slate-500 text-sm mb-1">Toplam Alacak (Borç)</div>
                        <div className="text-2xl font-bold text-blue-600">{tryFormatter.format(summary.totalDebt)}</div>
                    </div>
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <History size={20} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Unit List & Debt Table */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-800">Daire Durumları</h2>
                        <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">Detay için tıklayın</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3">Daire</th>
                                    <th className="px-6 py-3">Sakin</th>
                                    <th className="px-6 py-3 text-right">Güncel Bakiye</th>
                                    <th className="px-6 py-3 text-center">İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {units.map((unit) => {
                                    const balance = getUnitBalance(unit.id);
                                    return (
                                        <tr 
                                            key={unit.id} 
                                            onClick={() => handleUnitClick(unit)}
                                            className={`border-b border-slate-50 hover:bg-blue-50 cursor-pointer transition-colors ${selectedUnit?.id === unit.id ? 'bg-blue-50' : ''}`}
                                        >
                                            <td className="px-6 py-4 font-medium text-slate-900">{unit.name}</td>
                                            <td className="px-6 py-4 text-slate-600">{unit.residentName}</td>
                                            <td className={`px-6 py-4 text-right font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {balance > 0 ? `${tryFormatter.format(balance)} Borç` : 'Borcu Yok'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <ArrowRight size={16} className="mx-auto text-slate-300" />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Cleaning & Chart */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase mb-4 tracking-wider">Merdiven Temizliği</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                                <div className="mt-1"><Users size={16} className="text-green-600" /></div>
                                <div>
                                    <div className="text-xs text-green-700 font-semibold uppercase">Son Yapan</div>
                                    <div className="text-sm font-bold text-slate-800">{cleaningStatus.lastCompleted.unitName}</div>
                                    <div className="text-xs text-slate-500">{cleaningStatus.lastCompleted.date}</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="w-0.5 h-6 bg-slate-200"></div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100 ring-2 ring-blue-500 ring-offset-2">
                                <div className="mt-1"><Users size={16} className="text-blue-600" /></div>
                                <div>
                                    <div className="text-xs text-blue-700 font-semibold uppercase">Şimdi Sırada</div>
                                    <div className="text-lg font-bold text-slate-800">{cleaningStatus.nextUnit?.name || 'Belirsiz'}</div>
                                    <div className="text-xs text-blue-600 animate-pulse">Temizlik bekleniyor</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-64">
                         <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2">Ay Özeti</h3>
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    innerRadius={40}
                                    outerRadius={60}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip formatter={(val: number) => tryFormatter.format(val)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Unit Detail Section (Appears when clicked) */}
            {selectedUnit && (
                <div id="unit-detail" className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-fade-in-up">
                    <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold">{selectedUnit.name} Detayı</h2>
                            <p className="opacity-80">Sakin: {selectedUnit.residentName} | Ev Sahibi: {selectedUnit.ownerName || '-'}</p>
                            <p className="opacity-60 text-sm mt-1">{selectedUnit.phone}</p>
                        </div>
                        <div className="text-right">
                             <div className="text-sm opacity-70">Toplam Borç</div>
                             <div className="text-3xl font-bold">{tryFormatter.format(getUnitBalance(selectedUnit.id))}</div>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <History size={20} /> Hesap Hareketleri
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3">Tarih</th>
                                        <th className="px-4 py-3">Tür</th>
                                        <th className="px-4 py-3">Açıklama</th>
                                        <th className="px-4 py-3 text-right">Borç</th>
                                        <th className="px-4 py-3 text-right">Ödeme</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {unitTransactions.length === 0 ? (
                                        <tr><td colSpan={5} className="p-4 text-center text-slate-400">Kayıt bulunamadı.</td></tr>
                                    ) : (
                                        unitTransactions.map(t => (
                                            <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50">
                                                <td className="px-4 py-3 text-slate-600">{t.date}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold
                                                        ${t.type === TransactionType.PAYMENT ? 'bg-green-100 text-green-700' : 
                                                          t.type === TransactionType.GEOTHERMAL ? 'bg-orange-100 text-orange-700' :
                                                          t.type === TransactionType.ELECTRICITY ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'
                                                        }`}>
                                                        {t.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={t.description}>{t.description}</td>
                                                <td className="px-4 py-3 text-right font-medium text-red-600">
                                                    {t.type !== TransactionType.PAYMENT ? tryFormatter.format(t.amount) : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium text-green-600">
                                                    {t.type === TransactionType.PAYMENT ? tryFormatter.format(t.amount) : '-'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};