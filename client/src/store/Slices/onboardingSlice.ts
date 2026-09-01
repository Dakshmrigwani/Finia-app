import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OnboardingState {
  motive: string | null;
  income: number | null;
  spendMostlyOn: string[];
  maritalStatus: string | null;
  dob: string | null;
}

const initialState: OnboardingState = {
  motive: null,
  income: null,
  spendMostlyOn: [],
  maritalStatus: null,
  dob: null,
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setMotive: (state, action: PayloadAction<string>) => {
      state.motive = action.payload;
    },
    setIncome: (state, action: PayloadAction<number>) => {
      state.income = action.payload;
    },
    setSpendMostlyOn: (state, action: PayloadAction<string[]>) => {
      state.spendMostlyOn = action.payload;
    },
    setMaritalStatus: (state, action: PayloadAction<string>) => {
      state.maritalStatus = action.payload;
    },
    setDob: (state, action: PayloadAction<string>) => {
      state.dob = action.payload;
    },
    resetOnboarding: () => initialState,
  },
});

export const {
  setMotive,
  setIncome,
  setSpendMostlyOn,
  setMaritalStatus,
  setDob,
  resetOnboarding,
} = onboardingSlice.actions;
export default onboardingSlice.reducer;
