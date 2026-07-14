import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slice/AuthSlice'; // Import the authSlice

export const store = configureStore({
  reducer: {
    auth: authReducer, // Add the auth slice to the store
  },
});
export default store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
