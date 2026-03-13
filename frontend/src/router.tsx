import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import TwoFactorPage from "@/pages/auth/TwoFactorPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import CTFPage from "@/pages/ctf/CTFPage";
import LeaderboardPage from "@/pages/leaderboard/LeaderboardPage";
import HubPage from "@/pages/HubPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HubPage />,
  },
  {
    path: "/auth/login",
    element: <LoginPage />,
  },
  {
    path: "/auth/register",
    element: <RegisterPage />,
  },
  {
    path: "/auth/2fa",
    element: <TwoFactorPage />,
  },
  {
    path: "/auth/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/auth/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },
  {
    path: "/ctf",
    element: <CTFPage />,
  },
  {
    path: "/leaderboard",
    element: <LeaderboardPage />,
  },
  {
    path: "/vault-realm",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/incident-gate",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/settings",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/profile",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/profile/titles",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/profile/stats",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/notifications",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "*",
    element: <Navigate to="/auth/login" replace />,
  },
]);

export default router;