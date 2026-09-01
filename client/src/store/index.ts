import { configureStore } from '@reduxjs/toolkit';
import appReducer from './Slices/appSlice';
import authReducer from './Slices/authSlice';
import onboardingReducer from './Slices/onboardingSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    onboarding: onboardingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
