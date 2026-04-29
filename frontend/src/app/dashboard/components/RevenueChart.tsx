'use client';

import React, { useState } from 'react';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar,
    ReferenceLine
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

export const RevenueChart = ({ data = [], type = 'line' }: { data?: any[], type?: 'line' | 'bar' }) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const chartColors = {
        revenue: {
            stroke: '#1F8A70', // Emerald Green (Success)
            fill: '#1F8A70',
        },
        expense: {
            stroke: '#0B1F3A', // Deep Navy (Authority)
            fill: '#0B1F3A',
        }
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] min-w-[220px] animate-in zoom-in-95 duration-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 pb-2 border-b border-slate-100">
                        {payload[0].payload.name} Insights
                    </p>
                    <div className="space-y-4">
                        {payload.map((entry: any, index: number) => (
                            <div key={index} className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{entry.name}</span>
                                </div>
                                <p className="text-xl font-black text-slate-900 tracking-tighter">
                                    {formatCurrency(entry.value, 'NGN')}
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
                {type === 'line' ? (
                    <LineChart 
                        data={data} 
                        margin={{ top: 20, right: 30, left: 60, bottom: 40 }}
                        onMouseMove={(e) => {
                            if (e.activeTooltipIndex !== undefined) setActiveIndex(e.activeTooltipIndex);
                        }}
                        onMouseLeave={() => setActiveIndex(null)}
                    >
                        <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#E2E8F0" opacity={0.6} />
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
                            tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
                            width={60}
                            dx={-10}
                        />
                        <Tooltip 
                            content={<CustomTooltip />} 
                            cursor={false} // We use our custom ReferenceLine as a cursor
                        />
                        
                        {/* Custom Vertical Cursor Line */}
                        {activeIndex !== null && data[activeIndex] && (
                            <ReferenceLine
                                x={data[activeIndex].name}
                                stroke="#CBD5E1"
                                strokeDasharray="4 4"
                                strokeWidth={1}
                            />
                        )}

                        <Line
                            name="Revenue"
                            type="monotone"
                            dataKey="revenue"
                            stroke={chartColors.revenue.stroke}
                            strokeWidth={3}
                            dot={{ r: 3, fill: chartColors.revenue.stroke, stroke: '#fff', strokeWidth: 2 }}
                            activeDot={{ r: 7, fill: chartColors.revenue.stroke, stroke: '#fff', strokeWidth: 3 }}
                            animationDuration={1500}
                        />
                        <Line
                            name="Expenses"
                            type="monotone"
                            dataKey="previous"
                            stroke={chartColors.expense.stroke}
                            strokeWidth={3}
                            dot={{ r: 3, fill: chartColors.expense.stroke, stroke: '#fff', strokeWidth: 2 }}
                            activeDot={{ r: 7, fill: chartColors.expense.stroke, stroke: '#fff', strokeWidth: 3 }}
                            animationDuration={2000}
                        />
                    </LineChart>
                ) : (
                    <BarChart 
                        data={data} 
                        margin={{ top: 20, right: 30, left: 60, bottom: 40 }}
                        barGap={12}
                    >
                        <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#E2E8F0" opacity={0.6} />
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
                            tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
                            dx={-10}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F1F5F9', opacity: 0.5 }} />
                        <Bar 
                            name="Revenue"
                            dataKey="revenue" 
                            fill={chartColors.revenue.stroke} 
                            radius={[6, 6, 0, 0]} 
                            barSize={32}
                            animationDuration={1500}
                        />
                        <Bar 
                            name="Expenses"
                            dataKey="previous" 
                            fill={chartColors.expense.stroke} 
                            radius={[6, 6, 0, 0]} 
                            barSize={32}
                            animationDuration={2000}
                        />
                    </BarChart>
                )}
            </ResponsiveContainer>
        </div>
    );
};


