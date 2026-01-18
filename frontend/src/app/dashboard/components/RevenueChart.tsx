'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

// Mock data generator (replace with real API data later)
const generateData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    return months.map(name => ({
        name,
        revenue: Math.floor(Math.random() * 5000) + 1000,
        outstanding: Math.floor(Math.random() * 2000)
    }));
};

export const RevenueChart = () => {
    const data = generateData();

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Revenue & Outstanding</h2>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            tickFormatter={(value) => `₦${value}`} // Short format
                        />
                        <Tooltip
                            formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Amount']}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar
                            dataKey="revenue"
                            fill="#7C3AED"
                            radius={[4, 4, 0, 0]}
                            name="Revenue"
                        />
                        <Bar
                            dataKey="outstanding"
                            fill="#FCD34D"
                            radius={[4, 4, 0, 0]}
                            name="Outstanding"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
