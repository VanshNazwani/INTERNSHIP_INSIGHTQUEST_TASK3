'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

export const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInitializer = async () => {
      // We call the API route to initialize the socket server
      await fetch('/api/socketio');
      
      const socketInstance = io({
        path: '/api/socketio',
        addTrailingSlash: false,
      });

      socketInstance.on('connect', () => {
        console.log('Connected to socket server');
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from socket server');
        setIsConnected(false);
      });

      setSocket(socketInstance);
    }

    socketInitializer();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
