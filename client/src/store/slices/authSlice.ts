/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AuthResponse, LoginCredentials } from "../../api/auth.api";
import authApiInstance from "../../api/auth.api";

export interface AuthState {
  isAuth: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialAuthState: AuthState = {
  isAuth: localStorage.getItem("accessToken") ? true : false,
  isLoading: false,
  error: null,
};

export const loginUser = createAsyncThunk<
  AuthResponse,
  LoginCredentials,
  { rejectValue: string }
>("auth/login", async (credentials: LoginCredentials, { rejectWithValue }) => {
  try {
    const response = await authApiInstance.login(credentials);
    localStorage.setItem("accessToken", response.accessToken);
    // Подключаем Socket.IO после успешного логина
    const socketService = (await import("../../services/socket.service")).default;
    socketService.connect(response.accessToken);
    return response;
  } catch (err: any) {
    console.log(err);
    return rejectWithValue(err.message || "Failed to login");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    сlearErrors: (state) => {
      state.error = null;
    },
    logoutUser: (state) => {
      state.isAuth = false;
      state.error = null;
      state.isLoading = false;
      localStorage.removeItem("accessToken");
      // Отключаем Socket.IO при выходе
      import("../../services/socket.service").then((module) => {
        module.default.disconnect();
      });
      document.cookie
        .split(";")
        .forEach(
          (c) =>
            (document.cookie =
              c.replace(/^ +/, "").split("=")[0] + "=;Max-Age=-99999999;")
        );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state) => {
        state.error = null;
        state.isLoading = false;
        state.isAuth = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      });
  },
});

export const authActions = authSlice.actions;

export default authSlice.reducer;
