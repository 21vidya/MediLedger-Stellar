import React from 'react';
import { motion } from 'motion/react';
import { Info, ArrowRight, Shield, Activity, User, Hospital } from 'lucide-react';
import { UserRole } from '../types';

interface DemoGuideProps {
  role: UserRole;
}

export default function DemoGuide({ role }: DemoGuideProps) {
  const guides = {
    HOSPITAL: [
      { step: 1, title: 'Upload Record', desc: 'Click "Anchor Records" and enter a patient wallet address.' },
      { step: 2, title: 'Stellar Anchoring', desc: 'The system generates a hash and anchors it to the Soroban ledger.' },
      { step: 3, title: 'IPFS Sync', desc: 'The encrypted payload is sent to distributed storage.' }
    ],
    PATIENT: [
      { step: 1, title: 'Review Vault', desc: 'See all records anchored by hospitals to your wallet.' },
      { step: 2, title: 'Manage Access', desc: 'Grant temporary "Time-to-Live" access to a specific doctor.' },
      { step: 3, title: 'Emergency Mode', desc: 'Use "Break-Glass" for immediate emergency responder access.' }
    ],
    DOCTOR: [
      { step: 1, title: 'Clinical Search', desc: 'Connect to a patient wallet to request zero-knowledge access.' },
      { step: 2, title: 'Data Retrieval', desc: 'Retrieve and locally decrypt authorized clinical payloads.' },
      { step: 3, title: 'Audit Trail', desc: 'Every view is logged immutably for compliance.' }
    ]
  };

  const currentGuide = guides[role];

  return (
    <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-2xl relative overflow-hidden border border-slate-800">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        {role === 'HOSPITAL' ? <Hospital size={120} /> : role === 'PATIENT' ? <User size={120} /> : <Activity size={120} />}
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-indigo-500 p-2 rounded-xl">
            <Info size={16} />
          </div>
          <h3 className="font-bold text-sm uppercase tracking-widest">Demo Guide: {role} Flow</h3>
        </div>

        <div className="space-y-4">
          {currentGuide.map((g) => (
            <div key={g.step} className="flex space-x-4 group">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-indigo-500 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {g.step}
                </div>
                {g.step !== 3 && <div className="w-0.5 flex-1 bg-slate-800 my-1 group-hover:bg-indigo-500/50 transition-colors" />}
              </div>
              <div className="pb-4">
                <h4 className="text-[11px] font-bold text-white uppercase tracking-tight mb-1">{g.title}</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">{g.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <h5 className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Master Demo Inputs</h5>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500">Patient Key</span>
                <code className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-400 font-mono">G-PATIENT-SARAH</code>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500">Doctor Key</span>
                <code className="bg-slate-900 px-1.5 py-0.5 rounded text-indigo-400 font-mono">G-DR-ALEX</code>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-[10px] text-indigo-400 font-bold uppercase tracking-tighter">
            <Shield size={12} />
            <span>Secured by Stellar Soroban Protocols</span>
          </div>
        </div>
      </div>
    </div>
  );
}
