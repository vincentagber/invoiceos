'use client';

import React from 'react';
import { useTaxStore } from '@/store/useTaxStore';
import { CheckCircle, ArrowRight, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export function RemittanceTracker() {
    const { monthlyRecords, getDeadlineStatus, markAsFiled } = useTaxStore();

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">NRS Remittance Calendar</h3>
                <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded">Jan 2026 Policy Active</span>
            </div>

            <div className="divide-y divide-gray-100">
                {monthlyRecords.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">No remittance records generated yet.</div>
                ) : (
                    monthlyRecords.map((record) => {
                        const { deadline, daysRemaining, isOverdue, potentialPenalty } = getDeadlineStatus(record.month);

                        return (
                            <div key={record.month} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4">
                                <div>
                                    <p className="font-semibold text-gray-800">{format(new Date(record.month), 'MMMM yyyy')}</p>
                                    <p className="text-xs text-gray-500">Deadline: {format(deadline, 'do MMM, yyyy')}</p>
                                </div>

                                <div className="flex items-center gap-6 justify-between sm:justify-end w-full sm:w-auto">
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 uppercase">VAT/WHT Due</p>
                                        <p className="font-bold text-gray-900">₦{(record.vatDue + record.whtDue).toLocaleString()}</p>
                                    </div>

                                    {record.isFiled ? (
                                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            <CheckCircle size={14} /> Filed
                                        </span>
                                    ) : isOverdue ? (
                                        <div className="text-right flex flex-col items-end">
                                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                                <AlertTriangle size={12} /> Overdue
                                            </span>
                                            {potentialPenalty > 0 && <p className="text-[10px] text-red-600 font-bold mt-1">Penalty: ₦{potentialPenalty.toLocaleString()}</p>}
                                        </div>
                                    ) : (
                                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
                                            {daysRemaining} Days Left
                                        </span>
                                    )}

                                    {!record.isFiled && (
                                        <button
                                            onClick={() => markAsFiled(record.month)}
                                            className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors border border-indigo-100"
                                            title="Mark as Filed"
                                        >
                                            <ArrowRight size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
