import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import TwoFactorPage from "@/pages/auth/TwoFactorPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import CTFPage from "@/pages/ctf/CTFPage";
import LeaderboardPage from "@/pages/leaderboard/LeaderboardPage";
import HubPage from "@/pages/HubPage";
import VaultLevelsPage from "@/pages/vault-realm/VaultLevelsPage";
import ProfilePage from "@/pages/profile/ProfilePage";

// ── Vault 01 ──────────────────────────────────────────────────────────────────
import Vault01Page from "@/features/vault01/pages/Vault01Page";

// ── Incident Gate ────────────────────────────────────────────────────────────────────
import IncidentGatePage from "@/features/incidentGate/pages/IncidentGatePage";
import SimulationPlaceholderPage from "@/features/incidentGate/pages/SimulationPlaceholderPage";

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
    element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
  },
  {
    path: "/vault-realm",
    element: <ProtectedRoute><VaultLevelsPage /></ProtectedRoute>,
  },
  // ── Vault 01 — feature page (no separate App.tsx) ─────────────────────────
  {
    path: "/vault01",
    element: <ProtectedRoute><Vault01Page /></ProtectedRoute>,
  },
  {
    path: "/ctf",
    element: <ProtectedRoute><CTFPage /></ProtectedRoute>,
  },
  {
    path: "/leaderboard",
    element: <ProtectedRoute><LeaderboardPage /></ProtectedRoute>,
  },
  // ── Incident Gate ───────────────────────────────────────────────────────────────────
  {
    path: "/incident-gate",
    element: <ProtectedRoute><IncidentGatePage /></ProtectedRoute>,
  },
  {
    path: "/incident-gate/simulation",
    element: <ProtectedRoute><SimulationPlaceholderPage /></ProtectedRoute>,
  },
  {
    path: "/settings",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/profile",
    element: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
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
    element: <Navigate to="/" replace />,
  },
]);

export default router;
