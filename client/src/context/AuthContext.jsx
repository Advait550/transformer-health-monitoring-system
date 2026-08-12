import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, getMe as getMeApi } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('thms_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('thms_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await getMeApi();
          if (res.success) {
            setUser(res.user);
            localStorage.setItem('thms_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.error('Failed to verify session token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const loginUser = async (email, password) => {
    const res = await loginApi(email, password);
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('thms_token', res.token);
      localStorage.setItem('thms_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('thms_token');
    localStorage.removeItem('thms_user');
  };

  const isAdmin = user?.role === 'Admin';
  const isEngineer = user?.role === 'Engineer';
  const canEdit = isAdmin || isEngineer;
  const canDelete = isAdmin;
  const canCreateUser = isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login: loginUser,
        logout,
        isAdmin,
        isEngineer,
        canEdit,
        canDelete,
        canCreateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
