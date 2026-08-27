import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = localStorage.getItem('insightflow_token');
        if (token) {
          const res = await authAPI.getMe();
          setUser(res.data.user);
        } else {
          // Provide guest analyst user by default for frictionless demo
          setUser({
            id: 'guest_user',
            name: 'Demo Analyst',
            email: 'analyst@insightflow.internal',
            role: 'Business Analyst'
          });
        }
      } catch (err) {
        console.warn('Auth check failed, using guest:', err);
        setUser({
          id: 'guest_user',
          name: 'Demo Analyst',
          email: 'analyst@insightflow.internal',
          role: 'Business Analyst'
        });
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('insightflow_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, password, role) => {
    const res = await authAPI.register({ name, email, password, role });
    localStorage.setItem('insightflow_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('insightflow_token');
    setUser({
      id: 'guest_user',
      name: 'Guest User',
      email: 'guest@insightflow.internal',
      role: 'Business Analyst'
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
