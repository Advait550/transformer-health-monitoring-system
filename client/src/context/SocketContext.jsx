import React, { createContext, useContext, useEffect, useState } from 'react';
import { initSocketClient, disconnectSocket } from '../services/socketService';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user) {
      const socketInstance = initSocketClient();
      setSocket(socketInstance);

      const onConnect = () => setIsConnected(true);
      const onDisconnect = () => setIsConnected(false);

      socketInstance.on('connect', onConnect);
      socketInstance.on('disconnect', onDisconnect);

      if (socketInstance.connected) {
        setIsConnected(true);
      }

      return () => {
        socketInstance.off('connect', onConnect);
        socketInstance.off('disconnect', onDisconnect);
      };
    } else {
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
