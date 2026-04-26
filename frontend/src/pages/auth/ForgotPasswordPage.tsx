import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail, ArrowLeft, ShieldCheck, RefreshCw } from "lucide-react";
import { forgotPasswordOtp, verifyResetOtp } from "@/services/authService";
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

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;
const OTP_EXPIRY = 10 * 60;

type Step = "email" | "otp";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");

  // Email step
  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  // OTP step — mirrors TwoFactorPage exactly
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [expiryTimer, setExpiryTimer] = useState(OTP_EXPIRY);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend cooldown
  useEffect(() => {
    if (step !== "otp") return;
    const t = setInterval(() => setResendTimer((v) => { if (v <= 1) { clearInterval(t); return 0; } return v - 1; }), 1000);
    return () => clearInterval(t);
  }, [step]);

  // Expiry countdown
  useEffect(() => {
    if (step !== "otp") return;
    const t = setInterval(() => setExpiryTimer((v) => { if (v <= 1) { clearInterval(t); return 0; } return v - 1; }), 1000);
    return () => clearInterval(t);
  }, [step]);

  // Focus first input when OTP step mounts
  useEffect(() => {
    if (step === "otp") setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, [step]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // ── Send OTP ────────────────────────────────────────────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setEmailLoading(true);
    try {
      await forgotPasswordOtp({ email });
      setStep("otp");
    } catch (err: unknown) {
      setEmailError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  // ── OTP input handlers (identical to TwoFactorPage) ────────
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setOtpError("");
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

  // ── Verify OTP → redirect to reset password ────────────────
  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) return setOtpError("Please enter the complete 6-digit code.");
    if (expiryTimer <= 0) return setOtpError("Code has expired. Please request a new one.");
    setOtpError("");
    setOtpLoading(true);
    try {
      const data = await verifyResetOtp({ email, code });
      navigate(`/auth/reset-password?token=${data.reset_token}`, { replace: true });
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : "Invalid code. Please try again.");
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Resend ─────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendTimer > 0) return;
    setResending(true);
    setOtpError("");
    try {
      await forgotPasswordOtp({ email });
      setResendTimer(RESEND_COOLDOWN);
      setExpiryTimer(OTP_EXPIRY);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, "$1•••$3");

  return (
    <>
      <style>{autofillFix}</style>
      <div className="min-h-screen flex" style={{ background: "#0b0e13" }}>

      {/* ── LEFT PANEL ─────────────────────────────────────── */}
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
            width: 480, height: 480, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)",
            top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          }}
        />
        <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
          <div className="flex items-center gap-3 mb-16">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400/20 blur-lg rounded-full" />
              <CustomShield className="text-cyan-400 relative z-10" size={44} strokeWidth={1.7} />
            </div>
            <span className="text-3xl font-extrabold text-white tracking-tight">PhishPulse</span>
          </div>

          <AnimatePresence mode="wait">
            {step === "email" ? (
              <motion.div key="left-email" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4 }}>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8"
                  style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)" }}
                >
                  <Mail size={40} className="text-cyan-400" strokeWidth={1.5} />
                </motion.div>
                <h1 className="text-5xl font-extrabold text-white leading-tight mb-4" style={{ letterSpacing: "-0.02em" }}>
                  Forgot your<br /><span style={{ color: "#06b6d4" }}>password?</span>
                </h1>
                <p className="text-slate-400 text-base leading-relaxed max-w-sm">
                  Enter your email and we'll send a 6-digit verification code to your inbox.
                </p>
              </motion.div>
            ) : (
              <motion.div key="left-otp" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4 }}>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8"
                  style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)" }}
                >
                  <ShieldCheck size={40} className="text-cyan-400" strokeWidth={1.5} />
                </motion.div>
                <h1 className="text-5xl font-extrabold text-white leading-tight mb-4" style={{ letterSpacing: "-0.02em" }}>
                  Two-factor<br /><span style={{ color: "#06b6d4" }}>authentication</span>
                </h1>
                <p className="text-slate-400 text-base leading-relaxed max-w-sm">
                  An extra layer of security ensures only you can reset your password.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── RIGHT PANEL ────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12" style={{ background: "#0b0e13" }}>
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

          <AnimatePresence mode="wait">

            {/* ── STEP 1: EMAIL ─────────────────────────────── */}
            {step === "email" && (
              <motion.div key="step-email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
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
                  <Mail size={28} className="text-cyan-400" strokeWidth={1.5} />
                </div>

                <h2 className="text-3xl font-bold text-white mb-1">Reset password</h2>
                <p className="text-slate-500 text-sm mb-8">
                  Enter your email and we'll send a verification code.
                </p>

                <AnimatePresence>
                  {emailError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mb-5 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
                      style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
                    >
                      <span className="mt-0.5">⚠</span><span>{emailError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleEmailSubmit} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                      <input
                        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com" required autoComplete="email"
                        className="w-full pl-10 pr-4 py-3 rounded-lg text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-600"
                        style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", caretColor: "#06b6d4" }}
                        onFocus={(e) => (e.target.style.borderColor = "rgba(6,182,212,0.5)")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit" disabled={emailLoading}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    className="w-full py-3.5 rounded-lg text-sm font-semibold text-black flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: emailLoading ? "rgba(6,182,212,0.5)" : "#06b6d4",
                      boxShadow: emailLoading ? "none" : "0 0 32px rgba(6,182,212,0.35)",
                    }}
                  >
                    {emailLoading
                      ? <><Loader2 size={15} className="animate-spin" /> Sending code...</>
                      : "Send Verification Code"}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 2: OTP (mirrors TwoFactorPage exactly) ── */}
            {step === "otp" && (
              <motion.div key="step-otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <button
                  type="button"
                  onClick={() => { setStep("email"); setOtp(Array(OTP_LENGTH).fill("")); setOtpError(""); }}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-8"
                >
                  <ArrowLeft size={13} /> Back
                </button>

                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}
                >
                  <ShieldCheck size={28} className="text-cyan-400" strokeWidth={1.5} />
                </div>

                <h2 className="text-3xl font-bold text-white mb-1">Verify your identity</h2>
                <p className="text-slate-500 text-sm mb-1">
                  Enter the 6-digit code sent to{" "}
                  <span className="text-cyan-400">{maskedEmail}</span>
                </p>
                <p className="text-xs mb-8" style={{ color: expiryTimer < 60 ? "#ef4444" : "#475569" }}>
                  Code expires in{" "}
                  <span className="font-semibold">{formatTime(expiryTimer)}</span>
                </p>

                <AnimatePresence>
                  {otpError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mb-5 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
                      style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
                    >
                      <span className="mt-0.5 flex-shrink-0">⚠</span>
                      <span>{otpError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* OTP inputs — identical markup to TwoFactorPage */}
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

                {/* Verify button — identical to TwoFactorPage */}
                <motion.button
                  onClick={handleVerify}
                  disabled={otpLoading || otp.join("").length < OTP_LENGTH}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  className="w-full py-3.5 rounded-lg text-sm font-semibold text-black flex items-center justify-center gap-2 transition-all mb-5"
                  style={{
                    background: otpLoading ? "rgba(6,182,212,0.5)" : "#06b6d4",
                    boxShadow: otpLoading ? "none" : "0 0 32px rgba(6,182,212,0.35)",
                    opacity: otp.join("").length < OTP_LENGTH && !otpLoading ? 0.5 : 1,
                  }}
                >
                  {otpLoading
                    ? <><Loader2 size={15} className="animate-spin" /> Verifying...</>
                    : "Verify Code"}
                </motion.button>

                {/* Resend — identical to TwoFactorPage */}
                <div className="text-center">
                  {resendTimer > 0 ? (
                    <p className="text-xs text-slate-600">
                      Resend code in <span className="text-cyan-500">{resendTimer}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending}
                      className="inline-flex items-center gap-1.5 text-xs text-cyan-500 hover:text-cyan-300 transition-colors"
                    >
                      {resending ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                      {resending ? "Sending..." : "Resend code"}
                    </button>
                  )}
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );

    </>
  );
}