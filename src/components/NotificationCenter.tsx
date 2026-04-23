import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Check, Activity, FileText, UserCheck } from 'lucide-react';
import { User, Notification } from '../types';
import { format } from 'date-fns';

export default function NotificationCenter({ user }: { user: User }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications/${user.address}`);
      const data: Notification[] = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [user.address]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/read/${id}`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    for (const n of notifications.filter(n => !n.read)) {
      await markAsRead(n.id);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'RECORD': return <FileText className="h-4 w-4" />;
      case 'ACCESS': return <UserCheck className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-3 rounded-2xl bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 transition-all group"
      >
        <Bell className={`h-5 w-5 transition-colors ${unreadCount > 0 ? 'text-indigo-600 animate-bounce' : 'text-slate-400 group-hover:text-indigo-600'}`} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 h-4 w-4 bg-red-500 text-white text-[8px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm ring-2 ring-red-100">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showDropdown && (
          <>
            <div 
              className="fixed inset-0 z-[60]" 
              onClick={() => setShowDropdown(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 mt-3 w-80 bg-white rounded-[2rem] border border-slate-200 shadow-2xl z-[70] overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                  <Bell className="h-3 w-3 text-indigo-600" />
                  <span>Protocol Alerts</span>
                </h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead}
                    className="text-[9px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 italic">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 text-xs italic">
                    Silence on the network.
                    <br/>No active interrupts.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      className={`p-5 hover:bg-slate-50 transition-colors relative group ${!n.read ? 'bg-indigo-50/30' : ''}`}
                    >
                      <div className="flex space-x-4">
                        <div className={`p-2 rounded-xl h-fit ${
                          n.type === 'RECORD' ? 'bg-emerald-100 text-emerald-600' : 
                          n.type === 'ACCESS' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <h4 className={`text-xs font-bold tracking-tight ${!n.read ? 'text-slate-900 font-extrabold' : 'text-slate-700'}`}>
                              {n.title}
                            </h4>
                            {!n.read && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(n.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-indigo-600 transition-all"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed">
                            {n.message}
                          </p>
                          <div className="text-[8px] text-slate-300 font-bold uppercase tracking-wider">
                            {format(new Date(n.timestamp), 'HH:mm:ss_SSS')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
