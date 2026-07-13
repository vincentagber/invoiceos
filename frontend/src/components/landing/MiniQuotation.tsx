'use client';

import React from 'react';

export default function MiniQuotation() {
  return (
    <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.06)] shadow-sm p-4 w-full max-w-[260px] mx-auto">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">QUO-042</span>
        <span className="text-[8px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider">Draft</span>
      </div>
      <div className="space-y-2 mb-3 pb-3 border-b border-slate-100">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-medium text-slate-500">Acme Corp</span>
          <span className="text-[10px] text-slate-400">×2</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-medium text-slate-500">Consulting</span>
          <span className="text-[10px] text-slate-400">×1</span>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-[10px]">
          <span className="text-slate-400">Subtotal</span>
          <span className="font-medium text-slate-700">$4,200</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-slate-400">Tax (7.5%)</span>
          <span className="font-medium text-slate-700">$315</span>
        </div>
        <div className="flex justify-between text-[10px] font-bold pt-1 border-t border-slate-100">
          <span className="text-slate-600">Total</span>
          <span className="text-orange-600">$4,515</span>
        </div>
      </div>
    </div>
  );
}
