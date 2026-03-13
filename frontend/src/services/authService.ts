import api from './api';

// Auth API endpoints
const AUTH_ENDPOINTS = {
  REGISTER: 'auth/register',
  LOGIN: 'auth/login',
  VERIFY_2FA: 'auth/verify-otp',
  RESEND_OTP: 'auth/resend-otp',
  LOGOUT: 'auth/logout',
  ME: 'auth/me',
  FORGOT_PASSWORD: 'auth/forgot-password',
  RESET_PASSWORD: 'auth/reset-password',
} as const;

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface Verify2FAData {
  user_id: string;
  code: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export const register = async (data: RegisterData) => {
  const response = await api.post(AUTH_ENDPOINTS.REGISTER, data);
  return response.data;
};

export const login = async (data: LoginData) => {
  const response = await api.post(AUTH_ENDPOINTS.LOGIN, data);
  return response.data;
};

export const verify2FA = async (data: Verify2FAData) => {
  const response = await api.post(AUTH_ENDPOINTS.VERIFY_2FA, {
    user_id: data.user_id,
    code: data.code
  });

  if (response.data.access_token) {
    localStorage.setItem("token", response.data.access_token);
  }

  return response.data;
};

export const verifyOtp = verify2FA;

export const resendOtp = async (user_id: string) => {
  const response = await api.post(AUTH_ENDPOINTS.RESEND_OTP, { user_id });
  return response.data;
};

export const logout = async () => {
  try {
    await api.post(AUTH_ENDPOINTS.LOGOUT);
  } finally {
    localStorage.removeItem('token');
  }
};

export const getMe = async () => {
  const response = await api.get(AUTH_ENDPOINTS.ME);
  return response.data;
};

export const checkAuth = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { authenticated: false, user: null };
    }
    const user = await getMe();
    return { authenticated: true, user };
  } catch (error) {
    return { authenticated: false, user: null };
  }
};

export const forgotPassword = async (data: ForgotPasswordData) => {
  const response = await api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, data);
  return response.data;
};

export const resetPassword = async (data: ResetPasswordData) => {
  const response = await api.post(AUTH_ENDPOINTS.RESET_PASSWORD, data);
  return response.data;
};