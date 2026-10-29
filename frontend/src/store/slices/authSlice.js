import { createSlice } from '@reduxjs/toolkit';
import { getStorageItem, setStorageItem, removeStorageItem } from '../../utils/storage.js';

const initialToken = getStorageItem('apex_bank_token');
const initialRefreshToken = getStorageItem('apex_bank_refresh_token');

const initialState = {
  user: null,
  accessToken: initialToken,
  refreshToken: initialRefreshToken,
  isAuthenticated: !!initialToken,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, refreshToken, token } = action.payload;
      const validAccessToken = accessToken || token;
      state.user = user;
      state.accessToken = validAccessToken;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;

      if (validAccessToken) {
        setStorageItem('apex_bank_token', validAccessToken);
      }
      if (refreshToken) {
        state.refreshToken = refreshToken;
        setStorageItem('apex_bank_refresh_token', refreshToken);
      }
    },
    updateAccessToken: (state, action) => {
      const { accessToken, refreshToken, token } = action.payload;
      const validToken = accessToken || token;
      state.accessToken = validToken;
      setStorageItem('apex_bank_token', validToken);

      if (refreshToken) {
        state.refreshToken = refreshToken;
        setStorageItem('apex_bank_refresh_token', refreshToken);
      }
    },
    logoutAction: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      removeStorageItem('apex_bank_token');
      removeStorageItem('apex_bank_refresh_token');
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setCredentials,
  updateAccessToken,
  logoutAction,
  setAuthLoading,
  setAuthError,
} = authSlice.actions;

export default authSlice.reducer;
