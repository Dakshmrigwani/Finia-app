// src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: { token: null as string | null, user: null as any },
  reducers: {
    setToken: (state, action: PayloadAction<string>) => { state.token = action.payload; },
    setUser: (state, action) => { state.user = action.payload; },
    logout: (state) => { state.token = null; state.user = null; },
  },
});

export const { setToken, setUser, logout } = authSlice.actions;
export default authSlice.reducer;

