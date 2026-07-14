import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  tokens: string | null;
  groups: string | null;
  userId: number | null;
  username: string | null;
}

const initialState: AuthState = {
  tokens: null,
  groups: null,
  userId: null,
  username: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthData: (state, action: PayloadAction<{ tokens: string; groups: string; userId: number; username: string }>) => {
      state.tokens = action.payload.tokens;
      state.groups = action.payload.groups;
      state.userId = action.payload.userId;
      state.username = action.payload.username
    },
    clearAuthData: (state) => {
      state.tokens = null;
      state.groups = null;
      state.userId = null;
      state.username = null;
    },
  },
});

export const { setAuthData, clearAuthData } = authSlice.actions;

export default authSlice.reducer;
