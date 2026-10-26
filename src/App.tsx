import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CityProvider, useCity } from './context/CityContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CitySelectionModal from './components/CitySelectionModal';
type View = 'home' | 'auth' | 'dashboard' | 'admin';
function AppInner() {
    const { user, notification, clearNotification } = useAuth();
    const { city, setCity } = useCity();
    const [view, setView] = useState<View>('home');
    function navigate(v: View) {
        if (v === 'dashboard' && !user) {
            setView('auth');
            return;
        }
        if (v === 'admin' && user?.role !== 'admin') {
            setView('home');
            return;
        }
        setView(v);
    }
    function renderView() {
        if (view === 'auth') {
            return (<AuthPage onSuccess={() => {
                    const raw = sessionStorage.getItem('cinevista_session');
                    const u = raw ? JSON.parse(raw) : null;
                    navigate(u?.role === 'admin' ? 'admin' : 'home');
                }}/>);
        }
        if (view === 'dashboard' && user?.role === 'user') {
            return <UserDashboard onNavigate={navigate}/>;
        }
        if (view === 'admin' && user?.role === 'admin') {
            return <AdminDashboard />;
        }
        return <HomePage onNavigate={navigate}/>;
    }
    useEffect(() => {
        if (!notification)
            return;
        const timer = window.setTimeout(() => {
            clearNotification();
        }, 3000);
        return () => window.clearTimeout(timer);
    }, [notification, clearNotification]);
    return (<div className="min-h-screen bg-gray-950">
      <Navbar currentView={view} onNavigate={navigate}/>
      {renderView()}
      
      {!city && (<CitySelectionModal onSelect={(c) => setCity(c)}/>)}
      {notification && (<div className="fixed bottom-5 right-5 z-50 max-w-xs rounded-2xl border border-gray-800 bg-gray-900/95 px-4 py-3 shadow-2xl shadow-black/40 text-white animate-fadeIn">
          <p className="text-sm font-medium">{notification}</p>
        </div>)}
    </div>);
}
export default function App() {
    return (<AuthProvider>
      <CityProvider>
        <AppInner />
      </CityProvider>
    </AuthProvider>);
}
