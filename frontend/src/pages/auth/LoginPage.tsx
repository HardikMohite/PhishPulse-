import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Eye, EyeOff, Terminal, Shield } from "lucide-react";
import { login } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
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
      particles = Array.from({ length: 60 }, () => ({
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

export default function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore(s => s.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  useEffect(() => {
    const lines = [
      "PHISHPULSE_OS v4.2.1 — INITIALIZING...",
      "NEURAL_FIREWALL............ ACTIVE",
      "THREAT_MATRIX.............. LOADED",
      "AWAITING_OPERATOR_AUTH.....",
    ];
    let i = 0;
    const iv = setInterval(() => {
      if (i < lines.length) { setTerminalLines(prev => [...prev, lines[i]]); i++; }
      else clearInterval(iv);
    }, 320);
    return () => clearInterval(iv);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const data = await login({ email, password, rememberMe });
      setUser(data.user);
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials. Access denied.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <ParticleCanvas />

      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none z-[1]"
        style={{ background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.025) 2px,rgba(0,0,0,0.025) 4px)" }} />

      {/* Grid */}
      <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.015]"
        style={{ backgroundImage: "linear-gradient(rgba(6,182,212,1) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,1) 1px,transparent 1px)", backgroundSize: "80px 80px" }} />

      {/* Top-left status */}
      <div className="fixed top-6 left-6 z-10 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
        <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">SYS_ONLINE</span>
      </div>
      <div className="fixed top-6 right-6 z-10">
        <span className="text-[9px] font-black text-slate-800 uppercase tracking-[0.3em] font-mono">
          {new Date().toISOString().slice(0, 10)}
        </span>
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
              <span className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-600">DEFENSIVE_INTEL</span>
            </div>
          </div>
        </motion.div>

        {/* Terminal block */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="mb-5 px-4 py-3 rounded-xl font-mono"
          style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(6,182,212,0.07)" }}
        >
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/[0.04]">
            <Terminal size={10} className="text-cyan-600" />
            <span className="text-[9px] font-black text-cyan-700 uppercase tracking-widest">SYSTEM_BOOT_LOG</span>
          </div>
          {terminalLines.map((line, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
              className="text-[9px] text-slate-700 font-mono flex items-center gap-2">
              <span className="text-cyan-700">›</span>{line}
              {i === terminalLines.length - 1 && (
                <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-1 h-2.5 bg-cyan-500/60 ml-0.5" />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: "rgba(11,15,21,0.9)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(6,182,212,0.12)",
            boxShadow: "0 0 80px rgba(0,0,0,0.7), 0 0 40px rgba(6,182,212,0.05)",
          }}
        >
          <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

          {/* Corner brackets */}
          <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-cyan-500/25 rounded-tl" />
          <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-cyan-500/25 rounded-tr" />
          <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-cyan-500/25 rounded-bl" />
          <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-cyan-500/25 rounded-br" />

          <div className="px-8 py-8">
            <div className="mb-7">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={11} className="text-cyan-500/60" />
                <span className="text-[9px] font-black text-cyan-600/60 uppercase tracking-[0.3em]">OPERATOR_AUTH</span>
              </div>
              <h1 className="text-[22px] font-black text-white uppercase tracking-tight">Access Command Center</h1>
              <p className="text-[11px] text-slate-700 mt-1 font-mono">Authenticate to enter the defensive network</p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-5 px-4 py-3 rounded-xl text-[11px] font-mono flex items-start gap-2"
                  style={{ background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.2)", color: "#f87171" }}>
                  <span className="text-red-500 mt-0.5 flex-shrink-0">⚠</span>
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Email Address</label>
                  <span className="text-[8px] font-black bg-cyan-500/8 text-cyan-600/70 border border-cyan-500/15 px-1.5 py-0.5 rounded uppercase tracking-widest">REQUIRED</span>
                </div>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="operator@phishpulse.io" required
                  onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)}
                  className="w-full px-4 py-3.5 rounded-xl text-sm text-white outline-none transition-all duration-200 font-mono placeholder:text-slate-800"
                  style={{
                    background: emailFocused ? "rgba(6,182,212,0.04)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${emailFocused ? "rgba(6,182,212,0.4)" : "rgba(6,182,212,0.1)"}`,
                    boxShadow: emailFocused ? "0 0 20px rgba(6,182,212,0.06)" : "none",
                    caretColor: BRAND_CYAN,
                  }} />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Password</label>
                  <Link to="/auth/forgot-password"
                    className="text-[9px] font-black text-cyan-600/60 hover:text-cyan-400 transition-colors uppercase tracking-widest">
                    FORGOT_PASS?
                  </Link>
                </div>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••" required
                    onFocus={() => setPassFocused(true)} onBlur={() => setPassFocused(false)}
                    className="w-full px-4 py-3.5 pr-12 rounded-xl text-sm text-white outline-none transition-all duration-200 font-mono placeholder:text-slate-800"
                    style={{
                      background: passFocused ? "rgba(6,182,212,0.04)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${passFocused ? "rgba(6,182,212,0.4)" : "rgba(6,182,212,0.1)"}`,
                      boxShadow: passFocused ? "0 0 20px rgba(6,182,212,0.06)" : "none",
                      caretColor: BRAND_CYAN,
                    }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-700 hover:text-cyan-400 transition-colors">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <button type="button" onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center gap-3 group w-fit mt-1">
                <div className="w-4 h-4 rounded flex items-center justify-center transition-all duration-200 flex-shrink-0"
                  style={{
                    background: rememberMe ? "#06b6d4" : "transparent",
                    border: `1px solid ${rememberMe ? "#06b6d4" : "rgba(6,182,212,0.25)"}`,
                    boxShadow: rememberMe ? "0 0 12px rgba(6,182,212,0.5)" : "none",
                  }}>
                  {rememberMe && (
                    <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-700 group-hover:text-slate-500 transition-colors">
                  MAINTAIN SESSION (30 DAYS)
                </span>
              </button>

              {/* Submit */}
              <motion.button type="submit" disabled={loading}
                whileHover={{ scale: 1.01, boxShadow: "0 0 40px rgba(6,182,212,0.3)" }}
                whileTap={{ scale: 0.99 }}
                className="mt-3 py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.3em] text-white flex items-center justify-center gap-2 transition-all relative overflow-hidden"
                style={{
                  background: "transparent",
                  border: "1.5px solid rgba(6,182,212,0.5)",
                  boxShadow: "0 0 20px rgba(6,182,212,0.1)",
                }}>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0"
                  style={{ animation: "shimmer 3s infinite linear" }} />
                {loading
                  ? <><Loader2 size={13} className="animate-spin" />AUTHENTICATING...</>
                  : <><span className="text-cyan-400 font-mono">›_</span>INITIATE SESSION</>}
              </motion.button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.7)]" />
                <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">ENCRYPTED</span>
              </div>
              <p className="text-[10px] text-slate-700 font-mono">
                No account?{" "}
                <Link to="/auth/register" className="text-cyan-500 hover:text-cyan-300 transition-colors font-black uppercase tracking-wide">
                  ENLIST NOW
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