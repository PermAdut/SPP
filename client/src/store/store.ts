import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slices/userSlice'
import authReducer from './slices/authSlice'
import taskReducer from './slices/taskSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    auth: authReducer,
    task: taskReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch