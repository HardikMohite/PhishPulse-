import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import { verifyOtp, resendOtp } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
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

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;
const OTP_EXPIRY = 5 * 60;

export default function TwoFactorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuthStore();

  const stateData = (location.state as {
    sessionId?: string;
    userId?: string;
    phone?: string;
    email?: string;
    from?: string;
  }) || {};
  const { sessionId, userId, phone, email, from } = stateData;
  const identifierId = sessionId || userId;
  const isRegistration = from === "register";

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [expiryTimer, setExpiryTimer] = useState(OTP_EXPIRY);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!identifierId && !email) {
      navigate(isRegistration ? "/auth/register" : "/auth/login", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isRegistration) return;
    const t = setInterval(() => setResendTimer((v) => { if (v <= 1) { clearInterval(t); return 0; } return v - 1; }), 1000);
    return () => clearInterval(t);
  }, [isRegistration]);

  useEffect(() => {
    const t = setInterval(() => setExpiryTimer((v) => { if (v <= 1) { clearInterval(t); return 0; } return v - 1; }), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const next = [...otp];
    pasted.split("").forEach((char, i) => { next[i] = char; });
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) return setError("Please enter the complete 6-digit code.");
    if (expiryTimer <= 0) return setError("Code has expired. Please request a new one.");
    if (!identifierId) return setError("Session expired. Please try again.");
    setError("");
    setLoading(true);
    try {
      const data = await verifyOtp({ userId: identifierId, code });
      if (data?.user) setUser(data.user);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid code. Please try again.");
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || !identifierId) return;
    setResending(true);
    setError("");
    try {
      await resendOtp({ userId: identifierId });
      setResendTimer(RESEND_COOLDOWN);
      setExpiryTimer(OTP_EXPIRY);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  const maskedContact = email
    ? email.replace(/(.{2})(.*)(@.*)/, "$1•••$3")
    : phone
    ? phone.replace(/(\d{2})\d+(\d{2})/, "$1•••$2")
    : "your email";

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

          {/* 2FA illustration */}
          <div className="mb-10">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8"
              style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)" }}
            >
              <ShieldCheck size={40} className="text-cyan-400" strokeWidth={1.5} />
            </motion.div>
          </div>

          <h1
            className="text-5xl font-extrabold text-white leading-tight mb-4"
            style={{ letterSpacing: "-0.02em" }}
          >
            Two-factor
            <br />
            <span style={{ color: "#06b6d4" }}>authentication</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            An extra layer of security ensures only you can access your account — even if your password is compromised.
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

          {/* Back link */}
          <Link
            to={isRegistration ? "/auth/register" : "/auth/login"}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-8"
          >
            <ArrowLeft size={13} /> Back
          </Link>

          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}
          >
            <ShieldCheck size={28} className="text-cyan-400" strokeWidth={1.5} />
          </div>

          <h2 className="text-3xl font-bold text-white mb-1">Verify your identity</h2>
          <p className="text-slate-500 text-sm mb-1">
            Enter the 6-digit code sent to{" "}
            <span className="text-cyan-400">{maskedContact}</span>
          </p>
          <p className="text-xs mb-8" style={{ color: expiryTimer < 60 ? "#ef4444" : "#475569" }}>
            Code expires in{" "}
            <span className="font-semibold">{formatTime(expiryTimer)}</span>
          </p>

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

          {/* OTP inputs */}
          <div className="flex gap-3 justify-between mb-7" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text" inputMode="numeric" maxLength={1} value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="flex-1 h-14 text-center text-xl font-bold text-white rounded-lg outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1.5px solid ${digit ? "rgba(6,182,212,0.6)" : "rgba(255,255,255,0.08)"}`,
                  caretColor: "#06b6d4",
                  maxWidth: 48,
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(6,182,212,0.8)")}
                onBlur={(e) => (e.target.style.borderColor = digit ? "rgba(6,182,212,0.6)" : "rgba(255,255,255,0.08)")}
              />
            ))}
          </div>

          {/* Verify button */}
          <motion.button
            onClick={handleVerify} disabled={loading || otp.join("").length < OTP_LENGTH}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            className="w-full py-3.5 rounded-lg text-sm font-semibold text-black flex items-center justify-center gap-2 transition-all mb-5"
            style={{
              background: loading ? "rgba(6,182,212,0.5)" : "#06b6d4",
              boxShadow: loading ? "none" : "0 0 32px rgba(6,182,212,0.35)",
              opacity: otp.join("").length < OTP_LENGTH && !loading ? 0.5 : 1,
            }}
          >
            {loading ? <><Loader2 size={15} className="animate-spin" /> Verifying...</> : "Verify Code"}
          </motion.button>

          {/* Resend */}
          {isRegistration && (
            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-xs text-slate-600">
                  Resend code in <span className="text-cyan-500">{resendTimer}s</span>
                </p>
              ) : (
                <button
                  onClick={handleResend} disabled={resending}
                  className="inline-flex items-center gap-1.5 text-xs text-cyan-500 hover:text-cyan-300 transition-colors"
                >
                  {resending ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                  {resending ? "Sending..." : "Resend code"}
                </button>
              )}
            </div>
          )}

          {!isRegistration && (
            <p className="text-center text-xs text-slate-600 mt-2">
              Didn't receive a code?{" "}
              <span className="text-cyan-500 cursor-pointer hover:text-cyan-300 transition-colors"
                onClick={() => navigate("/auth/login")}>
                Try logging in again
              </span>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}