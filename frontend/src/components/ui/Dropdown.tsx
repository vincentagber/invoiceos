'use client';

import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

export interface DropdownItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'start' | 'end';
  className?: string;
  menuClassName?: string;
}

export function Dropdown({ trigger, items, align = 'end', className, menuClassName }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={twMerge('relative inline-block', className)}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className={twMerge(clsx(
              'absolute z-50 mt-1.5 min-w-[180px] bg-surface rounded-xl border border-border shadow-lg py-1',
              align === 'end' ? 'right-0' : 'left-0',
              menuClassName,
            ))}
          >
            {items.map((item, i) => (
              <React.Fragment key={item.key}>
                {item.divider && i > 0 && <div className="my-1 border-t border-border-light" />}
                <button
                  onClick={() => {
                    item.onClick?.();
                    setIsOpen(false);
                  }}
                  disabled={item.disabled}
                  className={clsx(
                    'w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium transition-colors',
                    item.danger
                      ? 'text-danger hover:bg-danger-50'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-tertiary',
                    item.disabled && 'opacity-40 cursor-not-allowed',
                  )}
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  {item.label}
                </button>
              </React.Fragment>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
