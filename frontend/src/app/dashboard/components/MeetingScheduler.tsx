'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, Check, X, Wand2 } from 'lucide-react';
import clsx from 'clsx';

interface MeetingSchedulerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MeetingScheduler({ isOpen, onClose }: MeetingSchedulerProps) {
    const [selectedDate, setSelectedDate] = useState<number>(14);
    const [aiNotes, setAiNotes] = useState(true);

    if (!isOpen) return null;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const calendarDays = [
        { day: 30, current: false }, { day: 1, current: true }, { day: 2, current: true }, { day: 3, current: true }, { day: 4, current: true }, { day: 5, current: true }, { day: 6, current: true },
        { day: 7, current: true }, { day: 8, current: true }, { day: 9, current: true }, { day: 10, current: true }, { day: 11, current: true }, { day: 12, current: true }, { day: 13, current: true },
        { day: 14, current: true, selected: true }, { day: 15, current: true, inRange: true }, { day: 16, current: true, inRange: true }, { day: 17, current: true, inRange: true }, { day: 18, current: true, inRange: true }, { day: 19, current: true, inRange: true }, { day: 20, current: true, selected: true },
        { day: 21, current: true }, { day: 22, current: true }, { day: 23, current: true }, { day: 24, current: true }, { day: 25, current: true }, { day: 26, current: true }, { day: 27, current: true },
        { day: 28, current: true }, { day: 29, current: true }, { day: 30, current: true }, { day: 31, current: true }, { day: 1, current: false }, { day: 2, current: false }, { day: 3, current: false },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 shadow-sm">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Schedule a meeting</h2>
                                <p className="text-sm text-slate-500">Create your next meeting easily.</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row">
                    {/* Left: Calendar */}
                    <div className="p-6 flex-1 border-r border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <button className="p-1 text-slate-400 hover:text-slate-600"><ChevronLeft size={18} /></button>
                            <h3 className="font-semibold text-slate-900">July 2025</h3>
                            <button className="p-1 text-slate-400 hover:text-slate-600"><ChevronRight size={18} /></button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {days.map(d => (
                                <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider py-2">
                                    {d}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((d, i) => (
                                <button
                                    key={i}
                                    className={clsx(
                                        "h-10 w-10 flex items-center justify-center rounded-full text-sm transition-all relative",
                                        !d.current && "text-slate-300",
                                        d.current && !d.selected && !d.inRange && "text-slate-700 hover:bg-slate-50",
                                        d.selected && "bg-indigo-600 text-white shadow-md z-10",
                                        d.inRange && "bg-indigo-50 text-indigo-600 font-medium"
                                    )}
                                >
                                    {d.day}
                                    {d.inRange && !d.selected && (
                                        <div className="absolute inset-0 bg-indigo-50/50 -z-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="p-6 w-full md:w-72 flex flex-col gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start date*</label>
                                <div className="flex border border-slate-200 rounded-xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                                    <div className="flex-1 px-3 py-2.5 text-sm text-slate-900 border-r border-slate-100">July 14, 2025</div>
                                    <div className="px-3 py-2.5 text-sm text-slate-600 bg-slate-50/50">9:00 am</div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">End date*</label>
                                <div className="flex border border-slate-200 rounded-xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                                    <div className="flex-1 px-3 py-2.5 text-sm text-slate-900 border-r border-slate-100">July 20, 2025</div>
                                    <div className="px-3 py-2.5 text-sm text-slate-600 bg-slate-50/50">10:00 am</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-700">Enable AI notes</span>
                                <Wand2 size={14} className="text-indigo-500" />
                            </div>
                            <button
                                onClick={() => setAiNotes(!aiNotes)}
                                className={clsx(
                                    "w-11 h-6 rounded-full transition-colors relative flex items-center px-1",
                                    aiNotes ? "bg-indigo-600" : "bg-slate-200"
                                )}
                            >
                                <div className={clsx(
                                    "h-4 w-4 bg-white rounded-full shadow-sm transition-transform",
                                    aiNotes ? "translate-x-5" : "translate-x-0"
                                )} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-slate-500 flex items-center gap-2">
                        <span className="font-medium text-slate-700">Event:</span>
                        July 14 - 20, from 9:00 am - 10:00 am
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 shadow-md shadow-indigo-200 transition-all active:scale-95"
                        >
                            Schedule
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
