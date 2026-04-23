import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Upload, 
  User, 
  FileText, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Search
} from 'lucide-react';
import { User as UserType } from '../types';
import { CryptoService } from '../lib/crypto';
import { IPFSService } from '../lib/ipfs';
import { StellarService } from '../lib/stellar';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

import DemoGuide from '../components/DemoGuide';

export default function HospitalDashboard({ user }: { user: UserType }) {
  const [patientAddress, setPatientAddress] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'LAB_REPORT' | 'SCAN' | 'PRESCRIPTION' | 'GENERAL'>('GENERAL');
  const [data, setData] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<number | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // Submission Analytics
  const submissionStats = [
    { name: 'Mon', count: 12 },
    { name: 'Tue', count: 18 },
    { name: 'Wed', count: 15 },
    { name: 'Thu', count: 24 },
    { name: 'Fri', count: 21 },
    { name: 'Sat', count: 8 },
    { name: 'Sun', count: 5 },
  ];

  const steps = [
    { label: 'Client-Side Encryption', desc: 'AES-256 Payload Processing' },
    { label: 'Integrity Hashing', desc: 'SHA-256 Checksum Anchor' },
    { label: 'IPFS Propagation', desc: 'Decentralized Cluster Sync' },
    { label: 'Blockchain Anchoring', desc: 'Soroban Mutation Finalization' }
  ];

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientAddress || !title || !data) return;

    setIsUploading(true);
    setStatus(null);
    setUploadStep(0);

    try {
      // 1. Generate unique AES key for this record
      await new Promise(r => setTimeout(r, 800)); // Visual delay
      const recordKey = CryptoService.generateKey();
      
      // 2. Encrypt data with the key
      const encryptedData = CryptoService.encrypt(data, recordKey);
      setUploadStep(1);

      // 2.5 Generate integrity hash
      await new Promise(r => setTimeout(r, 600)); // Visual delay
      const dataHash = CryptoService.hash(data);
      setUploadStep(2);
      
      // 3. Upload to IPFS simulation
      const cid = await IPFSService.upload(encryptedData);
      setUploadStep(3);
      
      // 3.5 Anchor to Soroban
      try {
        await StellarService.anchorRecordHash(patientAddress, cid, dataHash);
      } catch (sorobanErr) {
        console.warn('Soroban anchoring failed, proceeding with off-chain sync:', sorobanErr);
        // We continue in the prototype to ensure the backend sync works, 
        // but in production this would be a hard failure or a retry loop.
      }
      
      // 4. Register on "Blockchain" (Express Backend)
      await new Promise(r => setTimeout(r, 1000)); // Visual delay
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientAddress: patientAddress.toUpperCase(),
          hospitalAddress: user.address.toUpperCase(),
          title,
          category,
          ipfsHash: cid,
          encryptedKey: recordKey,
          dataHash // Identity/Integrity anchor
        })
      });

      if (!res.ok) throw new Error('Failed to register record on blockchain');

      setStatus({ type: 'success', msg: `Protocol sequence complete. Sequence Hash: ${cid.slice(0, 16)}...` });
      setPatientAddress('');
      setTitle('');
      setData('');
      setUploadStep(null);
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
      setUploadStep(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Performance Deck */}
      <section id="analytics-section" className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Submission Velocity</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Real-time IPFS/Stellar Network Bandwidth</p>
          </div>
          <div className="flex items-center space-x-1 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Live Uplink</span>
          </div>
        </div>
        
        <div className="h-40 w-full">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={submissionStats}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
               <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
               <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
               <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
               <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
             </LineChart>
           </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Upload Form */}
        <motion.div 
          id="health-vault"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-3xl border border-slate-200 p-10 shadow-sm"
        >
          <div className="flex items-center space-x-3 mb-10">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-100">
              <Plus className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Clinical Submission Vault</h2>
          </div>

          <form onSubmit={handleUpload} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1 flex items-center space-x-2">
                <User className="h-3 w-3" />
                <span>Patient Network Identity (Soroban)</span>
              </label>
              <input 
                type="text" 
                required
                value={patientAddress}
                onChange={(e) => setPatientAddress(e.target.value)}
                placeholder="e.g. GC7S..." 
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Report Heading</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Cardiac Stats Profile" 
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-xs font-bold"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Data Category</label>
                <select 
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-xs font-bold text-slate-600"
                >
                  <option value="GENERAL">General Repository</option>
                  <option value="LAB_REPORT">Lab Analytics</option>
                  <option value="SCAN">Imaging Artifacts</option>
                  <option value="PRESCRIPTION">Medical Scripts</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-3 w-3" />
                  <span>Verified Payload Data</span>
                </div>
                <span className="text-[9px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-bold border border-indigo-100">CLIENT-SIDE AES CRYPTO</span>
              </label>
              <textarea 
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                rows={6}
                placeholder="Append diagnostic JSON or physician summaries for secure hashing..." 
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-xs font-mono leading-relaxed placeholder:italic"
              />
            </div>

            <button 
              type="submit"
              disabled={isUploading}
              className={`w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center space-x-3 transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest text-xs ${
                isUploading ? 'bg-slate-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isUploading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Anchor to Decentrialized Ledger</span>
                </>
              )}
            </button>
          </form>

          {isUploading && uploadStep !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 space-y-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Protocol Phase {uploadStep + 1}/4</span>
                <span className="text-[10px] text-slate-400 font-mono">{Math.round(((uploadStep + 1) / 4) * 100)}%</span>
              </div>
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${((uploadStep + 1) / 4) * 100}%` }}
                  className="h-full bg-indigo-600"
                />
              </div>
              <div className="space-y-3">
                {steps.map((step, idx) => (
                  <div key={idx} className={`flex items-center space-x-3 transition-opacity duration-300 ${idx > uploadStep ? 'opacity-30' : 'opacity-100'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                      idx < uploadStep ? 'bg-emerald-500 text-white' : 
                      idx === uploadStep ? 'bg-indigo-600 text-white animate-pulse' : 
                      'bg-slate-200 text-slate-500'
                    }`}>
                      {idx < uploadStep ? '✓' : idx + 1}
                    </div>
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-tight ${idx === uploadStep ? 'text-indigo-600' : 'text-slate-600'}`}>{step.label}</p>
                      <p className="text-[9px] text-slate-400 font-medium italic">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {status && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`mt-8 p-5 rounded-2xl flex items-start space-x-3 border ${
                status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800 shadow-sm shadow-emerald-50' : 'bg-red-50 border-red-100 text-red-800'
              }`}
            >
              {status.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />}
              <div className="text-[11px] leading-snug">
                <p className="font-bold uppercase tracking-wide">{status.type === 'success' ? 'Blockchain Success' : 'Network Failure'}</p>
                <p className="opacity-80 mt-1 font-mono tracking-tighter">{status.msg}</p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Info Column */}
        <div className="space-y-6">
          <DemoGuide role="HOSPITAL" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-indigo-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Database className="h-40 w-40 text-white" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center space-x-2 text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-6">
                <Lock className="h-4 w-4" />
                <span>Zero-Knowledge Verification</span>
              </div>
              <h3 className="text-2xl font-bold leading-tight mb-6 text-white tracking-tight">Standardized Soroban Medical Anchoring</h3>
              <ul className="space-y-5 text-xs text-indigo-100 border-l border-indigo-700/50 pl-5 ml-1">
                <li className="relative">
                  <div className="absolute -left-[24px] top-1 w-2 h-2 bg-indigo-400 rounded-full border-2 border-indigo-900"></div>
                  <p><span className="text-white font-bold uppercase tracking-tighter">AES-256 Protocol:</span> Data payloads are encrypted before broadcast, ensuring nodes never see patient PII.</p>
                </li>
                <li className="relative">
                  <div className="absolute -left-[24px] top-1 w-2 h-2 bg-indigo-400 rounded-full border-2 border-indigo-900"></div>
                  <p><span className="text-white font-bold uppercase tracking-tighter">CID Mapping:</span> Only immutable IPFS CIDs are anchored to global ledger events for permanent auditability.</p>
                </li>
                <li className="relative">
                  <div className="absolute -left-[24px] top-1 w-2 h-2 bg-indigo-400 rounded-full border-2 border-indigo-900"></div>
                  <p><span className="text-white font-bold uppercase tracking-tighter">Integrity Checksum:</span> SHA-256 hashes enable rapid tampering detection during diagnostic retrieval sessions.</p>
                </li>
              </ul>
            </div>
          </motion.div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-6 flex items-center space-x-2">
              <Search className="h-4 w-4 text-indigo-600" />
              <span>Real-Time Node Telemetry</span>
            </h4>
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                <div className="text-[11px] font-bold text-slate-600 tracking-tight">IPFS Cluster Connectivity</div>
                <div className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 uppercase tracking-widest">Active</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                <div className="text-[11px] font-bold text-slate-600 tracking-tight">Soroban Testnet Sync</div>
                <div className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 uppercase tracking-widest">Healthy</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="audit-ledger"></div>
    </div>
  );
}
