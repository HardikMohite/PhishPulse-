import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { register } from "@/services/authService";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" },
  }),
};

type PolicyRule = { label: string; test: (p: string) => boolean };

const PASSWORD_POLICY: PolicyRule[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
  { label: "One special character (!@#$%^&*)", test: (p) => /[!@#$%^&*]/.test(p) },
];

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPolicy, setShowPolicy] = useState(false);

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const allPolicyMet = PASSWORD_POLICY.every((r) => r.test(form.password));
  const passwordsMatch = form.password === form.confirmPassword && form.confirmPassword !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!allPolicyMet) return setError("Password does not meet all requirements.");
    if (!passwordsMatch) return setError("Passwords do not match.");
    if (!agreed) return setError("Please accept the Terms & Conditions.");
    setLoading(true);
    try {
      const data = await register(form);
      navigate("/auth/2fa", { state: { userId: data.userId, phone: form.phone, from: "register" } });
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(6,182,212,0.2)",
    caretColor: "#06b6d4",
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10" style={{ background: "#0a0a0f" }}>
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
        <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
        <p className="text-sm mb-6" style={{ color: "#64748b" }}>Join the cyber defense platform</p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm"
            style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", color: "#f87171" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Full Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: "#94a3b8" }}>Full name</label>
            <input
              type="text" value={form.name} onChange={(e) => update("name", e.target.value)}
              placeholder="John Doe" required
              className="px-4 py-3 rounded-lg text-sm text-white outline-none"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "rgba(6,182,212,0.6)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(6,182,212,0.2)")}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: "#94a3b8" }}>Email address</label>
            <input
              type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
              placeholder="you@company.com" required
              className="px-4 py-3 rounded-lg text-sm text-white outline-none"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "rgba(6,182,212,0.6)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(6,182,212,0.2)")}
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: "#94a3b8" }}>Phone number (for 2FA)</label>
            <input
              type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)}
              placeholder="+91 9876543210" required
              className="px-4 py-3 rounded-lg text-sm text-white outline-none"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "rgba(6,182,212,0.6)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(6,182,212,0.2)")}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: "#94a3b8" }}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => { update("password", e.target.value); setShowPolicy(true); }}
                placeholder="••••••••" required
                className="w-full px-4 py-3 pr-11 rounded-lg text-sm text-white outline-none"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "rgba(6,182,212,0.6)"; setShowPolicy(true); }}
                onBlur={(e) => (e.target.style.borderColor = "rgba(6,182,212,0.2)")}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password Policy */}
            {showPolicy && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-2 flex flex-col gap-1 px-1"
              >
                {PASSWORD_POLICY.map((rule) => {
                  const passed = rule.test(form.password);
                  return (
                    <div key={rule.label} className="flex items-center gap-2">
                      {passed
                        ? <CheckCircle2 size={13} style={{ color: "#22c55e" }} />
                        : <XCircle size={13} style={{ color: "#ef4444" }} />}
                      <span className="text-xs" style={{ color: passed ? "#22c55e" : "#ef4444" }}>
                        {rule.label}
                      </span>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: "#94a3b8" }}>Confirm password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)}
                placeholder="••••••••" required
                className="w-full px-4 py-3 pr-11 rounded-lg text-sm text-white outline-none"
                style={{
                  ...inputStyle,
                  borderColor: form.confirmPassword
                    ? passwordsMatch ? "rgba(34,197,94,0.5)" : "rgba(239,68,68,0.5)"
                    : "rgba(6,182,212,0.2)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(6,182,212,0.6)")}
                onBlur={(e) => {
                  e.target.style.borderColor = form.confirmPassword
                    ? passwordsMatch ? "rgba(34,197,94,0.5)" : "rgba(239,68,68,0.5)"
                    : "rgba(6,182,212,0.2)";
                }}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }}>
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.confirmPassword && !passwordsMatch && (
              <p className="text-xs mt-1" style={{ color: "#ef4444" }}>Passwords do not match</p>
            )}
            {form.confirmPassword && passwordsMatch && (
              <p className="text-xs mt-1" style={{ color: "#22c55e" }}>Passwords match</p>
            )}
          </div>

          {/* Terms */}
          <label className="flex items-start gap-2 cursor-pointer select-none">
            <div onClick={() => setAgreed(!agreed)}
              className="w-4 h-4 mt-0.5 rounded flex items-center justify-center flex-shrink-0 transition-all"
              style={{ background: agreed ? "#06b6d4" : "transparent", border: `1px solid ${agreed ? "#06b6d4" : "rgba(6,182,212,0.4)"}` }}>
              {agreed && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </div>
            <span className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>
              I agree to the{" "}
              <span style={{ color: "#06b6d4", cursor: "pointer" }}>Terms & Conditions</span>
              {" "}and{" "}
              <span style={{ color: "#06b6d4", cursor: "pointer" }}>Privacy Policy</span>
            </span>
          </label>

          <motion.button
            type="submit" disabled={loading}
            className="mt-2 py-3 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: "transparent", border: "2px solid #06b6d4", boxShadow: "0 0 20px rgba(6,182,212,0.3)", cursor: "pointer" }}
            whileHover={{ boxShadow: "0 0 30px rgba(6,182,212,0.5)", scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Creating account..." : "Create Account"}
          </motion.button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: "#475569" }}>
          Already have an account?{" "}
          <Link to="/auth/login" style={{ color: "#06b6d4" }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}