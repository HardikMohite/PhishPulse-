import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Loader2, Lock, CheckCircle2, XCircle,
  ArrowLeft, AlertCircle, ArrowRight,
} from "lucide-react";
import { resetPassword } from "@/services/authService";
import CustomShield from "@/components/CustomShield";

const GridBg = () => (
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      backgroundImage:
        "linear-gradient(rgba(6,182,212,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.07) 1px, transparent 1px)",
      backgroundSize: "60px 60px",
    }}
  />
);

const POLICY = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
];

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError("Invalid or missing reset token. Please request a new password reset link.");
    }
  }, [token]);

  const policyPassed = POLICY.filter((r) => r.test(newPassword)).length;
  const policyPct = (policyPassed / POLICY.length) * 100;
  const strengthColor = policyPct <= 50 ? "#ef4444" : policyPct <= 75 ? "#f59e0b" : "#22c55e";
  const strengthLabel = policyPct <= 50 ? "Weak" : policyPct <= 75 ? "Moderate" : "Strong";
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!newPassword || !confirmPassword) return setError("Please fill in all fields.");
    if (!POLICY.every((r) => r.test(newPassword))) return setError("Password does not meet all requirements.");
    if (!passwordsMatch) return setError("Passwords do not match.");
    if (!token) return setError("Invalid reset token.");

    setLoading(true);
    try {
      await resetPassword({ token, password: newPassword });
      setSuccess(true);
      setTimeout(() => navigate("/auth/login"), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password. The link may have expired.");
      setTokenValid(false);
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    caretColor: "#06b6d4",
  } as React.CSSProperties;

  // ── Invalid token state ──
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#0b0e13" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-10">
            <CustomShield className="text-cyan-400" size={28} strokeWidth={1.8} />
            <span className="text-lg font-bold text-white">PhishPulse</span>
          </div>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
          >
            <AlertCircle size={32} className="text-red-400" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Invalid Reset Link</h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            {error || "This password reset link is invalid or has expired."}
          </p>
          <motion.button
            onClick={() => navigate("/auth/forgot-password")}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            className="w-full py-3.5 rounded-lg text-sm font-semibold text-black transition-all"
            style={{ background: "#06b6d4", boxShadow: "0 0 32px rgba(6,182,212,0.35)" }}
          >
            Request New Link
          </motion.button>
          <Link to="/auth/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mt-6">
            <ArrowLeft size={13} /> Back to sign in
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Success state ──
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#0b0e13" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-10">
            <CustomShield className="text-cyan-400" size={28} strokeWidth={1.8} />
            <span className="text-lg font-bold text-white">PhishPulse</span>
          </div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}
          >
            <CheckCircle2 size={32} className="text-green-400" strokeWidth={1.5} />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Password reset!</h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            Your password has been updated. Redirecting you to sign in&hellip;
          </p>
          <motion.button
            onClick={() => navigate("/auth/login")}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            className="w-full py-3.5 rounded-lg text-sm font-semibold text-black transition-all"
            style={{ background: "#06b6d4", boxShadow: "0 0 32px rgba(6,182,212,0.35)" }}
          >
            Go to Sign In
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ── Main form ──
  return (
    <div className="min-h-screen flex" style={{ background: "#0b0e13" }}>
      {/* LEFT PANEL */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex flex-col justify-center px-16 relative overflow-hidden"
        style={{ width: "52%", background: "#0d1117" }}
      >
        <GridBg />
        <div
          className="absolute pointer-events-none"
          style={{
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)",
            top: "50%",
            left: "30%",
            transform: "translate(-50%, -50%)",
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400/20 blur-lg rounded-full" />
              <CustomShield className="text-cyan-400 relative z-10" size={34} strokeWidth={1.8} />
            </div>
            <span className="text-xl font-bold text-white tracking-wide">PhishPulse</span>
          </div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8"
            style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)" }}
          >
            <Lock size={40} className="text-cyan-400" strokeWidth={1.5} />
          </motion.div>

          <h1
            className="text-5xl font-extrabold text-white leading-tight mb-4"
            style={{ letterSpacing: "-0.02em" }}
          >
            Set a new
            <br />
            <span style={{ color: "#06b6d4" }}>password</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            Choose a strong password to protect your account. Make sure it's at least 8 characters and includes a mix of letters and numbers.
          </p>
        </div>
      </motion.div>

      {/* RIGHT PANEL */}
      <div
        className="flex-1 flex items-center justify-center px-6 py-12"
        style={{ background: "#0b0e13" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <CustomShield className="text-cyan-400" size={28} strokeWidth={1.8} />
            <span className="text-lg font-bold text-white">PhishPulse</span>
          </div>

          <Link
            to="/auth/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-8"
          >
            <ArrowLeft size={13} /> Back to sign in
          </Link>

          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}
          >
            <Lock size={28} className="text-cyan-400" strokeWidth={1.5} />
          </div>

          <h2 className="text-3xl font-bold text-white mb-1">New password</h2>
          <p className="text-slate-500 text-sm mb-8">Choose a strong password for your account.</p>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-5 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
              >
                <span className="mt-0.5 flex-shrink-0">⚠</span>
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* New password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                New password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                <input
                  type={showNew ? "text" : "password"} value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••" required disabled={loading}
                  className="w-full pl-10 pr-11 py-3 rounded-lg text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-700"
                  style={fieldStyle}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(6,182,212,0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Strength bar */}
              {newPassword && (
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${policyPct}%` }} transition={{ duration: 0.4 }}
                      className="h-full rounded-full"
                      style={{ background: strengthColor }}
                    />
                  </div>
                  <span className="text-xs font-medium" style={{ color: strengthColor }}>{strengthLabel}</span>
                </div>
              )}

              {/* Policy checklist */}
              {newPassword && (
                <div className="mt-1.5 grid grid-cols-1 gap-1 px-3 py-2.5 rounded-lg"
                  style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  {POLICY.map((rule) => {
                    const passed = rule.test(newPassword);
                    return (
                      <div key={rule.label} className="flex items-center gap-2">
                        {passed
                          ? <CheckCircle2 size={11} className="text-green-500 flex-shrink-0" />
                          : <XCircle size={11} className="text-slate-700 flex-shrink-0" />}
                        <span className={`text-xs ${passed ? "text-green-400" : "text-slate-600"}`}>{rule.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Confirm password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                <input
                  type={showConfirm ? "text" : "password"} value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" required disabled={loading}
                  className="w-full pl-10 pr-11 py-3 rounded-lg text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-700"
                  style={{
                    ...fieldStyle,
                    borderColor: confirmPassword
                      ? passwordsMatch ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"
                      : "rgba(255,255,255,0.08)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(6,182,212,0.5)")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = confirmPassword
                      ? passwordsMatch ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"
                      : "rgba(255,255,255,0.08)")}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {confirmPassword && (
                <p className={`text-xs flex items-center gap-1 ${passwordsMatch ? "text-green-400" : "text-red-400"}`}>
                  {passwordsMatch
                    ? <><CheckCircle2 size={11} /> Passwords match</>
                    : <><XCircle size={11} /> Passwords do not match</>}
                </p>
              )}
            </div>

            {/* Submit */}
            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="py-3.5 rounded-lg text-sm font-semibold text-black flex items-center justify-center gap-2 transition-all"
              style={{
                background: loading ? "rgba(6,182,212,0.5)" : "#06b6d4",
                boxShadow: loading ? "none" : "0 0 32px rgba(6,182,212,0.35)",
              }}
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Resetting password...</>
                : <>Reset Password <ArrowRight size={15} /></>}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}