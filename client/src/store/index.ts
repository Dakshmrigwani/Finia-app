import { configureStore } from '@reduxjs/toolkit';
import appReducer from './Slices/appSlice';
import authReducer from './Slices/authSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
