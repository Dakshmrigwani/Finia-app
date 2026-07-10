import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '../../api/auth.api';

type AuthState = {
  token: string | null;
  user: AuthUser | null;
};

const initialState: AuthState = {
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => { state.token = action.payload; },
    setUser: (state, action: PayloadAction<AuthUser>) => { state.user = action.payload; },
    logout: (state) => { state.token = null; state.user = null; },
  },
});

export const { setToken, setUser, logout } = authSlice.actions;
export default authSlice.reducer;

