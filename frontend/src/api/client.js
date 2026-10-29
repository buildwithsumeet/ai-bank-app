import { store } from '../store/index.js';
import { updateAccessToken, logoutAction } from '../store/slices/authSlice.js';
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/storage.js';

const API_BASE = '/api';

const getAccessToken = () => getStorageItem('apex_bank_token') || null;
const getRefreshToken = () => getStorageItem('apex_bank_refresh_token') || null;

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

const getHeaders = (extraHeaders = {}) => {
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({ message: 'Network response was not JSON' }));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
};

/**
 * Intelligent fetch wrapper with Silent 401 Refresh Interceptor
 */
export const fetchWithAuth = async (url, options = {}) => {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
  const requestOptions = {
    ...options,
    headers: getHeaders(options.headers),
  };

  const response = await fetch(fullUrl, requestOptions);

  // If unauthorized and we have a refresh token, attempt silent token refresh
  if (response.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/refresh') && !url.includes('/auth/register')) {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          const refreshData = await refreshRes.json();

          if (refreshRes.ok && refreshData.success) {
            const newAccessToken = refreshData.data.accessToken || refreshData.data.token;
            const newRefreshToken = refreshData.data.refreshToken;

            setStorageItem('apex_bank_token', newAccessToken);
            if (newRefreshToken) {
              setStorageItem('apex_bank_refresh_token', newRefreshToken);
            }

            // Sync to Redux store
            store.dispatch(
              updateAccessToken({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                token: newAccessToken,
              })
            );

            isRefreshing = false;
            onRefreshed(newAccessToken);

            // Retry original request with fresh access token
            requestOptions.headers['Authorization'] = `Bearer ${newAccessToken}`;
            const retriedResponse = await fetch(fullUrl, requestOptions);
            return handleResponse(retriedResponse);
          } else {
            // Refresh token revoked or expired
            isRefreshing = false;
            removeStorageItem('apex_bank_token');
            removeStorageItem('apex_bank_refresh_token');
            store.dispatch(logoutAction());
          }
        } catch (refreshErr) {
          isRefreshing = false;
          removeStorageItem('apex_bank_token');
          removeStorageItem('apex_bank_refresh_token');
          store.dispatch(logoutAction());
        }
      } else {
        // Queue concurrent requests while token is refreshing
        return new Promise((resolve) => {
          addRefreshSubscriber(async (newToken) => {
            requestOptions.headers['Authorization'] = `Bearer ${newToken}`;
            const retriedResponse = await fetch(fullUrl, requestOptions);
            resolve(handleResponse(retriedResponse));
          });
        });
      }
    }
  }

  return handleResponse(response);
};

export const api = {
  // Auth
  login: async (credentials) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  refreshToken: async (refreshToken) => {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    return handleResponse(res);
  },

  logout: async () => {
    const refreshToken = getRefreshToken();
    try {
      await fetchWithAuth('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } catch (e) {
      // Ignore network errors on logout
    }
    removeStorageItem('apex_bank_token');
    removeStorageItem('apex_bank_refresh_token');
  },

  getProfile: async () => {
    return fetchWithAuth('/auth/profile');
  },

  seedDemoDatabase: async () => {
    const res = await fetch(`${API_BASE}/auth/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(res);
  },

  // Accounts
  getMyAccounts: async () => {
    return fetchWithAuth('/accounts');
  },

  createAccount: async (accountType) => {
    return fetchWithAuth('/accounts', {
      method: 'POST',
      body: JSON.stringify({ accountType }),
    });
  },

  lookupAccount: async (accountNumber) => {
    return fetchWithAuth(`/accounts/lookup/${accountNumber}`);
  },

  // Transactions
  deposit: async (accountId, amount, description, category) => {
    return fetchWithAuth('/transactions/deposit', {
      method: 'POST',
      body: JSON.stringify({ accountId, amount, description, category }),
    });
  },

  withdraw: async (accountId, amount, description, category) => {
    return fetchWithAuth('/transactions/withdraw', {
      method: 'POST',
      body: JSON.stringify({ accountId, amount, description, category }),
    });
  },

  transfer: async (fromAccountId, toAccountNumber, amount, description, category) => {
    return fetchWithAuth('/transactions/transfer', {
      method: 'POST',
      body: JSON.stringify({
        fromAccountId,
        toAccountNumber,
        amount,
        description,
        category,
      }),
    });
  },

  getTransactions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/transactions/history?${query}`);
  },

  getAnalytics: async () => {
    return fetchWithAuth('/transactions/analytics');
  },

  // Admin
  getAdminMetrics: async () => {
    return fetchWithAuth('/admin/metrics');
  },

  getAdminUsers: async () => {
    return fetchWithAuth('/admin/users');
  },

  updateAccountStatus: async (accountId, status) => {
    return fetchWithAuth(`/admin/accounts/${accountId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  getAdminTransactions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/admin/transactions?${query}`);
  },

  // Ollama AI Assistant
  getAiStatus: async () => {
    return fetchWithAuth('/ai/status');
  },

  chatWithAi: async (message) => {
    return fetchWithAuth('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },
};
