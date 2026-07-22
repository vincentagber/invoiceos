'use client';

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  badge?: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange?: (id: string) => void;
  className?: string;
  variant?: 'underline' | 'pills' | 'segmented';
  size?: 'sm' | 'md';
}

export function Tabs({ tabs, activeTab: controlledActive, onChange, className, variant = 'underline', size = 'md' }: TabsProps) {
  const [internalActive, setInternalActive] = useState(tabs[0]?.id);
  const activeTab = controlledActive ?? internalActive;

  const handleChange = (id: string) => {
    if (!controlledActive) setInternalActive(id);
    onChange?.(id);
  };

  const sizeClasses = {
    sm: 'text-xs px-3 py-2 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
  };

  if (variant === 'pills') {
    return (
      <div className={twMerge('flex items-center gap-1 p-1 bg-surface-tertiary rounded-xl', className)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleChange(tab.id)}
            className={twMerge(clsx(
              'flex items-center justify-center font-medium rounded-lg transition-all duration-150 whitespace-nowrap',
              sizeClasses[size],
              activeTab === tab.id
                ? 'bg-surface text-text-primary shadow-sm'
                : 'text-text-tertiary hover:text-text-secondary',
            ))}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className={clsx(
                'px-1.5 py-0.5 rounded-md text-[10px] font-semibold',
                activeTab === tab.id ? 'bg-primary-50 text-primary-600' : 'bg-surface-secondary text-text-tertiary',
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'segmented') {
    return (
      <div className={twMerge('relative flex items-center p-0.5 bg-surface-tertiary rounded-xl', className)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleChange(tab.id)}
            className={clsx(
              'relative z-10 flex-1 flex items-center justify-center font-medium rounded-[10px] transition-colors duration-150 whitespace-nowrap',
              sizeClasses[size],
              activeTab === tab.id ? 'text-text-primary' : 'text-text-tertiary hover:text-text-secondary',
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
        {activeTab && (
          <motion.div
            layoutId="segmented-indicator"
            className="absolute inset-0.5 z-0 bg-surface rounded-[10px] shadow-sm"
            style={{
              width: `${100 / tabs.length}%`,
              left: `${(tabs.findIndex(t => t.id === activeTab) / tabs.length) * 100}%`,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
      </div>
    );
  }

  return (
    <div className={twMerge('flex items-center gap-6 border-b border-border', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleChange(tab.id)}
          className={clsx(
            'relative flex items-center gap-2 pb-3 text-sm font-medium transition-colors whitespace-nowrap',
            activeTab === tab.id
              ? 'text-primary-600'
              : 'text-text-tertiary hover:text-text-secondary',
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && (
            <span className={clsx(
              'px-1.5 py-0.5 rounded-md text-[10px] font-semibold',
              activeTab === tab.id ? 'bg-primary-50 text-primary-600' : 'bg-surface-tertiary text-text-tertiary',
            )}>
              {tab.count}
            </span>
          )}
          {activeTab === tab.id && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
