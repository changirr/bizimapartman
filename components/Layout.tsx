import React from 'react';
import { Building2, ShieldCheck, LogOut } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
    isAdmin: boolean;
    onLoginClick: () => void;
    onLogoutClick: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, isAdmin, onLoginClick, onLogoutClick }) => {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <Building2 size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-tight hidden sm:block">Melahat Simavlıoğlu</h1>
                            <div className="text-xs text-slate-400">Apartman Yönetim Sistemi</div>
                        </div>
                    </div>
                    
                    <div>
                        {isAdmin ? (
                            <button 
                                onClick={onLogoutClick}
                                className="flex items-center gap-2 text-sm bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition-colors"
                            >
                                <LogOut size={16} />
                                <span className="hidden sm:inline">Çıkış</span>
                            </button>
                        ) : (
                            <button 
                                onClick={onLoginClick}
                                className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
                            >
                                <ShieldCheck size={14} />
                                <span>Yönetici Girişi</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>
            
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
            
            <footer className="bg-slate-100 border-t border-slate-200 mt-12 py-8 text-center text-slate-500 text-sm">
                <p>Kurtuluş Mahallesi, Sanayi Sokak No:9, Soma / MANİSA</p>
                <p className="mt-2 text-xs">Simavlıoğlu Apartman Yönetim Yazılımı v1.0</p>
            </footer>
        </div>
    );
};