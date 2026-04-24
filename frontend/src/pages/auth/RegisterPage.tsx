import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle, Shield } from "lucide-react";
import { register } from "@/services/authService";
import CustomShield from "@/components/CustomShield";

const BRAND_CYAN = "#06b6d4";

const ParticleCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let rafId: number;
    type P = { x: number; y: number; vx: number; vy: number; size: number };
    let particles: P[] = [];
    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = Array.from({ length: 55 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 1.5 + 0.5,
      }));
    };
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = BRAND_CYAN;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x, dy = p.y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.globalAlpha = 0.07 * (1 - d / 110);
            ctx.strokeStyle = BRAND_CYAN;
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
          }
        }
      });
      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(animate);
    };
    init(); animate();
    const onResize = () => init();
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ background: "#0a0a0f" }} />;
};

type PolicyRule = { label: string; test: (p: string) => boolean };
const PASSWORD_POLICY: PolicyRule[] = [
  { label: "At least 8 characters", test: p => p.length >= 8 },
  { label: "One uppercase letter", test: p => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: p => /[a-z]/.test(p) },
  { label: "One number", test: p => /[0-9]/.test(p) },
  { label: "One special character (!@#$%^&*)", test: p => /[!@#$%^&*]/.test(p) },
];

type FocusMap = { name: boolean; email: boolean; phone: boolean; password: boolean; confirm: boolean };

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPolicy, setShowPolicy] = useState(false);
  const [focused, setFocused] = useState<FocusMap>({ name: false, email: false, phone: false, password: false, confirm: false });

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));
  const allPolicyMet = PASSWORD_POLICY.every(r => r.test(form.password));
  const passwordsMatch = form.password === form.confirmPassword && form.confirmPassword !== "";

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
      const msg = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setError(msg);
    } finally { setLoading(false); }
  };

  const inputStyle = (field: keyof FocusMap) => ({
    background: focused[field] ? "rgba(6,182,212,0.04)" : "rgba(255,255,255,0.02)",
    border: `1px solid ${focused[field] ? "rgba(6,182,212,0.4)" : "rgba(6,182,212,0.1)"}`,
    boxShadow: focused[field] ? "0 0 20px rgba(6,182,212,0.06)" : "none",
    caretColor: BRAND_CYAN,
  });

  const setFocus = (field: keyof FocusMap, val: boolean) =>
    setFocused(f => ({ ...f, [field]: val }));

  const policyPassed = PASSWORD_POLICY.filter(r => r.test(form.password)).length;
  const policyPct = (policyPassed / PASSWORD_POLICY.length) * 100;
  const strengthColor = policyPct <= 40 ? "#ef4444" : policyPct <= 80 ? "#f59e0b" : "#22c55e";
  const strengthLabel = policyPct <= 40 ? "WEAK" : policyPct <= 80 ? "MODERATE" : "STRONG";

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10 relative overflow-hidden">
      <ParticleCanvas />

      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none z-[1]"
        style={{ background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.025) 2px,rgba(0,0,0,0.025) 4px)" }} />

      {/* Grid */}
      <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.015]"
        style={{ backgroundImage: "linear-gradient(rgba(6,182,212,1) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,1) 1px,transparent 1px)", backgroundSize: "80px 80px" }} />

      <div className="fixed top-6 left-6 z-10 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
        <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">ENLISTMENT_PORTAL</span>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center gap-3 mb-7"
        >
          <motion.div
            animate={{ rotate: [0, 5, 0, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-cyan-500/25 blur-xl rounded-full" />
            <CustomShield className="text-cyan-400 w-10 h-10 relative z-10" strokeWidth={1.5} />
          </motion.div>
          <div className="flex flex-col">
            <div className="flex items-baseline">
              <span className="text-3xl font-black tracking-tighter text-white uppercase">PHISH</span>
              <span className="text-3xl font-black tracking-tighter text-cyan-400 uppercase">PULSE</span>
            </div>
            <div className="flex items-center gap-1.5 -mt-0.5">
              <div className="w-1 h-1 rounded-full bg-cyan-500 shadow-[0_0_5px_#06b6d4]" />
              <span className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-600">OPERATOR_ENLISTMENT</span>
            </div>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: "rgba(11,15,21,0.92)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(6,182,212,0.12)",
            boxShadow: "0 0 80px rgba(0,0,0,0.7), 0 0 40px rgba(6,182,212,0.05)",
          }}
        >
          <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

          <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-cyan-500/25 rounded-tl" />
          <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-cyan-500/25 rounded-tr" />
          <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-cyan-500/25 rounded-bl" />
          <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-cyan-500/25 rounded-br" />

          <div className="px-8 py-8">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={11} className="text-cyan-500/60" />
                <span className="text-[9px] font-black text-cyan-600/60 uppercase tracking-[0.3em]">NEW_OPERATIVE_REGISTRATION</span>
              </div>
              <h1 className="text-[22px] font-black text-white uppercase tracking-tight">Enlist as Operator</h1>
              <p className="text-[11px] text-slate-700 mt-1 font-mono">Join the cyber defense network</p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="mb-5 px-4 py-3 rounded-xl text-[11px] font-mono flex items-start gap-2"
                  style={{ background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.2)", color: "#f87171" }}>
                  <span className="text-red-500 mt-0.5 flex-shrink-0">⚠</span>
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Full Name</label>
                <input type="text" value={form.name} onChange={e => update("name", e.target.value)}
                  placeholder="John Doe" required
                  onFocus={() => setFocus("name", true)} onBlur={() => setFocus("name", false)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all duration-200 font-mono placeholder:text-slate-800"
                  style={inputStyle("name")} />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Email Address</label>
                <input type="email" value={form.email} onChange={e => update("email", e.target.value)}
                  placeholder="operator@phishpulse.io" required
                  onFocus={() => setFocus("email", true)} onBlur={() => setFocus("email", false)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all duration-200 font-mono placeholder:text-slate-800"
                  style={inputStyle("email")} />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Phone Number</label>
                  <span className="text-[8px] font-black text-cyan-600/60 border border-cyan-500/15 px-1.5 py-0.5 rounded uppercase tracking-widest">2FA_REQUIRED</span>
                </div>
                <input type="tel" value={form.phone} onChange={e => update("phone", e.target.value)}
                  placeholder="+91 9876543210" required
                  onFocus={() => setFocus("phone", true)} onBlur={() => setFocus("phone", false)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all duration-200 font-mono placeholder:text-slate-800"
                  style={inputStyle("phone")} />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={form.password}
                    onChange={e => { update("password", e.target.value); setShowPolicy(true); }}
                    placeholder="••••••••••••" required
                    onFocus={() => { setFocus("password", true); setShowPolicy(true); }}
                    onBlur={() => setFocus("password", false)}
                    className="w-full px-4 py-3 pr-12 rounded-xl text-sm text-white outline-none transition-all duration-200 font-mono placeholder:text-slate-800"
                    style={inputStyle("password")} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-700 hover:text-cyan-400 transition-colors">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {/* Strength bar */}
                {form.password && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 bg-slate-900 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${policyPct}%` }}
                        transition={{ duration: 0.4 }}
                        className="h-full rounded-full"
                        style={{ background: strengthColor, boxShadow: `0 0 8px ${strengthColor}50` }}
                      />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: strengthColor }}>
                      {strengthLabel}
                    </span>
                  </div>
                )}

                {/* Policy checklist */}
                <AnimatePresence>
                  {showPolicy && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 grid grid-cols-1 gap-1 px-3 py-2 rounded-lg"
                      style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.04)" }}>
                      {PASSWORD_POLICY.map(rule => {
                        const passed = rule.test(form.password);
                        return (
                          <div key={rule.label} className="flex items-center gap-2">
                            {passed
                              ? <CheckCircle2 size={11} className="text-green-500 flex-shrink-0" />
                              : <XCircle size={11} className="text-slate-700 flex-shrink-0" />}
                            <span className={`text-[10px] font-mono ${passed ? "text-green-500" : "text-slate-700"}`}>
                              {rule.label}
                            </span>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Confirm Password</label>
                <div className="relative">
                  <input type={showConfirm ? "text" : "password"} value={form.confirmPassword}
                    onChange={e => update("confirmPassword", e.target.value)}
                    placeholder="••••••••••••" required
                    onFocus={() => setFocus("confirm", true)} onBlur={() => setFocus("confirm", false)}
                    className="w-full px-4 py-3 pr-12 rounded-xl text-sm text-white outline-none transition-all duration-200 font-mono placeholder:text-slate-800"
                    style={{
                      ...inputStyle("confirm"),
                      borderColor: form.confirmPassword
                        ? passwordsMatch ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"
                        : focused.confirm ? "rgba(6,182,212,0.4)" : "rgba(6,182,212,0.1)",
                    }} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-700 hover:text-cyan-400 transition-colors">
                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {form.confirmPassword && (
                  <p className={`text-[10px] font-mono flex items-center gap-1 ${passwordsMatch ? "text-green-500" : "text-red-500"}`}>
                    {passwordsMatch
                      ? <><CheckCircle2 size={10} /> PASSWORDS_MATCH</>
                      : <><XCircle size={10} /> MISMATCH_DETECTED</>}
                  </p>
                )}
              </div>

              {/* Terms */}
              <button type="button" onClick={() => setAgreed(!agreed)}
                className="flex items-start gap-3 group w-full text-left mt-1">
                <div className="w-4 h-4 mt-0.5 rounded flex items-center justify-center transition-all duration-200 flex-shrink-0"
                  style={{
                    background: agreed ? "#06b6d4" : "transparent",
                    border: `1px solid ${agreed ? "#06b6d4" : "rgba(6,182,212,0.25)"}`,
                    boxShadow: agreed ? "0 0 12px rgba(6,182,212,0.5)" : "none",
                  }}>
                  {agreed && (
                    <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <span className="text-[10px] font-mono text-slate-700 group-hover:text-slate-500 transition-colors leading-relaxed">
                  I agree to the{" "}
                  <span className="text-cyan-600 hover:text-cyan-400 cursor-pointer">Terms & Conditions</span>
                  {" "}and{" "}
                  <span className="text-cyan-600 hover:text-cyan-400 cursor-pointer">Privacy Policy</span>
                </span>
              </button>

              {/* Submit */}
              <motion.button type="submit" disabled={loading}
                whileHover={{ scale: 1.01, boxShadow: "0 0 40px rgba(6,182,212,0.3)" }}
                whileTap={{ scale: 0.99 }}
                className="mt-2 py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.3em] text-white flex items-center justify-center gap-2 transition-all relative overflow-hidden"
                style={{
                  background: "transparent",
                  border: "1.5px solid rgba(6,182,212,0.5)",
                  boxShadow: "0 0 20px rgba(6,182,212,0.1)",
                }}>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0"
                  style={{ animation: "shimmer 3s infinite linear" }} />
                {loading
                  ? <><Loader2 size={13} className="animate-spin" />PROCESSING ENLISTMENT...</>
                  : <><span className="text-cyan-400 font-mono">›_</span>CREATE OPERATOR ACCOUNT</>}
              </motion.button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.7)]" />
                <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">END-TO-END ENCRYPTED</span>
              </div>
              <p className="text-[10px] text-slate-700 font-mono">
                Have access?{" "}
                <Link to="/auth/login" className="text-cyan-500 hover:text-cyan-300 transition-colors font-black uppercase tracking-wide">
                  SIGN IN
                </Link>
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent" />
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="text-center text-[9px] text-slate-900 uppercase tracking-[0.3em] font-mono mt-5">
          PHISHPULSE © 2026 // CLASSIFIED_INFRASTRUCTURE
        </motion.p>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(250%) skewX(-20deg); }
        }
      `}</style>
    </div>
  );
}