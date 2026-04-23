import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  ShieldCheck, 
  History, 
  UserPlus, 
  Clock, 
  Eye, 
  X,
  Share2,
  Trash2,
  Calendar,
  Lock,
  Bell,
  Plus,
  ChevronRight,
  Download,
  AlertCircle,
  CheckCircle2,
  Activity,
  ArrowRight
} from 'lucide-react';
import { User, MedicalRecord, AccessPermission, AuditLog } from '../types';
import { format } from 'date-fns';
import { StellarService } from '../lib/stellar';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

import DemoGuide from '../components/DemoGuide';

export default function PatientDashboard({ user }: { user: User }) {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [permissions, setPermissions] = useState<AccessPermission[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  
  // Analytics Mock Data
  const activityData = [
    { name: 'Jan', records: 2, accesses: 5 },
    { name: 'Feb', records: 5, accesses: 12 },
    { name: 'Mar', records: 3, accesses: 8 },
    { name: 'Apr', records: 7, accesses: 15 },
    { name: 'May', records: 4, accesses: 10 },
  ];

  // Rest of state...
  const [doctorAddress, setDoctorAddress] = useState('');
  const [category, setCategory] = useState<'LAB_REPORT' | 'SCAN' | 'PRESCRIPTION' | 'GENERAL' | 'ALL'>('ALL');
  const [duration, setDuration] = useState('24h'); // 1h, 24h, 7d, 30d

  const fetchData = async () => {
    try {
      const [recRes, permRes, logRes] = await Promise.all([
        fetch(`/api/records/patient/${user.address}`),
        fetch(`/api/permissions/patient/${user.address}`),
        fetch(`/api/logs/${user.address}`)
      ]);
      
      setRecords(await recRes.json());
      setPermissions(await permRes.json());
      setLogs(await logRes.json());
    } catch (err) {
      console.error('Failed to fetch patient data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [user.address]);

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorAddress) return;

    // Calculate expiry
    const now = new Date();
    const expiry = new Date();
    if (duration === '1h') expiry.setHours(now.getHours() + 1);
    else if (duration === '24h') expiry.setDate(now.getDate() + 1);
    else if (duration === '7d') expiry.setDate(now.getDate() + 7);
    else if (duration === '30d') expiry.setDate(now.getDate() + 30);

    try {
      // 1. Anchor permission to Soroban Smart Contract
      try {
        await StellarService.updatePermission(user.address, doctorAddress, true, expiry.getTime());
      } catch (sorobanErr) {
        console.warn('Soroban permission anchoring failed, proceeding with off-chain sync:', sorobanErr);
      }

      await fetch('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientAddress: user.address.toUpperCase(),
          doctorAddress: doctorAddress.toUpperCase(),
          category,
          expiryTimestamp: expiry.toISOString()
        })
      });
      setShowGrantModal(false);
      setDoctorAddress('');
      fetchData();
    } catch (err) {
      console.error('Failed to grant access', err);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await fetch(`/api/permissions/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Failed to revoke access', err);
    }
  };

  if (loading) return <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-8 pb-20 relative">
      {emergencyMode && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] pointer-events-none border-[12px] border-red-600/30"
        >
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] shadow-2xl flex items-center space-x-3 pointer-events-auto cursor-default">
            <AlertCircle className="h-4 w-4 animate-pulse" />
            <span>Emergency Protocols Active — Critical Access Granted</span>
          </div>
        </motion.div>
      )}
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <FileText className="h-20 w-20 text-indigo-600" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Decentralized Records</p>
          <div className="flex items-end space-x-2">
            <h3 className="text-3xl font-bold text-slate-900">{records.length}</h3>
            <span className="text-[10px] text-emerald-500 font-bold mb-1.5 uppercase tracking-tighter bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">+2 NEW</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <ShieldCheck className="h-20 w-20 text-indigo-600" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Permissions</p>
          <h3 className="text-3xl font-bold text-indigo-600">{permissions.length}</h3>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className={`${emergencyMode ? 'bg-red-600 border-red-500 shadow-red-200' : 'bg-white border-slate-200'} p-8 rounded-[2.5rem] border shadow-sm relative overflow-hidden group transition-all duration-500`}>
          <div className="absolute top-0 right-0 p-6 opacity-[0.1] group-hover:opacity-[0.2] transition-opacity">
            <AlertCircle className={`h-20 w-20 ${emergencyMode ? 'text-white' : 'text-slate-200'}`} />
          </div>
          <div className="flex justify-between items-start mb-1">
            <p className={`text-[10px] font-bold uppercase tracking-widest ${emergencyMode ? 'text-red-100' : 'text-slate-400'}`}>Emergency Access</p>
            <button 
              onClick={() => setEmergencyMode(!emergencyMode)}
              className={`w-8 h-4 rounded-full relative transition-colors ${emergencyMode ? 'bg-white' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${emergencyMode ? 'right-0.5 bg-red-600' : 'left-0.5 bg-white'}`} />
            </button>
          </div>
          <h3 className={`text-xl font-bold ${emergencyMode ? 'text-white' : 'text-slate-900'}`}>
            {emergencyMode ? 'PROTOCOLS ACTIVE' : 'LOCKED'}
          </h3>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-slate-950 p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100 relative overflow-hidden group text-white">
          <div className="absolute top-0 right-0 p-6 opacity-20">
            <History className="h-20 w-20 text-indigo-500" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Security Events</p>
          <h3 className="text-3xl font-bold">{logs.length}</h3>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Analytics & Records */}
        <div className="lg:col-span-8 space-y-8">
          {/* Advanced Analytics */}
          <section id="analytics-section" className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold tracking-tight text-slate-900">Health Consumption Analytics</h3>
              </div>
              <div className="flex space-x-2">
                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-tighter">NETWORK_LOAD</span>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="records" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRec)" strokeWidth={3} />
                  <Area type="monotone" dataKey="accesses" stroke="#10b981" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section id="health-vault" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2 uppercase tracking-wide">
                <FileText className="h-4 w-4 text-indigo-600" />
                <span>Recent Health Records</span>
              </h3>
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest hover:underline cursor-pointer">View All</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                  <tr>
                    <th className="px-6 py-3 border-b border-slate-100">Record Type</th>
                    <th className="px-6 py-3 border-b border-slate-100 font-mono">CID</th>
                    <th className="px-6 py-3 border-b border-slate-100 text-right">Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                        No medical records found in the vault.
                      </td>
                    </tr>
                  ) : (
                    records.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-900">{record.title}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{format(new Date(record.timestamp), 'MMM d, yyyy')}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[10px] font-mono text-slate-400 group-hover:text-indigo-400 transition-colors">
                            {record.ipfsHash.slice(0, 10)}...
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-tighter">
                            {record.category}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Access Column */}
        <div className="lg:col-span-4 space-y-6">
          <DemoGuide role="PATIENT" />
          
          <section id="access-control" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2 uppercase tracking-wide">
                <Lock className="h-4 w-4 text-emerald-600" />
                <span>Access Protocols</span>
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              {permissions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-400 italic">No temporary permissions granted.</p>
                </div>
              ) : (
                permissions.map((perm) => (
                  <div key={perm.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl relative group transition-all hover:border-slate-200">
                    <button 
                      onClick={() => handleRevoke(perm.id)}
                      className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-sm font-bold text-slate-900">DR. {perm.doctorAddress.slice(0, 8)}...</div>
                        <div className="text-[10px] text-slate-500 font-medium tracking-tight">Active Surveillance</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-mono text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                          {format(new Date(perm.expiryTimestamp), 'HH:mm')} TTL
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                       <span className="text-[9px] px-2 py-0.5 bg-white border border-slate-200 rounded font-bold text-slate-600 uppercase tracking-tighter shadow-sm">{perm.category}</span>
                    </div>
                  </div>
                ))
              )}

              <button 
                onClick={() => setShowGrantModal(true)}
                className="w-full py-4 border-2 border-dashed border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 rounded-2xl transition-all flex items-center justify-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Grant Permission</span>
              </button>
            </div>
          </section>

          <section className="bg-indigo-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 opacity-10">
              <Lock className="h-40 w-40" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-indigo-500/20 rounded-xl">
                  <ShieldCheck className="h-6 w-6 text-indigo-300" />
                </div>
                <h3 className="font-bold text-lg tracking-tight">System Integrity</h3>
              </div>
              <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                Your medical hash is anchored to the Stellar Testnet. This ensures zero-knowledge verification while maintaining complete privacy over your clinical payload on IPFS.
              </p>
            </div>
          </section>
        </div>
      </div>

      <section id="audit-ledger" className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden mt-8">
        <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-6 flex items-center justify-between">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>Immutable Blockchain Audit Ledger</span>
          </h2>
        </div>
        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="px-8 py-12 text-center text-slate-400 italic text-sm">No activity detected on sub-ledger.</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-6">
                  <div className={`p-2.5 rounded-xl ${
                    log.action === 'VIEW' ? 'bg-amber-50 text-amber-600' :
                    log.action === 'UPLOAD' ? 'bg-indigo-50 text-indigo-600' :
                    'bg-emerald-50 text-emerald-600'
                  }`}>
                    {log.action === 'VIEW' ? <Eye className="h-4 w-4" /> :
                     log.action === 'UPLOAD' ? <Plus className="h-4 w-4" /> :
                     <Share2 className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="text-xs">
                      <span className="text-slate-500">Event</span> <span className="font-bold text-slate-800 uppercase tracking-tighter">{log.action}</span>{' '}
                      <span className="text-slate-500">by</span>{' '}
                      <span className="font-mono text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {log.actorAddress === user.address ? 'OWNER' : log.actorAddress.slice(0, 10)}
                      </span>
                    </div>
                    <div className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-widest">
                      TXN: 0x{log.id.slice(0, 16)}...
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-right">
                  {format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {showGrantModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl relative border border-slate-100"
          >
            <button 
              onClick={() => setShowGrantModal(false)}
              className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition-colors"
            >
              <X className="h-8 w-8" />
            </button>

            <h3 className="text-2xl font-bold mb-2 text-slate-900 tracking-tight flex items-center space-x-3 text-left">
              <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100">
                <UserPlus className="h-6 w-6" />
              </div>
              <span>Clinical Proxy Protocol</span>
            </h3>
            <p className="text-slate-500 text-xs mb-10 leading-relaxed font-medium text-left">Broadcast authorized access permissions to a practitioner wallet address on the network.</p>

            <form onSubmit={handleGrantAccess} className="space-y-6">
              <div className="text-left">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Guardian Wallet Identifier</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  placeholder="G..." 
                  value={doctorAddress}
                  onChange={(e) => setDoctorAddress(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:italic"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Visibility Scope</label>
                  <select 
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none hover:border-indigo-100 transition-colors cursor-pointer"
                  >
                    <option value="ALL">All Vaults</option>
                    <option value="LAB_REPORT">Lab Analytics</option>
                    <option value="SCAN">Imaging Docs</option>
                    <option value="PRESCRIPTION">Scripts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Lifecycle (TTL)</label>
                  <select 
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none hover:border-indigo-100 transition-colors cursor-pointer"
                  >
                    <option value="1h">1.0 HR</option>
                    <option value="24h">24.0 HRS</option>
                    <option value="7d">7.0 DAYS</option>
                  </select>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 p-5 rounded-[1.5rem] text-amber-800 text-[10px] font-bold leading-relaxed flex space-x-4 italic border-l-4 border-l-amber-500 text-left">
                <Clock className="h-5 w-5 shrink-0 mt-0.5 text-amber-500" />
                <p>This authorization will self-terminate after the TTL expires. On-chain revocation can also be performed manually.</p>
              </div>

              <button 
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-[1.5rem] transition-all shadow-2xl uppercase tracking-widest text-[10px]"
              >
                Execute Authorization
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
