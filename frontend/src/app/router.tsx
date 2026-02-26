import { createBrowserRouter } from "react-router-dom";
import HubPage from "@/pages/HubPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import TwoFactorPage from "@/pages/auth/TwoFactorPage";

export const router = createBrowserRouter([
  { path: "/", element: <HubPage /> },
  { path: "/auth/login", element: <LoginPage /> },
  { path: "/auth/register", element: <RegisterPage /> },
  { path: "/auth/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/auth/2fa", element: <TwoFactorPage /> },
  // dashboard and other routes will be added later
]);