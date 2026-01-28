import React, { useState } from 'react';
import { checkPassword } from '../services/dataService';
import { Lock } from 'lucide-react';

interface Props {
    onSuccess: () => void;
}

export const AdminLogin: React.FC<Props> = ({ onSuccess }) => {
    const [pass, setPass] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (checkPassword(pass)) {
            onSuccess();
        } else {
            setError(true);
            setPass('');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-slate-900 rounded-full text-white">
                        <Lock size={32} />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Yönetici Girişi</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
                        <input
                            type="password"
                            value={pass}
                            onChange={(e) => {
                                setPass(e.target.value);
                                setError(false);
                            }}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="Giriş şifresini yazın..."
                            autoFocus
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">Hatalı şifre. Tekrar deneyin.</p>}
                    <button
                        type="submit"
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        Giriş Yap
                    </button>
                </form>
            </div>
        </div>
    );
};