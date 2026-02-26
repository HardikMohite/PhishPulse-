import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Loader2, Eye, EyeOff } from "lucide-react";
import { login } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" },
  }),
};

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
      if (err instanceof Error) setError(err.message);
      else setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#0a0a0f" }}>
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="flex items-center gap-2 mb-8">
        <Shield size={24} className="text-cyan-400" strokeWidth={1.8} />
        <span className="text-xl font-semibold tracking-wide">
          <span className="text-white">Phish</span>
          <span className="text-cyan-400">Pulse</span>
        </span>
      </motion.div>

      <motion.div
        custom={1} variants={fadeUp} initial="hidden" animate="visible"
        className="w-full max-w-md rounded-xl p-8"
        style={{ background: "rgba(6,182,212,0.03)", border: "1px solid rgba(6,182,212,0.2)", boxShadow: "0 0 40px rgba(6,182,212,0.05)" }}
      >
        <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
        <p className="text-sm mb-6" style={{ color: "#64748b" }}>Sign in to your command center</p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm"
            style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", color: "#f87171" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: "#94a3b8" }}>Email address</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com" required
              className="px-4 py-3 rounded-lg text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(6,182,212,0.2)", caretColor: "#06b6d4" }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(6,182,212,0.6)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(6,182,212,0.2)")}
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium" style={{ color: "#94a3b8" }}>Password</label>
              <Link to="/auth/forgot-password" className="text-xs" style={{ color: "#06b6d4" }}>Forgot password?</Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full px-4 py-3 pr-11 rounded-lg text-sm text-white outline-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(6,182,212,0.2)", caretColor: "#06b6d4" }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(6,182,212,0.6)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(6,182,212,0.2)")}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div onClick={() => setRememberMe(!rememberMe)}
              className="w-4 h-4 rounded flex items-center justify-center transition-all"
              style={{ background: rememberMe ? "#06b6d4" : "transparent", border: `1px solid ${rememberMe ? "#06b6d4" : "rgba(6,182,212,0.4)"}` }}>
              {rememberMe && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </div>
            <span className="text-xs" style={{ color: "#94a3b8" }}>Remember me for 30 days</span>
          </label>

          <motion.button
            type="submit" disabled={loading}
            className="mt-2 py-3 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: "transparent", border: "2px solid #06b6d4", boxShadow: "0 0 20px rgba(6,182,212,0.3)", cursor: "pointer" }}
            whileHover={{ boxShadow: "0 0 30px rgba(6,182,212,0.5)", scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Signing in..." : "Sign In"}
          </motion.button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: "#475569" }}>
          Don't have an account?{" "}
          <Link to="/auth/register" style={{ color: "#06b6d4" }}>Register here</Link>
        </p>
      </motion.div>
    </div>
  );
}