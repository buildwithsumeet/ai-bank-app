import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  transactions: [],
  analytics: null,
  loading: false,
  error: null,
};

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setTransactions: (state, action) => {
      state.transactions = action.payload || [];
      state.loading = false;
    },
    setAnalytics: (state, action) => {
      state.analytics = action.payload;
    },
    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload);
    },
    setTransactionLoading: (state, action) => {
      state.loading = action.payload;
    },
    setTransactionError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearTransactions: (state) => {
      state.transactions = [];
      state.analytics = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setTransactions,
  setAnalytics,
  addTransaction,
  setTransactionLoading,
  setTransactionError,
  clearTransactions,
} = transactionSlice.actions;

export default transactionSlice.reducer;
