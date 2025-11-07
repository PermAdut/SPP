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
    if (response.refreshToken) {
      localStorage.setItem("refreshToken", response.refreshToken);
    }
    return response;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      localStorage.removeItem("refreshToken");
      import("../../services/socket.service").then((module) => {
        module.default.disconnect();
      });
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
