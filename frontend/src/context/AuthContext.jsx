import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '../api/client.js';
import {
  setCredentials,
  logoutAction,
  setAuthLoading,
} from '../store/slices/authSlice.js';
import {
  setAccounts as setReduxAccounts,
  setActiveAccount as setReduxActiveAccount,
  clearAccounts,
} from '../store/slices/accountSlice.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const reduxUser = useSelector((state) => state.auth.user);
  const reduxAccounts = useSelector((state) => state.account.accounts);
  const reduxActiveAccount = useSelector((state) => state.account.activeAccount);

  const [user, setUser] = useState(reduxUser);
  const [accounts, setAccounts] = useState(reduxAccounts);
  const [activeAccount, setActiveAccount] = useState(reduxActiveAccount);
  const [loading, setLoading] = useState(true);

  // Sync Redux state with local state
  useEffect(() => {
    setUser(reduxUser);
  }, [reduxUser]);

  useEffect(() => {
    setAccounts(reduxAccounts);
  }, [reduxAccounts]);

  useEffect(() => {
    setActiveAccount(reduxActiveAccount);
  }, [reduxActiveAccount]);

  // Load user profile on startup if token exists
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('apex_bank_token');
      if (token) {
        try {
          dispatch(setAuthLoading(true));
          const res = await api.getProfile();
          if (res.success) {
            setUser(res.data.user);
            setAccounts(res.data.accounts || []);
            const primaryAcc = res.data.accounts?.length > 0 ? res.data.accounts[0] : null;
            setActiveAccount(primaryAcc);

            // Sync to Redux store
            dispatch(
              setCredentials({
                user: res.data.user,
                accessToken: token,
                refreshToken: localStorage.getItem('apex_bank_refresh_token'),
                token,
              })
            );
            dispatch(setReduxAccounts(res.data.accounts || []));
            if (primaryAcc) {
              dispatch(setReduxActiveAccount(primaryAcc));
            }
          }
        } catch (err) {
          console.error('Session expired or invalid:', err);
          localStorage.removeItem('apex_bank_token');
          localStorage.removeItem('apex_bank_refresh_token');
          dispatch(logoutAction());
          dispatch(clearAccounts());
          setUser(null);
          setAccounts([]);
          setActiveAccount(null);
        }
      }
      setLoading(false);
      dispatch(setAuthLoading(false));
    };

    initAuth();
  }, [dispatch]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success) {
      const accessToken = res.data.accessToken || res.data.token;
      const refreshToken = res.data.refreshToken || null;

      localStorage.setItem('apex_bank_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('apex_bank_refresh_token', refreshToken);
      }

      const userData = {
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
      };

      setUser(userData);
      setAccounts(res.data.accounts || []);
      const primaryAcc = res.data.accounts?.length > 0 ? res.data.accounts[0] : null;
      if (primaryAcc) {
        setActiveAccount(primaryAcc);
      }

      // Sync to Redux store
      dispatch(
        setCredentials({
          user: userData,
          accessToken,
          refreshToken,
          token: accessToken,
        })
      );
      dispatch(setReduxAccounts(res.data.accounts || []));
      if (primaryAcc) {
        dispatch(setReduxActiveAccount(primaryAcc));
      }

      return res;
    }
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success) {
      const accessToken = res.data.accessToken || res.data.token;
      const refreshToken = res.data.refreshToken || null;

      localStorage.setItem('apex_bank_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('apex_bank_refresh_token', refreshToken);
      }

      const userInfo = {
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
      };

      const newAccList = res.data.account ? [res.data.account] : [];
      setUser(userInfo);
      setAccounts(newAccList);
      setActiveAccount(newAccList[0] || null);

      // Sync to Redux store
      dispatch(
        setCredentials({
          user: userInfo,
          accessToken,
          refreshToken,
          token: accessToken,
        })
      );
      dispatch(setReduxAccounts(newAccList));
      if (newAccList[0]) {
        dispatch(setReduxActiveAccount(newAccList[0]));
      }

      return res;
    }
  };

  const logout = async () => {
    await api.logout();
    dispatch(logoutAction());
    dispatch(clearAccounts());
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
        dispatch(setReduxAccounts(res.data));

        if (activeAccount) {
          const updatedActive = res.data.find((a) => a._id === activeAccount._id);
          const nextActive = updatedActive || res.data[0];
          setActiveAccount(nextActive);
          dispatch(setReduxActiveAccount(nextActive));
        } else if (res.data.length > 0) {
          setActiveAccount(res.data[0]);
          dispatch(setReduxActiveAccount(res.data[0]));
        }
      }
    } catch (err) {
      console.error('Failed to refresh accounts:', err);
    }
  };

  const handleSetActiveAccount = (acc) => {
    setActiveAccount(acc);
    dispatch(setReduxActiveAccount(acc));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accounts,
        activeAccount,
        setActiveAccount: handleSetActiveAccount,
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
