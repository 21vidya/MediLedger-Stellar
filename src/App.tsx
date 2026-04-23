import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Activity, 
  Hospital, 
  User as UserIcon, 
  History, 
  Key, 
  FileText, 
  Bell, 
  Lock,
  ChevronRight,
  LogOut,
  Plus
} from 'lucide-react';
import { User, UserRole } from './types';
import { StellarService } from './lib/stellar';

// Pages
import LoginPage from './pages/LoginPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import NotificationCenter from './components/NotificationCenter';

// ... (imports remain the same)
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('mediledger_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsWalletConnected(true);
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    setIsWalletConnected(false);
    localStorage.removeItem('mediledger_user');
  };

  if (!isWalletConnected || !user) {
    return (
      <Router>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <Routes>
            <Route path="*" element={<LoginPage onLogin={(u) => { setUser(u); setIsWalletConnected(true); }} />} />
          </Routes>
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50 font-sans overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 hidden lg:flex">
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">M</div>
              <span className="text-white font-semibold text-lg tracking-tight">MediLedger</span>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            <Link to="/" className="flex items-center px-4 py-3 bg-slate-800 text-white rounded-lg group transition-all">
              <Activity className="mr-3 h-5 w-5 text-indigo-400" />
              <span>Dashboard</span>
            </Link>
            
            <div className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4">Security Vault</div>
            <div className="space-y-1">
              <button 
                onClick={() => document.getElementById('health-vault')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full flex items-center px-4 py-2 hover:bg-slate-800 hover:text-white rounded-lg transition-colors cursor-pointer text-sm font-medium"
              >
                <FileText className="mr-3 h-4 w-4" /> 
                {user.role === 'PATIENT' ? 'My Health Vault' : 
                 user.role === 'DOCTOR' ? 'Patient Repositories' : 'Submission Vault'}
              </button>
              <button 
                onClick={() => document.getElementById(user.role === 'PATIENT' ? 'access-control' : 'analytics-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full flex items-center px-4 py-2 hover:bg-slate-800 hover:text-white rounded-lg transition-colors cursor-pointer text-sm font-medium"
              >
                <Lock className="mr-3 h-4 w-4" /> 
                {user.role === 'PATIENT' ? 'Access Control' : 'Network Analytics'}
              </button>
              <button 
                onClick={() => document.getElementById('audit-ledger')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full flex items-center px-4 py-2 hover:bg-slate-800 hover:text-white rounded-lg transition-colors cursor-pointer text-sm font-medium"
              >
                <History className="mr-3 h-4 w-4" /> 
                {user.role === 'HOSPITAL' ? 'Transaction Logs' : 'Audit Records'}
              </button>
            </div>
          </nav>

          <div className="p-6 border-t border-slate-800">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                <span className="text-[10px] font-mono text-indigo-400">{user.address.slice(0, 4)}...</span>
              </div>
              <div className="overflow-hidden">
                <div className="text-sm text-white font-medium truncate">{user.name}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Stellar Network</div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg bg-slate-800 hover:bg-red-900/30 hover:text-red-400 transition-all text-xs font-semibold border border-slate-700"
            >
              <LogOut className="h-4 w-4" />
              <span>Disconnect</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          {/* Header */}
          <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 sticky top-0 z-10">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {user.role === 'PATIENT' ? 'Patient Dashboard' : 
                 user.role === 'DOCTOR' ? 'Clinical Insights' : 'Hospital Administration'}
              </h1>
              <p className="text-xs text-slate-500 italic hidden sm:block">Decentralized & Time-Bound Medical Records</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 text-[10px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span> Soroban Mainnet
              </div>
              <NotificationCenter user={user} />
            </div>
          </header>

          {/* Page Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={
                  user.role === 'PATIENT' ? <PatientDashboard user={user} /> :
                  user.role === 'DOCTOR' ? <DoctorDashboard user={user} /> :
                  <HospitalDashboard user={user} />
                } />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </Router>
  );
}
