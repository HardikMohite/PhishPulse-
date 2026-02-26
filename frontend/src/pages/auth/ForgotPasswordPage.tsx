import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { forgotPassword } from "@/services/authService";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" },
  }),
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Something went wrong. Please try again.");
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
        {!sent ? (
          <>
            <Link to="/auth/login" className="flex items-center gap-1 text-xs mb-6 w-fit" style={{ color: "#64748b" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#06b6d4")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}>
              <ArrowLeft size={13} /> Back to login
            </Link>

            <h1 className="text-2xl font-bold text-white mb-1">Reset password</h1>
            <p className="text-sm mb-6" style={{ color: "#64748b" }}>
              Enter your email and we'll send you a reset link.
            </p>

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

              <motion.button
                type="submit" disabled={loading}
                className="mt-2 py-3 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: "transparent", border: "2px solid #06b6d4", boxShadow: "0 0 20px rgba(6,182,212,0.3)", cursor: "pointer" }}
                whileHover={{ boxShadow: "0 0 30px rgba(6,182,212,0.5)", scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Sending..." : "Send Reset Link"}
              </motion.button>
            </form>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center gap-4 py-4"
          >
            <div className="p-4 rounded-full" style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)" }}>
              <MailCheck size={32} style={{ color: "#06b6d4" }} strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold text-white">Check your inbox</h2>
            <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
              A password reset link has been sent to{" "}
              <span style={{ color: "#06b6d4" }}>{email}</span>.
              Check your inbox and follow the instructions.
            </p>
            <p className="text-xs" style={{ color: "#475569" }}>
              Didn't receive it?{" "}
              <span className="cursor-pointer" style={{ color: "#06b6d4" }} onClick={() => setSent(false)}>
                Try again
              </span>
            </p>
            <Link to="/auth/login"
              className="mt-2 text-xs flex items-center gap-1"
              style={{ color: "#64748b" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#06b6d4")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}>
              <ArrowLeft size={13} /> Back to login
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}