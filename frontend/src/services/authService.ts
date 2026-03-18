import api from './api';

// Auth API endpoints — must match backend /api/auth/...
const AUTH_ENDPOINTS = {
  REGISTER: 'auth/register',
  LOGIN: 'auth/login',
  VERIFY_OTP: 'auth/verify-otp',       // Fixed: was verify-2fa, backend has verify-otp
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

export interface VerifyOtpData {
  userId: string;   // accepts sessionId from registration flow
  code: string;
}

export interface ResendOtpData {
  userId: string;   // accepts sessionId from registration flow
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
  return response.data; // { sessionId, message }
};

export const login = async (data: LoginData) => {
  const response = await api.post(AUTH_ENDPOINTS.LOGIN, {
    email: data.email,
    password: data.password,
    remember_me: data.rememberMe ?? false,
  });
  return response.data; // { user, userId, message }
};

export const verifyOtp = async (data: VerifyOtpData) => {
  const response = await api.post(AUTH_ENDPOINTS.VERIFY_OTP, {
    user_id: data.userId,   // backend expects user_id (snake_case)
    code: data.code,
  });
  return response.data;
};

// Alias for backward compatibility
export const verify2FA = verifyOtp;

export const resendOtp = async (data: ResendOtpData) => {
  const response = await api.post(AUTH_ENDPOINTS.RESEND_OTP, {
    user_id: data.userId,   // backend expects user_id (snake_case)
  });
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
    const response = await getMe();
    return { authenticated: true, user: response };
  } catch {
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