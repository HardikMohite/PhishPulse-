import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import * as authService from "@/services/authService";
import CustomShield from "@/components/CustomShield";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  
  const token = searchParams.get("token");

  useEffect(() => {
    // Check if token exists
    if (!token) {
      setTokenValid(false);
      setError("Invalid or missing reset token. Please request a new password reset link.");
    }
  }, [token]);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.newPassword || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid reset token");
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword(token, formData.newPassword);
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/auth/login");
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to reset password. The link may have expired.");
      setTokenValid(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "" };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const labels = ["Weak", "Fair", "Good", "Strong", "Very Strong"];
    const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"];
    
    return {
      strength: (strength / 5) * 100,
      label: labels[strength - 1] || "",
      color: colors[strength - 1] || "",
    };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  if (!tokenValid && !success) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "#0a0a0f" }}
      >
        <div 
          className="max-w-md w-full p-8 rounded-lg border"
          style={{ 
            background: "rgba(20, 20, 30, 0.8)",
            borderColor: "#ef4444"
          }}
        >
          <div className="text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: "#ef4444" }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#ffffff" }}>
              Invalid Reset Link
            </h2>
            <p className="mb-6" style={{ color: "#9ca3af" }}>
              {error || "This password reset link is invalid or has expired."}
            </p>
            <button
              onClick={() => navigate("/auth/forgot-password")}
              className="w-full py-3 rounded-lg font-semibold transition-all"
              style={{
                background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
                color: "#ffffff"
              }}
            >
              Request New Reset Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "#0a0a0f" }}
      >
        <div 
          className="max-w-md w-full p-8 rounded-lg border"
          style={{ 
            background: "rgba(20, 20, 30, 0.8)",
            borderColor: "#10b981"
          }}
        >
          <div className="text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: "#10b981" }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#ffffff" }}>
              Password Reset Successful!
            </h2>
            <p className="mb-6" style={{ color: "#9ca3af" }}>
              Your password has been successfully reset. You will be redirected to the login page in a few seconds.
            </p>
            <button
              onClick={() => navigate("/auth/login")}
              className="w-full py-3 rounded-lg font-semibold transition-all"
              style={{
                background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
                color: "#ffffff"
              }}
            >
              Go to Login Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#0a0a0f" }}
    >
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)" }}
            >
              <Lock className="w-8 h-8" style={{ color: "#ffffff" }} />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#ffffff" }}>
            Reset Password
          </h1>
          <p style={{ color: "#9ca3af" }}>
            Enter your new password below
          </p>
        </div>

        {/* Form */}
        <div 
          className="p-8 rounded-lg border"
          style={{ 
            background: "rgba(20, 20, 30, 0.8)",
            borderColor: "#1f2937"
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div 
                className="p-4 rounded-lg flex items-start gap-3"
                style={{ background: "rgba(239, 68, 68, 0.1)", borderLeft: "3px solid #ef4444" }}
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#ef4444" }} />
                <p className="text-sm" style={{ color: "#fecaca" }}>{error}</p>
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#e5e7eb" }}>
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    background: "rgba(15, 15, 25, 0.9)",
                    borderColor: "#374151",
                    color: "#ffffff"
                  }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#9ca3af" }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "#1f2937" }}>
                    <div 
                      className="h-full transition-all duration-300"
                      style={{ 
                        width: `${passwordStrength.strength}%`,
                        background: passwordStrength.color
                      }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </p>
                </div>
              )}

              {/* Password Requirements */}
              <div className="mt-3 space-y-1">
                <p className="text-xs" style={{ color: "#9ca3af" }}>Password must contain:</p>
                <ul className="text-xs space-y-1" style={{ color: "#6b7280" }}>
                  <li className={formData.newPassword.length >= 8 ? "text-green-500" : ""}>
                    • At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(formData.newPassword) ? "text-green-500" : ""}>
                    • One uppercase letter
                  </li>
                  <li className={/[a-z]/.test(formData.newPassword) ? "text-green-500" : ""}>
                    • One lowercase letter
                  </li>
                  <li className={/[0-9]/.test(formData.newPassword) ? "text-green-500" : ""}>
                    • One number
                  </li>
                </ul>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#e5e7eb" }}>
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    background: "rgba(15, 15, 25, 0.9)",
                    borderColor: "#374151",
                    color: "#ffffff"
                  }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#9ca3af" }}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <p 
                  className="text-xs mt-2"
                  style={{ 
                    color: formData.newPassword === formData.confirmPassword ? "#10b981" : "#ef4444" 
                  }}
                >
                  {formData.newPassword === formData.confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: loading ? "#374151" : "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
                color: "#ffffff"
              }}
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/auth/login")}
              className="text-sm transition-colors"
              style={{ color: "#06b6d4" }}
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
