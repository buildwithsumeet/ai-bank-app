const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('apex_bank_token');
  const headers = {
    'Content-Type': 'application/json',
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

  getProfile: async () => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
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
    const res = await fetch(`${API_BASE}/accounts`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createAccount: async (accountType) => {
    const res = await fetch(`${API_BASE}/accounts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ accountType }),
    });
    return handleResponse(res);
  },

  lookupAccount: async (accountNumber) => {
    const res = await fetch(`${API_BASE}/accounts/lookup/${accountNumber}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Transactions
  deposit: async (accountId, amount, description, category) => {
    const res = await fetch(`${API_BASE}/transactions/deposit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ accountId, amount, description, category }),
    });
    return handleResponse(res);
  },

  withdraw: async (accountId, amount, description, category) => {
    const res = await fetch(`${API_BASE}/transactions/withdraw`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ accountId, amount, description, category }),
    });
    return handleResponse(res);
  },

  transfer: async (fromAccountId, toAccountNumber, amount, description, category) => {
    const res = await fetch(`${API_BASE}/transactions/transfer`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        fromAccountId,
        toAccountNumber,
        amount,
        description,
        category,
      }),
    });
    return handleResponse(res);
  },

  getTransactions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/transactions/history?${query}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getAnalytics: async () => {
    const res = await fetch(`${API_BASE}/transactions/analytics`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Admin
  getAdminMetrics: async () => {
    const res = await fetch(`${API_BASE}/admin/metrics`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getAdminUsers: async () => {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  updateAccountStatus: async (accountId, status) => {
    const res = await fetch(`${API_BASE}/admin/accounts/${accountId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  getAdminTransactions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/transactions?${query}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Ollama AI Assistant
  getAiStatus: async () => {
    const res = await fetch(`${API_BASE}/ai/status`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  chatWithAi: async (message) => {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message }),
    });
    return handleResponse(res);
  },
};

