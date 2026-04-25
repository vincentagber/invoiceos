'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface CollaborationContextType {
    socket: Socket | null;
    activeUsers: string[];
    emitActivity: (roomId: string, activity: any) => void;
}

const CollaborationContext = createContext<CollaborationContextType>({
    socket: null,
    activeUsers: [],
    emitActivity: () => {},
});

export const CollaborationProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [activeUsers, setActiveUsers] = useState<string[]>([]);

    useEffect(() => {
        const newSocket = io(process.env.NEXT_PUBLIC_NODE_API_URL || 'http://localhost:4000');
        setSocket(newSocket);

        newSocket.on('user-joined', (data) => {
            setActiveUsers((prev) => [...new Set([...prev, data.userId])]);
        });

        return () => {
            newSocket.close();
        };
    }, []);

    const emitActivity = (roomId: string, activity: any) => {
        if (socket) {
            socket.emit('activity', { roomId, ...activity });
        }
    };

    return (
        <CollaborationContext.Provider value={{ socket, activeUsers, emitActivity }}>
            {children}
        </CollaborationContext.Provider>
    );
};

export const useCollaboration = () => useContext(CollaborationContext);
