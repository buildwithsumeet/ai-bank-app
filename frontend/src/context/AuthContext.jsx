import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [activeAccount, setActiveAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user profile on startup if token exists
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('apex_bank_token');
      if (token) {
        try {
          const res = await api.getProfile();
          if (res.success) {
            setUser(res.data.user);
            setAccounts(res.data.accounts || []);
            if (res.data.accounts?.length > 0) {
              setActiveAccount(res.data.accounts[0]);
            }
          }
        } catch (err) {
          console.error('Session expired or invalid:', err);
          localStorage.removeItem('apex_bank_token');
          setUser(null);
          setAccounts([]);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success) {
      localStorage.setItem('apex_bank_token', res.data.token);
      setUser({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
      });
      setAccounts(res.data.accounts || []);
      if (res.data.accounts?.length > 0) {
        setActiveAccount(res.data.accounts[0]);
      }
      return res;
    }
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success) {
      localStorage.setItem('apex_bank_token', res.data.token);
      setUser({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
      });
      const newAccList = res.data.account ? [res.data.account] : [];
      setAccounts(newAccList);
      setActiveAccount(newAccList[0] || null);
      return res;
    }
  };

  const logout = () => {
    localStorage.removeItem('apex_bank_token');
    setUser(null);
    setAccounts([]);
    setActiveAccount(null);
  };

  // Reload accounts data (e.g. after transaction)
  const refreshAccounts = async () => {
    try {
      const res = await api.getMyAccounts();
      if (res.success) {
        setAccounts(res.data);
        if (activeAccount) {
          const updatedActive = res.data.find((a) => a._id === activeAccount._id);
          setActiveAccount(updatedActive || res.data[0]);
        } else if (res.data.length > 0) {
          setActiveAccount(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to refresh accounts:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accounts,
        activeAccount,
        setActiveAccount,
        login,
        register,
        logout,
        refreshAccounts,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
