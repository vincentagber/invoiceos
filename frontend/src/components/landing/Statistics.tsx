'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Heart, Globe, Shield } from 'lucide-react';

function Counter({ value, suffix = '' }: { value: string; suffix?: string }) {
  const num = parseInt(value.replace(/\D/g, ''));
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let start = 0;
    const duration = 2000;
    const step = Math.ceil(num / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= num) {
        setCount(num);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [num]);

  return <>{count.toLocaleString()}{suffix}</>;
}

const stats = [
  { icon: TrendingUp, value: '120K+', label: 'Invoices Created', color: 'text-primary', bg: 'bg-primary/10' },
  { icon: Heart, value: '98%', suffix: '%', label: 'Customer Satisfaction', color: 'text-green-500', bg: 'bg-green-50' },
  { icon: Globe, value: '52', label: 'Countries', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: Shield, value: '99.9%', suffix: '%', label: 'Uptime', color: 'text-accent', bg: 'bg-accent/10' },
];

export default function Statistics() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center mx-auto mb-5`}>
                <stat.icon size={28} className={stat.color} />
              </div>
              <div className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
                <Counter value={stat.value} suffix={stat.suffix || ''} />
              </div>
              <p className="text-gray-500 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
