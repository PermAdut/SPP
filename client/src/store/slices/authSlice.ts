import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { gql } from "@apollo/client";
import type { AuthResponse, LoginCredentials } from "../../api/auth.api";
import { client } from "../../graphql/apollo-client";
import { LOGIN, REFRESH_TOKEN } from "../../graphql/queries/auth";

export interface AuthState {
  isAuth: boolean;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
}

// Функция для проверки валидности токена
const checkTokenValidity = async (): Promise<boolean> => {
  const token = localStorage.getItem("accessToken");
  if (!token) return false;

  try {
    // Проверяем токен через специальный HTTP endpoint
    const response = await fetch('http://localhost:3000/api/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data.valid === true;
  } catch (error) {
    // Если токен не валиден, очищаем его
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return false;
  }
};

const initialAuthState: AuthState = {
  isAuth: false, // Будет проверено асинхронно
  isLoading: false,
  error: null,
  initialized: false,
};

export const initializeAuth = createAsyncThunk<
  boolean,
  void,
  { rejectValue: string }
>("auth/initialize", async (_, { rejectWithValue }) => {
  try {
    const isValid = await checkTokenValidity();
    console.log('Token validity check:', isValid);
    return isValid;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to check token");
  }
});

export const loginUser = createAsyncThunk<
  AuthResponse,
  LoginCredentials,
  { rejectValue: string }
>("auth/login", async (credentials: LoginCredentials, { rejectWithValue }) => {
  try {
    console.log('Attempting login with:', credentials);
    const { data, errors } = await client.mutate({
      mutation: LOGIN,
      variables: { input: credentials },
    });
    console.log('Login response:', { data, errors });
    if (data?.login) {
      localStorage.setItem("accessToken", data.login.accessToken);
      localStorage.setItem("refreshToken", data.login.refreshToken);
      console.log('Login successful, token saved');
      return data.login;
    } else {
      throw new Error('Login failed - no data received');
    }
  } catch (err: any) {
    console.error('Login error:', err);
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
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isAuth = action.payload;
        state.isLoading = false;
        state.initialized = true;
        console.log('Auth initialized, isAuth:', action.payload);
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isAuth = false;
        state.isLoading = false;
        state.initialized = true;
        console.log('Auth initialization failed');
      })
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
        state.initialized = false;
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.error = null;
        state.isLoading = false;
        state.isAuth = true;
        state.initialized = true;
        console.log('Login fulfilled, user authenticated');
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
        state.initialized = true;
        console.log('Login rejected:', action.payload);
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.initialized = true;
        console.log('Login pending...');
      });
  },
});

export const { сlearErrors, logoutUser } = authSlice.actions;
export const authActions = authSlice.actions;

export default authSlice.reducer;
