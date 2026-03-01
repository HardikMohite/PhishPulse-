import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { login } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import CustomShield from "@/components/CustomShield";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
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
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{ background: "#0a0a0f", fontFamily: "'Inter', sans-serif" }}
    >
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <CustomShield
            size={36}
            className="text-cyan-400"
            style={{ filter: "drop-shadow(0 0 8px #06b6d4)" }}
          />
          <div className="text-3xl font-bold tracking-tight">
            <span className="text-white">Phish</span>
            <span className="text-cyan-400">Pulse</span>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(15,23,42,0.6)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(6,182,212,0.2)",
            boxShadow: "0 0 40px rgba(6,182,212,0.1)",
          }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-sm text-slate-500">
              Sign in to your command center
            </p>
          </div>

          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-lg text-sm"
              style={{
                background: "rgba(220,38,38,0.1)",
                border: "1px solid rgba(220,38,38,0.3)",
                color: "#f87171",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="px-4 py-3 rounded-lg text-sm text-white outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(6,182,212,0.2)",
                  caretColor: "#06b6d4",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(6,182,212,0.6)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(6,182,212,0.2)")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-400">
                  Password
                </label>
                <Link
                  to="/auth/forgot-password"
                  className="text-xs text-cyan-400 hover:text-cyan-300"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-11 rounded-lg text-sm text-white outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(6,182,212,0.2)",
                    caretColor: "#06b6d4",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(6,182,212,0.6)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(6,182,212,0.2)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <div
                onClick={() => setRememberMe(!rememberMe)}
                className="w-4 h-4 rounded flex items-center justify-center transition-all"
                style={{
                  background: rememberMe ? "#06b6d4" : "transparent",
                  border: `1px solid ${
                    rememberMe ? "#06b6d4" : "rgba(6,182,212,0.4)"
                  }`,
                }}
              >
                {rememberMe && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>
              <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                Remember me for 30 days
              </span>
            </label>

            <motion.button
              type="submit"
              disabled={loading}
              className="mt-2 py-3 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all"
              style={{
                background: "transparent",
                border: "2px solid #06b6d4",
                boxShadow: "0 0 20px rgba(6,182,212,0.3)",
              }}
              whileHover={{
                boxShadow: "0 0 30px rgba(6,182,212,0.5)",
                scale: 1.01,
              }}
              whileTap={{ scale: 0.99 }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>

          <p className="text-center text-xs mt-6 text-slate-600">
            Don't have an account?{" "}
            <Link
              to="/auth/register"
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Register here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}