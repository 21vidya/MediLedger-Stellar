import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Search, 
  ExternalLink, 
  FileText, 
  Unlock, 
  Clock, 
  Activity,
  UserPlus,
  X,
  Eye
} from 'lucide-react';
import { User, MedicalRecord, AccessPermission } from '../types';
import { format } from 'date-fns';
import { IPFSService } from '../lib/ipfs';
import { CryptoService } from '../lib/crypto';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import DemoGuide from '../components/DemoGuide';

export default function DoctorDashboard({ user }: { user: User }) {
  const [patients, setPatients] = useState<AccessPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patientRecords, setPatientRecords] = useState<MedicalRecord[]>([]);
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null);
  const [decryptedData, setDecryptedData] = useState<string | null>(null);
  
  // Request Modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestPatientAddr, setRequestPatientAddr] = useState('');

  // Practice Analytics
  const analyticsData = [
    { name: 'Labs', count: 45 },
    { name: 'Scans', count: 32 },
    { name: 'Scripts', count: 58 },
    { name: 'Other', count: 12 },
  ];
  const PIE_COLORS = ['#4f46e5', '#818cf8', '#c7d2fe', '#e0e7ff'];

  const fetchMyPatients = async () => {
    try {
      const res = await fetch('/api/permissions/patient/all');
      const allPerms: AccessPermission[] = await res.json();
      // Filter permissions granted to this doctor (normalized to uppercase)
      const myPerms = allPerms.filter(p => 
        p.doctorAddress.toUpperCase() === user.address.toUpperCase()
      );
      setPatients(myPerms);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initialization handled by the main poll interval
  useEffect(() => {
    fetchMyPatients();
    const interval = setInterval(fetchMyPatients, 5000);
    return () => clearInterval(interval);
  }, [user.address]);

  const handleViewPatient = async (patientAddr: string) => {
    setSelectedPatient(patientAddr);
    try {
      const res = await fetch(`/api/records/patient/${patientAddr}`);
      setPatientRecords(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenRecord = async (record: MedicalRecord) => {
    setViewingRecord(record);
    setDecryptedData(null);
    try {
      const encrypted = await IPFSService.retrieve(record.ipfsHash);
      if (encrypted) {
        // In real app, we'd use the doctor's private key to decrypt the AES key, 
        // then use that to decrypt the data. For demo, we assume the key is accessible.
        const decrypted = CryptoService.decrypt(encrypted, record.encryptedKey);
        setDecryptedData(decrypted);
        
        // Log the view action
        fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'VIEW',
            actorAddress: user.address,
            recordId: record.id,
            targetAddress: record.patientAddress
          })
        });
      }
    } catch (err) {
      console.error('Decryption failed', err);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
          <Activity className="h-40 w-40 text-indigo-600" />
        </div>
        <div className="relative z-10">
          <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] mb-2 flex items-center space-x-2">
            <span className="w-4 h-[1px] bg-indigo-600"></span>
            <span>Clinical Surveillance</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Practitioner Insights</h1>
          <p className="text-slate-500 text-sm mt-1">Authorized health surveillance and diagnostic analytics</p>
        </div>
        <button 
          onClick={() => setShowRequestModal(true)}
          className="relative z-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-2xl flex items-center space-x-2 transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest text-[10px]"
        >
          <UserPlus className="h-4 w-4" />
          <span>Request Bio-Data</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div id="analytics-section" className="md:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center space-x-2">
              <Activity className="h-4 w-4 text-indigo-600" />
              <span>Practice Diagnostic Volume</span>
            </h3>
            <span className="text-[9px] font-bold text-slate-400">SESSION: {format(new Date(), 'yyyy-MM-dd')}</span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden flex flex-col items-center justify-center">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 absolute top-8 left-8">Bio-Data Density</h3>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Critical', value: 30 },
                    { name: 'Stable', value: 70 },
                  ]}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={8}
                  dataKey="value"
                >
                  <Cell fill="#ef4444" />
                  <Cell fill="#4f46e5" />
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex space-x-4">
             <div className="flex items-center space-x-2">
               <div className="w-2 h-2 rounded-full bg-red-500"></div>
               <span className="text-[9px] font-bold text-slate-500 uppercase">Critical</span>
             </div>
             <div className="flex items-center space-x-2">
               <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
               <span className="text-[9px] font-bold text-slate-500 uppercase">Stable</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Patient Sidebar */}
        <div id="health-vault" className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm h-fit">
          <div className="p-8 space-y-6">
            <DemoGuide role="DOCTOR" />
          </div>
          
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center space-x-2">
              <Users className="h-4 w-4 text-indigo-600" />
              <span>Authorized Subjects</span>
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {patients.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs italic">
                No telemetry streams active.<br/>Broadcast a request to begin.
              </div>
            ) : (
              patients.map((perm) => (
                <button 
                  key={perm.id}
                  onClick={() => handleViewPatient(perm.patientAddress)}
                  className={`w-full p-5 flex items-center justify-between hover:bg-indigo-50/50 transition-all group ${
                    selectedPatient === perm.patientAddress ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2.5 rounded-xl transition-all ${
                      selectedPatient === perm.patientAddress ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                    }`}>
                      <Activity className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-slate-800">
                        {perm.patientAddress === user.address ? 'PERSONAL_VAULT' : `PATIENT_${perm.patientAddress.slice(0, 6)}`}
                      </div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                        SCOPE: {perm.category}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-all ${
                    selectedPatient === perm.patientAddress ? 'text-indigo-600 translate-x-1' : 'text-slate-300 group-hover:text-indigo-600'
                   }`} />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8 space-y-6">
          {!selectedPatient ? (
            <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 h-[30rem] flex flex-col items-center justify-center space-y-6 p-12 text-center">
              <div className="bg-slate-50 p-10 rounded-full text-slate-200 shadow-inner">
                <Search className="h-20 w-20" />
              </div>
              <div className="max-w-xs space-y-2">
                <h3 className="font-bold text-slate-900 text-lg uppercase tracking-tight">Select Subject</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">Select a verified patient identity from the telemetry panel to initialize clinical data retrieval.</p>
              </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
                  <Unlock className="h-24 w-24 text-emerald-600" />
                </div>
                <div className="flex items-center space-x-5 relative z-10">
                  <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-xl shadow-indigo-100">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Patient Sequence Data</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-1 italic">Permissions Verified via Soroban Soroban-01</p>
                  </div>
                </div>
                <div className="text-right relative z-10">
                  <div className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full inline-flex items-center space-x-1 uppercase tracking-widest shadow-sm">
                    <Unlock className="h-3 w-3" />
                    <span>Active Crypt-Stream</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patientRecords.map((record) => (
                  <motion.div 
                    key={record.id}
                    whileHover={{ y: -4 }}
                    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer group"
                    onClick={() => handleOpenRecord(record)}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-slate-50 p-3 rounded-2xl text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner group-hover:shadow-indigo-200">
                        <FileText className="h-5 w-5" />
                      </div>
                      <span className="text-[9px] bg-slate-50 text-slate-400 px-3 py-1 rounded-lg border border-slate-100 font-bold uppercase tracking-[0.1em] group-hover:border-indigo-100 group-hover:text-indigo-600 transition-colors">
                        RAW_{record.category}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">{record.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-6 font-bold uppercase tracking-widest flex items-center space-x-2">
                        <Clock className="h-3 w-3" />
                        <span>LOGGED: {format(new Date(record.timestamp), 'MMM d, yyyy')}</span>
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Record Viewer Modal */}
      <div id="audit-ledger"></div>
      {viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl relative flex flex-col h-[85vh] border border-slate-100"
          >
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center space-x-4">
                <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-indigo-100">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 tracking-tight text-lg">{viewingRecord.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">SOROBAN_CID</span>
                    <span className="text-[10px] text-indigo-500 font-mono bg-indigo-50 px-2 py-0.5 rounded tracking-tighter">{viewingRecord.ipfsHash}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setViewingRecord(null)}
                className="text-slate-300 hover:text-slate-600 p-2 transition-colors"
              >
                <X className="h-8 w-8" />
              </button>
            </div>

            <div className="p-10 overflow-y-auto flex-1 bg-slate-50/20">
              {!decryptedData ? (
                <div className="flex flex-col items-center justify-center h-full space-y-6">
                  <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-xl"></div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-bold text-slate-800 uppercase tracking-widest animate-pulse">Decrypting Binary Stream</p>
                    <p className="text-[10px] text-slate-400 font-medium italic">Handshaking with IPFS distributed cluster...</p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 text-indigo-100 p-10 rounded-[2rem] shadow-2xl shadow-indigo-900/10 leading-relaxed font-mono relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-500 opacity-50"></div>
                  <pre className="whitespace-pre-wrap text-xs md:text-sm">{decryptedData}</pre>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center space-x-3 text-[10px] text-emerald-600 font-bold uppercase tracking-[0.2em]">
                <ShieldCheck className="h-5 w-5" />
                <span>Zero-Knowledge Integrity Verified</span>
              </div>
              <div className="text-[10px] text-slate-400 font-bold italic tracking-tighter bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                IMMUTABLE_LOG: {format(new Date(), 'HH:mm:ss_SSS')}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Request Access Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl relative border border-slate-200"
          >
            <button 
              onClick={() => setShowRequestModal(false)}
              className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition-colors"
            >
              <X className="h-7 w-7" />
            </button>

            <div className="bg-indigo-50 w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 shadow-inner">
               <UserPlus className="h-8 w-8 text-indigo-600" />
            </div>

            <h3 className="text-2xl font-bold mb-2 text-slate-900 tracking-tight">Access Request</h3>
            <p className="text-slate-500 text-xs mb-8 leading-relaxed">Broadcast a decentralized permission request to a patient wallet address on the network.</p>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Target Identity (G...)</label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Subject Public Key" 
                  value={requestPatientAddr}
                  onChange={(e) => setRequestPatientAddr(e.target.value)}
                  className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-xs font-mono bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all focus:bg-white"
                />
              </div>

              <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-[1.5rem] text-indigo-800 text-[10px] font-bold leading-relaxed flex space-x-4 italic border-l-4 border-l-indigo-600">
                <Unlock className="h-5 w-5 shrink-0 mt-0.5 text-indigo-600" />
                <p>Broadcasting a request notifies the patient. They must provide explicit approval before a crypt-stream can be initialized.</p>
              </div>

              <button 
                onClick={() => {
                  fetch('/api/requests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      doctorAddress: user.address,
                      patientAddress: requestPatientAddr,
                    })
                  });
                  setShowRequestModal(false);
                  setRequestPatientAddr('');
                  alert('Access request broadcasted to the network protocols.');
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all shadow-xl uppercase tracking-widest text-[10px]"
              >
                Broadcast Request
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Sub-components
function ChevronRight({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>;
}

function ShieldCheck({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
}
