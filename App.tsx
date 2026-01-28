import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AdminLogin } from './components/AdminLogin';
import { AdminPanel } from './components/AdminPanel';
import { syncWithFirebase } from './services/dataService';

function App() {
    // 1. Firebase verilerinin yüklenip yüklenmediğini takip eden state
    const [loading, setLoading] = useState(true);
    
    // 2. Sayfa görünümü ve adminlik durumunu takip eden state'ler
    const [view, setView] = useState<'public' | 'login' | 'admin'>('public');
    const [isAdmin, setIsAdmin] = useState(false);

    // 3. Uygulama ilk açıldığında verileri Firebase'den bir kez çek
    useEffect(() => {
        syncWithFirebase()
            .then(() => {
                setLoading(false);
            })
            .catch((error) => {
                console.error("Veriler senkronize edilemedi:", error);
                setLoading(false); // Hata olsa bile kullanıcıyı döngüde bırakmamak için
            });
    }, []);

    const handleLoginSuccess = () => {
        setIsAdmin(true);
        setView('admin');
    };

    const handleLogout = () => {
        setIsAdmin(false);
        setView('public');
    };

    // Veriler yüklenirken gösterilecek ekran
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
                <h3>Melahat Simavlıoğlu Apartmanı Sistemi Yükleniyor...</h3>
            </div>
        );
    }

    return (
        <Layout 
            isAdmin={isAdmin} 
            onLoginClick={() => setView('login')}
            onLogoutClick={handleLogout}
        >
            {view === 'public' && <Dashboard />}
            {view === 'login' && <AdminLogin onSuccess={handleLoginSuccess} />}
            {view === 'admin' && <AdminPanel />}
        </Layout>
    );
}

export default App;