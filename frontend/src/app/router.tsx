import { createBrowserRouter, Navigate } from "react-router-dom";
import HubPage from "@/pages/HubPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import TwoFactorPage from "@/pages/auth/TwoFactorPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export const router = createBrowserRouter([
  // Public routes
  { path: "/", element: <HubPage /> },
  { path: "/auth/login", element: <LoginPage /> },
  { path: "/auth/register", element: <RegisterPage /> },
  { path: "/auth/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/auth/reset-password", element: <ResetPasswordPage /> },
  { path: "/auth/2fa", element: <TwoFactorPage /> },
  
  // Protected routes
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/vault",
    element: (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
          <p className="text-white text-xl">Vault Realm - Coming Soon</p>
        </div>
      </ProtectedRoute>
    ),
  },
  {
    path: "/incident",
    element: (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
          <p className="text-white text-xl">Incident Gate - Coming Soon</p>
        </div>
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
          <p className="text-white text-xl">Profile - Coming Soon</p>
        </div>
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
          <p className="text-white text-xl">Settings - Coming Soon</p>
        </div>
      </ProtectedRoute>
    ),
  },
  
  // Catch-all redirect
  { path: "*", element: <Navigate to="/" replace /> },
]);