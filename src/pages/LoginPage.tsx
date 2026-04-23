import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Key, AlertCircle } from 'lucide-react';
import { StellarService } from '../lib/stellar';
import { User, UserRole } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [role, setRole] = useState<UserRole>('PATIENT');

  const handleConnect = async () => {
    if (!name) {
      setError('Please enter your name first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For the prototype, we generate a mock address if Freighter is not available
      let address = (addressInput || 'GC' + Math.random().toString(36).substring(2, 12)).toUpperCase();
      
      const isFreighter = await StellarService.checkFreighter();
      if (isFreighter && !addressInput) {
        const pk = await StellarService.getWalletAddress();
        if (pk) address = pk;
      }

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, name, role })
      });
      
      const user = await response.json();
      localStorage.setItem('mediledger_user', JSON.stringify(user));
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md w-full bg-white p-10 rounded-2xl border border-slate-200 shadow-2xl shadow-indigo-100/50"
    >
      <div className="flex flex-col items-center mb-10">
        <div className="bg-indigo-600 p-4 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
          <Shield className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Access MediLedger</h1>
        <p className="text-slate-500 text-center mt-2 text-sm">
          Decentralized Patient Data Governance
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Identity Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Patient #4821"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent outline-none transition-all text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1 flex items-center justify-between">
            <span>Public Wallet Key (Optional)</span>
            <span className="text-[8px] text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">MANUAL OVERRIDE</span>
          </label>
          <input 
            type="text" 
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder="Leave empty for auto-generation"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent outline-none transition-all text-xs font-mono"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Network Role</label>
          <div className="grid grid-cols-3 gap-2">
            {(['PATIENT', 'DOCTOR', 'HOSPITAL'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`py-2.5 text-[10px] font-bold rounded-xl border transition-all uppercase tracking-wider ${
                  role === r 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100' 
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-xl text-xs border border-red-100 font-medium font-sans">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={loading}
          className={`w-full flex items-center justify-center space-x-2 py-4 px-4 rounded-2xl font-bold text-white transition-all shadow-lg ${
            loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
          }`}
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Key className="h-5 w-5" />
              <span>Connect Soroban Wallet</span>
            </>
          )}
        </button>

        <p className="text-[10px] text-slate-400 text-center leading-relaxed px-4">
          Data is SHA-256 hashed and AES-256 encrypted. Only CIDs are stored on public ledgers.
        </p>
      </div>
    </motion.div>
  );
}
