'use client';

import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface Tab {
    id: string;
    label: string;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (id: string) => void;
    className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
    return (
        <div className={clsx("flex p-1 space-x-1 bg-slate-100/80 rounded-xl", className)}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={clsx(
                            "relative flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors z-10",
                            isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                        )}
                        style={{
                            WebkitTapHighlightColor: "transparent",
                        }}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="active-tab"
                                className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/50"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                style={{ zIndex: -1 }}
                            />
                        )}
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
