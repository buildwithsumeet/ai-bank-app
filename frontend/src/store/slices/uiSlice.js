import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  transferModalOpen: false,
  depositModalOpen: false,
  aiModalOpen: false,
  activeTab: 'overview',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTransferModalOpen: (state, action) => {
      state.transferModalOpen = action.payload;
    },
    setDepositModalOpen: (state, action) => {
      state.depositModalOpen = action.payload;
    },
    setAiModalOpen: (state, action) => {
      state.aiModalOpen = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
  },
});

export const {
  setTransferModalOpen,
  setDepositModalOpen,
  setAiModalOpen,
  setActiveTab,
} = uiSlice.actions;

export default uiSlice.reducer;
