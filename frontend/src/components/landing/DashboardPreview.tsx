'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Users, CheckCircle, Clock } from 'lucide-react';

export default function DashboardPreview() {
  return (
    <div className="relative">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="text-xs font-medium text-gray-400">Dashboard</span>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {[
                { label: 'Revenue', value: '$24,500', icon: DollarSign, change: '+12.5%', color: 'text-green-500', bg: 'bg-green-50' },
                { label: 'Invoices', value: '142', icon: TrendingUp, change: '+8.2%', color: 'text-primary', bg: 'bg-primary/5' },
                { label: 'Clients', value: '48', icon: Users, change: '+4.1%', color: 'text-blue-500', bg: 'bg-blue-50' },
              ].map((stat, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                      <stat.icon size={16} className={stat.color} />
                    </div>
                    <span className={`text-xs font-semibold ${stat.color}`}>{stat.change}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-0.5">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">Recent Invoices</h4>
                <span className="text-xs text-primary font-medium">View all</span>
              </div>
              <div className="space-y-2">
                {[
                  { client: 'Acme Corp', amount: '$2,400', status: 'Paid' as const },
                  { client: 'TechStart Inc', amount: '$1,800', status: 'Pending' as const },
                  { client: 'DesignLab', amount: '$3,200', status: 'Overdue' as const },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-50">
                    <span className="text-sm font-medium text-gray-900">{item.client}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">{item.amount}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        item.status === 'Paid' ? 'bg-green-50 text-green-600' :
                        item.status === 'Pending' ? 'bg-yellow-50 text-yellow-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-900">Revenue this month</h4>
                <TrendingUp size={16} className="text-green-500" />
              </div>
              <div className="flex items-end gap-1 h-16">
                {[40, 65, 45, 80, 55, 90, 70, 95, 75, 85, 60, 100].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-primary/20 rounded-t-sm hover:bg-primary/40 transition-colors"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="absolute -bottom-6 -right-6 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute -top-6 -left-6 w-72 h-72 bg-accent/5 rounded-full blur-3xl -z-10" />
    </div>
  );
}
