'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
  width?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  wrapperClassName?: string;
  minWidth?: string;
  onRowClick?: (item: T) => void;
  emptyState?: React.ReactNode;
  loading?: boolean;
  skeletonRows?: number;
}

export function Table<T extends { id: string }>({
  columns,
  data,
  className,
  wrapperClassName,
  minWidth = 'min-w-[650px]',
  onRowClick,
  emptyState,
  loading,
  skeletonRows = 5,
}: TableProps<T>) {
  return (
    <div className={twMerge('overflow-x-auto scrollbar-thin', wrapperClassName)}>
      <table className={twMerge('w-full text-left border-collapse', minWidth, className)}>
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={twMerge(
                  'px-4 sm:px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary whitespace-nowrap',
                  col.headerClassName,
                )}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light">
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={`skeleton-${i}`}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 sm:px-6 py-4">
                    <div className="h-4 bg-surface-tertiary rounded-md animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 sm:px-6 py-16 text-center">
                {emptyState || (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-text-tertiary">No data available</p>
                  </div>
                )}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={item.id}
                className={clsx(
                  'transition-colors duration-150',
                  onRowClick ? 'cursor-pointer hover:bg-surface-secondary' : 'hover:bg-surface-secondary/50',
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={twMerge('px-4 sm:px-6 py-4 text-sm text-text-primary whitespace-nowrap', col.className)}
                  >
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
