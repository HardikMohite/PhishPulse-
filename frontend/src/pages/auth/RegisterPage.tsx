import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, Mail, Lock, User, Phone, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { register } from "@/services/authService";
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

const FEATURES = [
  "Batch Password Security Auditing",
  "AI-Powered Risk Forecasting",
  "Regulatory Compliance Scanning",
  "Enterprise Data Loss Prevention",
];

type PolicyRule = { label: string; test: (p: string) => boolean };
const PASSWORD_POLICY: PolicyRule[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
  { label: "One special character", test: (p) => /[!@#$%^&*]/.test(p) },
];

const inputBase =
  "w-full py-3 rounded-lg text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-700";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPolicy, setShowPolicy] = useState(false);

  const update = (field: string, val: string) => setForm((f) => ({ ...f, [field]: val }));

  const allPolicyMet = PASSWORD_POLICY.every((r) => r.test(form.password));
  const passwordsMatch = form.password === form.confirmPassword && form.confirmPassword !== "";
  const policyPassed = PASSWORD_POLICY.filter((r) => r.test(form.password)).length;
  const policyPct = (policyPassed / PASSWORD_POLICY.length) * 100;
  const strengthColor = policyPct <= 40 ? "#ef4444" : policyPct <= 80 ? "#f59e0b" : "#22c55e";
  const strengthLabel = policyPct <= 40 ? "Weak" : policyPct <= 80 ? "Moderate" : "Strong";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Please enter your full name.");
    if (!allPolicyMet) return setError("Password does not meet all requirements.");
    if (!passwordsMatch) return setError("Passwords do not match.");
    if (!agreed) return setError("Please accept the Terms & Conditions.");
    setLoading(true);
    try {
      const data = await register(form);
      navigate("/auth/2fa", { state: { sessionId: data.sessionId, email: form.email, from: "register" } });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    caretColor: "#06b6d4",
  } as React.CSSProperties;

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.target.style.borderColor = "rgba(6,182,212,0.5)");
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.target.style.borderColor = "rgba(255,255,255,0.08)");

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
          <h1
            className="text-5xl font-extrabold text-white leading-tight mb-4"
            style={{ letterSpacing: "-0.02em" }}
          >
            Protect your
            <br />
            <span style={{ color: "#06b6d4" }}>Identity</span> with AI.
          </h1>
          <p className="text-slate-400 text-base mb-12 leading-relaxed max-w-sm">
            Join thousands of enterprises defending against modern phishing threats.
          </p>
          <ul className="flex flex-col gap-4">
            {FEATURES.map((feat, i) => (
              <motion.li
                key={feat}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <div
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ border: "1.5px solid #06b6d4", background: "rgba(6,182,212,0.1)" }}
                >
                  <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="#06b6d4" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-slate-300 text-sm">{feat}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* RIGHT PANEL */}
      <div
        className="flex-1 flex items-center justify-center px-6 py-10"
        style={{ background: "#0b0e13" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <CustomShield className="text-cyan-400" size={28} strokeWidth={1.8} />
            <span className="text-lg font-bold text-white">PhishPulse</span>
          </div>

          <h2 className="text-3xl font-bold text-white mb-1">Create account</h2>
          <p className="text-slate-500 text-sm mb-7">Join the platform and start protecting your team.</p>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-5 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
              >
                <span className="mt-0.5 flex-shrink-0">⚠</span>
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Full name
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                <input
                  type="text" value={form.name} onChange={(e) => update("name", e.target.value)}
                  placeholder="John Doe" required
                  className={`${inputBase} pl-10 pr-4`} style={fieldStyle}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Email address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                <input
                  type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                  placeholder="name@company.com" required
                  className={`${inputBase} pl-10 pr-4`} style={fieldStyle}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Phone number
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                <input
                  type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)}
                  placeholder="+91 9876543210" required
                  className={`${inputBase} pl-10 pr-4`} style={fieldStyle}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"} value={form.password}
                  onChange={(e) => { update("password", e.target.value); setShowPolicy(true); }}
                  placeholder="••••••••" required
                  className={`${inputBase} pl-10 pr-11`} style={fieldStyle}
                  onFocus={(e) => { onFocus(e); setShowPolicy(true); }} onBlur={onBlur}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Strength bar */}
              {form.password && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${policyPct}%` }} transition={{ duration: 0.4 }}
                      className="h-full rounded-full"
                      style={{ background: strengthColor, boxShadow: `0 0 6px ${strengthColor}60` }}
                    />
                  </div>
                  <span className="text-xs font-medium" style={{ color: strengthColor }}>{strengthLabel}</span>
                </div>
              )}
              {/* Policy checklist */}
              <AnimatePresence>
                {showPolicy && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-1.5 grid grid-cols-1 gap-1 px-3 py-2.5 rounded-lg"
                    style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    {PASSWORD_POLICY.map((rule) => {
                      const passed = rule.test(form.password);
                      return (
                        <div key={rule.label} className="flex items-center gap-2">
                          {passed
                            ? <CheckCircle2 size={11} className="text-green-500 flex-shrink-0" />
                            : <XCircle size={11} className="text-slate-700 flex-shrink-0" />}
                          <span className={`text-xs ${passed ? "text-green-400" : "text-slate-600"}`}>{rule.label}</span>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Confirm password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                <input
                  type={showConfirm ? "text" : "password"} value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  placeholder="••••••••" required
                  className={`${inputBase} pl-10 pr-11`}
                  style={{
                    ...fieldStyle,
                    borderColor: form.confirmPassword
                      ? passwordsMatch ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"
                      : "rgba(255,255,255,0.08)",
                  }}
                  onFocus={onFocus} onBlur={onBlur}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.confirmPassword && (
                <p className={`text-xs flex items-center gap-1 ${passwordsMatch ? "text-green-400" : "text-red-400"}`}>
                  {passwordsMatch
                    ? <><CheckCircle2 size={11} /> Passwords match</>
                    : <><XCircle size={11} /> Passwords do not match</>}
                </p>
              )}
            </div>

            {/* Terms */}
            <button type="button" onClick={() => setAgreed(!agreed)}
              className="flex items-start gap-2.5 w-full text-left group">
              <div
                className="w-4 h-4 mt-0.5 rounded flex items-center justify-center transition-all duration-200 flex-shrink-0"
                style={{
                  background: agreed ? "#06b6d4" : "transparent",
                  border: `1.5px solid ${agreed ? "#06b6d4" : "rgba(255,255,255,0.15)"}`,
                }}
              >
                {agreed && (
                  <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors leading-relaxed">
                I agree to the{" "}
                <span className="text-cyan-500 hover:text-cyan-400 cursor-pointer">Terms & Conditions</span>
                {" "}and{" "}
                <span className="text-cyan-500 hover:text-cyan-400 cursor-pointer">Privacy Policy</span>
              </span>
            </button>

            {/* Submit */}
            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="mt-1 py-3.5 rounded-lg text-sm font-semibold text-black flex items-center justify-center gap-2 transition-all"
              style={{
                background: loading ? "rgba(6,182,212,0.5)" : "#06b6d4",
                boxShadow: loading ? "none" : "0 0 32px rgba(6,182,212,0.35)",
              }}
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Creating account...</>
                : <>Create Account <ArrowRight size={15} /></>}
            </motion.button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-7">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-cyan-500 hover:text-cyan-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}