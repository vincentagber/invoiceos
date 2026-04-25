'use client';

import React from 'react';
import { useCollaboration } from '@/context/CollaborationContext';
import clsx from 'clsx';

export const PresenceAvatars = () => {
    const { activeUsers } = useCollaboration();

    if (activeUsers.length === 0) return null;

    return (
        <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
                {activeUsers.map((id, i) => (
                    <div 
                        key={id} 
                        className={clsx(
                            "h-8 w-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-lg",
                            ["bg-indigo-600", "bg-emerald-500", "bg-rose-500", "bg-amber-500"][i % 4]
                        )}
                        title={`User ${id}`}
                    >
                        {id.substring(0, 2).toUpperCase()}
                    </div>
                ))}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {activeUsers.length} {activeUsers.length === 1 ? 'person' : 'people'} collaborating
            </p>
        </div>
    );
};
