import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AdminLogin } from './components/AdminLogin';
import { AdminPanel } from './components/AdminPanel';

function App() {
    const [view, setView] = useState<'public' | 'login' | 'admin'>('public');
    const [isAdmin, setIsAdmin] = useState(false);

    const handleLoginSuccess = () => {
        setIsAdmin(true);
        setView('admin');
    };

    const handleLogout = () => {
        setIsAdmin(false);
        setView('public');
    };

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