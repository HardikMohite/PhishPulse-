import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  withCredentials: true, // send httpOnly cookies automatically
});

// Intercept responses to normalize errors
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.detail || err.message || "Something went wrong.";
    return Promise.reject(new Error(message));
  }
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface OtpPayload {
  userId: string;
  code: string;
}

export interface ResendOtpPayload {
  userId: string;
}

// ─── Auth API calls ───────────────────────────────────────────────────────────

export const login = async (payload: LoginPayload) => {
  const res = await API.post("/auth/login", {
    email: payload.email,
    password: payload.password,
    remember_me: payload.rememberMe,
  });
  return res.data; // { user, userId }
};

export const register = async (payload: RegisterPayload) => {
  const res = await API.post("/auth/register", {
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    password: payload.password,
  });
  return res.data; // { userId, phone, message }
};

export const verifyOtp = async (payload: OtpPayload) => {
  const res = await API.post("/auth/verify-otp", {
    user_id: payload.userId,
    code: payload.code,
  });
  return res.data;
};

export const resendOtp = async (payload: ResendOtpPayload) => {
  const res = await API.post("/auth/resend-otp", {
    user_id: payload.userId,
  });
  return res.data;
};

export const forgotPassword = async (email: string) => {
  const res = await API.post("/auth/forgot-password", { email });
  return res.data;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const res = await API.post("/auth/reset-password", {
    token,
    new_password: newPassword,
  });
  return res.data;
};

export const logout = async () => {
  const res = await API.post("/auth/logout");
  localStorage.removeItem("access_token"); // Clear any cached token
  return res.data;
};

export const getMe = async () => {
  const res = await API.get("/auth/me");
  return res.data;
};

// Helper to get access token from localStorage (if needed for manual requests)
export function getAccessToken(): string | null {
  return localStorage.getItem("access_token");
}