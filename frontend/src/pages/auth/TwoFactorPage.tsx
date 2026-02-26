import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Loader2 } from "lucide-react";
import { verifyOtp, resendOtp } from "@/services/authService";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" },
  }),
};

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;
const OTP_EXPIRY = 5 * 60; // 5 minutes in seconds

export default function TwoFactorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, phone, from } = (location.state as { userId: string; phone: string; from: string }) || {};

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [expiryTimer, setExpiryTimer] = useState(OTP_EXPIRY);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((v) => v - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  // OTP expiry timer
  useEffect(() => {
    if (expiryTimer <= 0) return;
    const t = setInterval(() => setExpiryTimer((v) => v - 1), 1000);
    return () => clearInterval(t);
  }, [expiryTimer]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) return setError("Please enter the complete 6-digit code.");
    if (expiryTimer <= 0) return setError("OTP has expired. Please request a new one.");
    setError("");
    setLoading(true);
    try {
      await verifyOtp({ userId, code });
      navigate("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Invalid OTP. Please try again.");
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setResending(true);
    setError("");
    try {
      await resendOtp({ userId });
      setResendTimer(RESEND_COOLDOWN);
      setExpiryTimer(OTP_EXPIRY);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const maskedPhone = phone ? phone.replace(/(\d{2})\d+(\d{2})/, "$1•••••$2") : "your phone";

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
        <h1 className="text-2xl font-bold text-white mb-1">Verify your identity</h1>
        <p className="text-sm mb-1" style={{ color: "#64748b" }}>
          Enter the 6-digit code sent to <span style={{ color: "#06b6d4" }}>{maskedPhone}</span>
        </p>

        {/* Expiry timer */}
        <p className="text-xs mb-6" style={{ color: expiryTimer < 60 ? "#ef4444" : "#475569" }}>
          Code expires in {formatTime(expiryTimer)}
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm"
            style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", color: "#f87171" }}>
            {error}
          </div>
        )}

        {/* OTP inputs */}
        <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text" inputMode="numeric" maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-xl font-bold text-white rounded-lg outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${digit ? "rgba(6,182,212,0.6)" : "rgba(6,182,212,0.2)"}`,
                caretColor: "#06b6d4",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(6,182,212,0.8)")}
              onBlur={(e) => (e.target.style.borderColor = digit ? "rgba(6,182,212,0.6)" : "rgba(6,182,212,0.2)")}
            />
          ))}
        </div>

        {/* Verify button */}
        <motion.button
          onClick={handleVerify} disabled={loading}
          className="w-full py-3 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2"
          style={{ background: "transparent", border: "2px solid #06b6d4", boxShadow: "0 0 20px rgba(6,182,212,0.3)", cursor: "pointer" }}
          whileHover={{ boxShadow: "0 0 30px rgba(6,182,212,0.5)", scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Verifying..." : "Verify Code"}
        </motion.button>

        {/* Resend */}
        <div className="text-center mt-4">
          {resendTimer > 0 ? (
            <p className="text-xs" style={{ color: "#475569" }}>
              Resend code in <span style={{ color: "#06b6d4" }}>{resendTimer}s</span>
            </p>
          ) : (
            <button onClick={handleResend} disabled={resending}
              className="text-xs flex items-center gap-1 mx-auto"
              style={{ color: "#06b6d4", cursor: "pointer", background: "none", border: "none" }}>
              {resending && <Loader2 size={12} className="animate-spin" />}
              {resending ? "Sending..." : "Resend code"}
            </button>
          )}
        </div>

        {from === "register" && (
          <p className="text-center text-xs mt-4" style={{ color: "#475569" }}>
            Wrong number?{" "}
            <span className="cursor-pointer" style={{ color: "#06b6d4" }}
              onClick={() => navigate("/auth/register")}>
              Go back
            </span>
          </p>
        )}
      </motion.div>
    </div>
  );
}