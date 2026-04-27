'use client';

import React, { useState } from 'react';
import { useSocket } from '@/context/SocketContext';
import { Bell, X, CheckCircle2, Info, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export const NotificationCenter = () => {
  const { notifications, clearNotifications } = useSocket();
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-300 active:scale-95"
      >
        <Bell className="w-6 h-6" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[10px] font-bold text-white items-center justify-center">
              {notifications.length}
            </span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 md:w-96 bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-600" />
                  Notifications
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={clearNotifications}
                    className="text-xs text-slate-500 hover:text-indigo-600 transition-colors"
                  >
                    Clear all
                  </button>
                  <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bell className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 text-sm">No new notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {notifications.map((notif) => (
                      <motion.div
                        key={notif.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="p-4 hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        <div className="flex gap-3">
                          <div className="mt-1 flex-shrink-0">
                            {getIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                              {notif.title}
                            </p>
                            <p className="text-sm text-slate-600 mt-0.5 line-clamp-2">
                              {notif.message}
                            </p>
                            <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              
              {notifications.length > 0 && (
                <div className="p-3 bg-slate-50/50 border-t border-slate-100 text-center">
                  <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                    View all activity
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
