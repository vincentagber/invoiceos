'use client';

import React, { useState } from 'react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

export const RevenueChart = ({ data = [] }: { data?: any[] }) => {
    const [hoveredData, setHoveredData] = useState<any>(null);

    return (
        <div className="h-full w-full relative group">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                    data={data} 
                    margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                    onMouseMove={(v: any) => {
                        if (v && v.activePayload && v.activePayload.length > 0) {
                            setHoveredData(v.activePayload[0].payload);
                        }
                    }}
                    onMouseLeave={() => setHoveredData(null)}
                >
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.05}/>
                            <stop offset="95%" stopColor="#94A3B8" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-figtree)' }}
                        dy={10}
                        interval={1}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-figtree)' }}
                        tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                        content={() => null} // We use our custom floating indicator
                    />
                    <Area
                        type="monotone"
                        dataKey="previous"
                        stroke="#94A3B8"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        fillOpacity={1}
                        fill="url(#colorPrevious)"
                        animationDuration={1500}
                    />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#6366F1"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        activeDot={{ 
                            r: 6, 
                            fill: '#6366F1', 
                            stroke: '#fff', 
                            strokeWidth: 3,
                            className: "shadow-xl" 
                        }}
                        animationDuration={1000}
                    />
                </AreaChart>
            </ResponsiveContainer>

            {/* Custom Floating Info (Stripe-like) */}
            {hoveredData && (
                <div className="absolute top-0 right-0 p-4 animate-in fade-in slide-in-from-right-4 duration-300 pointer-events-none">
                    <div className="bg-white/80 backdrop-blur-md border border-slate-100 p-4 rounded-2xl shadow-2xl shadow-indigo-500/10 min-w-[160px]">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{hoveredData.name}</p>
                        <div className="space-y-1">
                            <p className="text-2xl font-black text-slate-900 tracking-tighter">
                                {formatCurrency(hoveredData.revenue, 'NGN')}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                                    +12.5% vs Prev.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
