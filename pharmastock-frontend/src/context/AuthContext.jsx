// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('pharma_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('pharma_token'));

  // ── Login ──
  const login = useCallback(async (email, password) => {
    const { data } = await axiosClient.post('/auth/login', { email, password });
    localStorage.setItem('pharma_token', data.token);
    localStorage.setItem('pharma_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    toast.success(`Bienvenue, ${data.user.prenom} !`);
    return data.user;
  }, []);

  // ── Logout ──
  const logout = useCallback(() => {
    localStorage.removeItem('pharma_token');
    localStorage.removeItem('pharma_user');
    setToken(null);
    setUser(null);
    toast.success('Vous êtes déconnecté.');
  }, []);

  // ── Vérification de rôle ──
  const hasRole = useCallback((...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  const isAdmin       = hasRole('ADMIN');
  const isPharmacien  = hasRole('ADMIN', 'PHARMACIEN');
  const isCaissier    = hasRole('ADMIN', 'PHARMACIEN', 'CAISSIER');
  const isGestionnaire = hasRole('ADMIN', 'PHARMACIEN', 'GESTIONNAIRE_STOCK');

  return (
    <AuthContext.Provider value={{
      user, token,
      login, logout, hasRole,
      isAdmin, isPharmacien, isCaissier, isGestionnaire,
      isAuthenticated: !!token,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
