import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const DEMO_PRESETS = [
  {
    name: 'Rohit Sharma',
    role: 'STAFF',
    email: 'rohit@abcca.com',
    firmName: 'ABC & Co. Chartered Accountants',
    firmCode: 'ABC-CA',
    description: 'Firm 1 Staff: Can create clients, upload documents & re-upload corrections.'
  },
  {
    name: 'Aman Verma',
    role: 'REVIEWER',
    email: 'aman@abcca.com',
    firmName: 'ABC & Co. Chartered Accountants',
    firmCode: 'ABC-CA',
    description: 'Firm 1 Reviewer: Can start reviews, request corrections, and grant approvals.'
  },
  {
    name: 'Priya Mehta',
    role: 'STAFF',
    email: 'priya@apex.com',
    firmName: 'Apex Tax & Audit Advisors',
    firmCode: 'APEX-TAX',
    description: 'Firm 2 Staff: Isolated tenant for verifying multi-tenant security boundary.'
  }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('obliq_auth_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await api.auth.me();
        setUser(res.data.user);
      } catch (err) {
        console.error('Session restoration failed:', err);
        setToken(null);
        setUser(null);
        localStorage.removeItem('obliq_auth_token');
      } finally {
        setLoading(false);
      }
    }

    loadUser();

    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [token]);

  const login = async (email, password) => {
    const res = await api.auth.login(email, password);
    const newToken = res.data.token;
    const userData = res.data.user;
    localStorage.setItem('obliq_auth_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('obliq_auth_token');
      setToken(null);
      setUser(null);
    }
  };

  const switchUser = async (email) => {
    return await login(email, 'password123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        role: user?.role,
        isStaff: user?.role === 'STAFF',
        isReviewer: user?.role === 'REVIEWER',
        firmId: user?.firmId,
        firmName: user?.firmName,
        firmCode: user?.firmCode,
        loading,
        login,
        logout,
        switchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
