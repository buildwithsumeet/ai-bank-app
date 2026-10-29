import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import accountReducer from './slices/accountSlice.js';
import transactionReducer from './slices/transactionSlice.js';
import uiReducer from './slices/uiSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    account: accountReducer,
    transaction: transactionReducer,
    ui: uiReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
