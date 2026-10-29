import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  accounts: [],
  activeAccount: null,
  loading: false,
  error: null,
};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setAccounts: (state, action) => {
      state.accounts = action.payload || [];
      if (!state.activeAccount && state.accounts.length > 0) {
        state.activeAccount = state.accounts[0];
      } else if (state.activeAccount) {
        // Keep active account synced with fresh balance
        const updated = state.accounts.find((a) => a._id === state.activeAccount._id);
        if (updated) {
          state.activeAccount = updated;
        }
      }
      state.loading = false;
    },
    setActiveAccount: (state, action) => {
      state.activeAccount = action.payload;
    },
    updateAccountBalance: (state, action) => {
      const { accountId, balance } = action.payload;
      const acc = state.accounts.find((a) => a._id === accountId);
      if (acc) {
        acc.balance = balance;
      }
      if (state.activeAccount && state.activeAccount._id === accountId) {
        state.activeAccount.balance = balance;
      }
    },
    setAccountLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAccountError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearAccounts: (state) => {
      state.accounts = [];
      state.activeAccount = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setAccounts,
  setActiveAccount,
  updateAccountBalance,
  setAccountLoading,
  setAccountError,
  clearAccounts,
} = accountSlice.actions;

export default accountSlice.reducer;
