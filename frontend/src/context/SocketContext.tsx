'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: any[];
  addNotification: (notification: any) => void;
  clearNotifications: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  notifications: [],
  addNotification: () => {},
  clearNotifications: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const addNotification = (notification: any) => {
    setNotifications((prev) => [
      { id: Date.now(), ...notification, timestamp: new Date() },
      ...prev.slice(0, 19), // Keep last 20
    ]);
  };

  const clearNotifications = () => setNotifications([]);

  useEffect(() => {
    // In production, use your backend URL from environment variables
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      
      // Join business room if logged in (this would typically happen after auth)
      const businessId = localStorage.getItem('activeBusinessId');
      if (businessId) {
        socketInstance.emit('join-business', businessId);
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Handle generic notifications
    socketInstance.on('notification', (data) => {
      addNotification(data);
    });

    // Handle specific events
    socketInstance.on('invoice-viewed', (data) => {
      addNotification({
        title: 'Invoice Viewed',
        message: `Invoice #${data.invoiceNumber || data.id} was viewed just now.`,
        type: 'info',
      });
    });

    socketInstance.on('invoice-status-updated', (data) => {
      addNotification({
        title: 'Invoice Updated',
        message: `Invoice status changed to ${data.status}.`,
        type: 'success',
      });
    });

    socketInstance.on('payment-received', (data) => {
      addNotification({
        title: 'Payment Received',
        message: `New payment of ${data.amount} received!`,
        type: 'success',
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, notifications, addNotification, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};
