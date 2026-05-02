import api from './api';

const AUTH_ENDPOINTS = {
  REGISTER: 'auth/register',
  LOGIN: 'auth/login',
  VERIFY_OTP: 'auth/verify-otp',
  RESEND_OTP: 'auth/resend-otp',
  LOGOUT: 'auth/logout',
  ME: 'auth/me',
  FORGOT_PASSWORD: 'auth/forgot-password',
  FORGOT_PASSWORD_OTP: 'auth/forgot-password-otp',
  VERIFY_RESET_OTP: 'auth/verify-reset-otp',
  RESET_PASSWORD: 'auth/reset-password',
} as const;

export interface RegisterData { name: string; email: string; password: string; phone: string; }
export interface LoginData { email: string; password: string; rememberMe?: boolean; }
export interface VerifyOtpData { userId: string; code: string; }
export interface ResendOtpData { userId: string; }
export interface ForgotPasswordData { email: string; }
export interface ResetPasswordData { token: string; password: string; }



export const register = async (data: RegisterData) => {
  const response = await api.post(AUTH_ENDPOINTS.REGISTER, data);
  return response.data;
};

export const login = async (data: LoginData) => {
  const response = await api.post(AUTH_ENDPOINTS.LOGIN, {
    email: data.email, password: data.password, remember_me: data.rememberMe ?? false,
  });
  return response.data;
};

export const verifyOtp = async (data: VerifyOtpData) => {
  const response = await api.post(AUTH_ENDPOINTS.VERIFY_OTP, {
    user_id: data.userId, code: data.code,
  });
  return response.data;
};

export const verify2FA = verifyOtp;

export const resendOtp = async (data: ResendOtpData) => {
  const response = await api.post(AUTH_ENDPOINTS.RESEND_OTP, { user_id: data.userId });
  return response.data;
};

export const logout = async () => {
  try {
    await api.post(AUTH_ENDPOINTS.LOGOUT);
  } finally {
    // Clear the persisted user from Zustand store + localStorage
    // The httpOnly cookie is cleared server-side by the logout endpoint
    const { clearUser } = (await import('@/store/authStore')).useAuthStore.getState();
    clearUser();
  }
};

export const getMe = async () => {
  const response = await api.get(AUTH_ENDPOINTS.ME);
  return response.data;
};

export const checkAuth = async () => {
  try { const response = await getMe(); return { authenticated: true, user: response }; }
  catch { return { authenticated: false, user: null }; }
};

export const forgotPassword = async (data: ForgotPasswordData) => {
  const response = await api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, data);
  return response.data;
};

export const forgotPasswordOtp = async (data: ForgotPasswordData) => {
  const response = await api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD_OTP, data);
  return response.data;
};

export const verifyResetOtp = async (data: { email: string; code: string }) => {
  const response = await api.post(AUTH_ENDPOINTS.VERIFY_RESET_OTP, data);
  return response.data;
};

export const resetPassword = async (data: ResetPasswordData) => {
  const response = await api.post(AUTH_ENDPOINTS.RESET_PASSWORD, {
    token: data.token, new_password: data.password,
  });
  return response.data;
};

export const updateAvatar = async (
  avatarSeed: string, 
  avatarStyle: string
) => {
  // Using AUTH_ENDPOINTS.ME ('auth/me') instead of '/users/me' to match the backend
  const response = await api.patch(AUTH_ENDPOINTS.ME, { 
    avatar_seed: avatarSeed, 
    avatar_style: avatarStyle 
  });
  return response.data;
};