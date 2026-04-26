import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { login } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import CustomShield from "@/components/CustomShield";

/* ── Kill browser autofill white-background override ───────────────────── */
const autofillFix = `
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 9999px #111827 inset !important;
    box-shadow: 0 0 0 9999px #111827 inset !important;
    -webkit-text-fill-color: #f1f5f9 !important;
    caret-color: #06b6d4 !important;
    border-color: rgba(255,255,255,0.08) !important;
    transition: background-color 99999s ease-in-out 0s;
  }
`;

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
  "Gamified Phishing Awareness Training",
  "100 Vault Lessons Across 20 Threat Types",
  "Live Incident Simulations & SOC Mode",
  "XP, Badges & Certifications System",
];

export default function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login({ email, password, rememberMe });
      setUser(data.user);
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{autofillFix}</style>
      <div className="min-h-screen flex" style={{ background: "#0b0e13" }}>

        {/* ── LEFT PANEL ── */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:flex flex-col items-center justify-center px-12 relative overflow-hidden"
          style={{ width: "52%", background: "#0d1117" }}
        >
          <GridBg />
          <div
            className="absolute pointer-events-none"
            style={{
              width: 500, height: 500, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(6,182,212,0.13) 0%, transparent 70%)",
              top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            }}
          />

          <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
            {/* Logo — larger, centred */}
            <div className="flex items-center gap-3 mb-14">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-400/25 blur-xl rounded-full" />
                <CustomShield className="text-cyan-400 relative z-10" size={44} strokeWidth={1.7} />
              </div>
              <span className="text-3xl font-extrabold text-white tracking-tight">PhishPulse</span>
            </div>

            {/* Hero text */}
            <h1 className="text-5xl font-extrabold text-white leading-tight mb-5" style={{ letterSpacing: "-0.02em" }}>
              Train smarter.<br />
              <span style={{ color: "#06b6d4" }}>Fight phishing.</span>
            </h1>
            <p className="text-slate-400 text-base mb-12 leading-relaxed">
              Train your instincts, spot every threat. Level up your security awareness through real-world simulations.
            </p>

            {/* Feature list */}
            <ul className="flex flex-col gap-4 w-full text-left">
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

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 flex items-center justify-center px-6 py-12" style={{ background: "#0b0e13" }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm"
          >
            {/* Mobile logo */}
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <CustomShield className="text-cyan-400" size={30} strokeWidth={1.8} />
              <span className="text-xl font-bold text-white">PhishPulse</span>
            </div>

            <h2 className="text-3xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-slate-500 text-sm mb-8">Sign in to your account to continue.</p>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mb-5 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
                >
                  <span className="mt-0.5">⚠</span><span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Email address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10" />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com" required autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 rounded-lg text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-600"
                    style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", caretColor: "#06b6d4" }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(6,182,212,0.6)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Password</label>
                  <Link to="/auth/forgot-password" className="text-xs text-cyan-500 hover:text-cyan-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10" />
                  <input
                    type={showPassword ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" required autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-3 rounded-lg text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-600"
                    style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", caretColor: "#06b6d4" }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(6,182,212,0.6)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <button type="button" onClick={() => setRememberMe(!rememberMe)} className="flex items-center gap-2.5 w-fit group">
                <div
                  className="w-4 h-4 rounded flex items-center justify-center transition-all duration-200 flex-shrink-0"
                  style={{ background: rememberMe ? "#06b6d4" : "transparent", border: `1.5px solid ${rememberMe ? "#06b6d4" : "rgba(255,255,255,0.15)"}` }}
                >
                  {rememberMe && (
                    <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">Keep me signed in for 30 days</span>
              </button>

              {/* Submit */}
              <motion.button
                type="submit" disabled={loading}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                className="mt-1 py-3.5 rounded-lg text-sm font-semibold text-black flex items-center justify-center gap-2 transition-all"
                style={{ background: loading ? "rgba(6,182,212,0.5)" : "#06b6d4", boxShadow: loading ? "none" : "0 0 32px rgba(6,182,212,0.3)" }}
              >
                {loading ? <><Loader2 size={15} className="animate-spin" /> Signing in...</> : <>Sign In <ArrowRight size={15} /></>}
              </motion.button>
            </form>

            <p className="text-center text-sm text-slate-600 mt-7">
              Don't have an account?{" "}
              <Link to="/auth/register" className="text-cyan-500 hover:text-cyan-300 font-medium transition-colors">Create one</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}