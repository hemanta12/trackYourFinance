// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk, createAction } from "@reduxjs/toolkit";
import axios from "axios";
import { isTokenValid } from "../utils/auth";

//////////////////////////////////////////
// 2. Action for Google login success
//////////////////////////////////////////
//
// Google flow is a redirect-based flow, so we typically just parse the token
// from the URL in a "callback" page. Then we dispatch googleLoginSuccess to
// store that token and name in the Redux state (and localStorage).
//

//////////////////////////////////////////
// 1. Async thunk for email/password login
//////////////////////////////////////////
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // Call your backend’s /login endpoint
      const response = await axios.post(
        // "http://localhost:49684/api/auth/login",
        "http://localhost:8080/api/auth/login",

        {
          email,
          password,
        }
      );
      return response.data;
    } catch (error) {
      // If your server returns an error message in error.response.data, use rejectWithValue
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: error.message });
    }
  }
);
export const googleLoginSuccess = createAction("auth/googleLoginSuccess");

// Retrieve token from localStorage
const storedToken = localStorage.getItem("token");

//////////////////////////////////////////
// 3. The slice
//////////////////////////////////////////
const initialState = {
  token: storedToken && isTokenValid(storedToken) ? storedToken : null,
  userName:
    storedToken && isTokenValid(storedToken)
      ? localStorage.getItem("userName")
      : "",
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.userName = "";
      state.error = null;
      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
    },
  },
  extraReducers: (builder) => {
    ///////////////////////
    // loginUser Thunk
    ///////////////////////
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token; // e.g. "abc123"
        state.userName = action.payload.name; // e.g. "Alice"
        // Save to localStorage
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("userName", action.payload.name);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Login failed";
      });

    ///////////////////////
    // googleLoginSuccess Action
    ///////////////////////
    builder.addCase(googleLoginSuccess, (state, action) => {
      const { token, name } = action.payload;
      state.token = token;
      state.userName = name;
      // Persist
      localStorage.setItem("token", token);
      localStorage.setItem("userName", name);
    });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
