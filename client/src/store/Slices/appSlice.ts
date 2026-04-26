// src/store/slices/appSlice.ts
import { createSlice } from '@reduxjs/toolkit';

const appSlice = createSlice({
  name: 'app',
  initialState: { hasOnboarded: false },
  reducers: {
    setHasOnboarded: (state, action) => { state.hasOnboarded = action.payload; },
  },
});

export const { setHasOnboarded } = appSlice.actions;
export default appSlice.reducer;