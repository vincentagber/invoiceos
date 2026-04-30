'use client';

import React, { useState } from 'react';
import { 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Bar,
    Cell,
    Area,
    ComposedChart
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

export const RevenueChart = ({ data = [], type = 'bar' }: { data?: any[], type?: 'line' | 'bar' | 'area' }) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const chartColors = {
        revenue: {
            stroke: '#1F8A70', // Oripio Green
            fill: '#1F8A70',
            gradient: ['#1F8A70', '#1F8A7020']
        },
        expense: {
            stroke: '#E2E8F0', // Light Neutral
            fill: '#E2E8F0',
        }
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length && payload[0].payload) {
            const item = payload[0].payload;
            return (
                <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] min-w-[180px] animate-in zoom-in-95 duration-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 pb-2 border-b border-slate-100">
                        {item.name}
                    </p>
                    <div className="space-y-3">
                        {payload.map((entry: any, index: number) => (
                            <div key={index} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{entry.name}</span>
                                </div>
                                <p className="text-sm font-black text-slate-900 tracking-tight">
                                    {formatCurrency(entry.value, 'USD')}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-full w-full relative group font-sans">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart 
                    data={data} 
                    margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                    onMouseMove={(e: any) => {
                        if (e && e.activeTooltipIndex !== undefined) {
                            setActiveIndex(Number(e.activeTooltipIndex));
                        }
                    }}
                    onMouseLeave={() => setActiveIndex(null)}
                >
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColors.revenue.fill} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={chartColors.revenue.fill} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0 0" vertical={false} stroke="#F1F5F9" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
                        dy={15}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                    
                    <Bar 
                        dataKey="revenue" 
                        radius={[8, 8, 8, 8]}
                        barSize={32}
                    >
                        {data.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={activeIndex === index ? chartColors.revenue.fill : '#E2E8F0'} 
                                className="transition-all duration-300"
                            />
                        ))}
                    </Bar>

                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="none"
                        fill="url(#colorRevenue)"
                        fillOpacity={activeIndex !== null ? 1 : 0}
                        animationDuration={300}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};



