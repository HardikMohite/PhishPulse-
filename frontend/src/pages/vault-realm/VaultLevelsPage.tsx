import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle, ChevronRight, Zap, Star, ChevronUp,
  Shield, Lock, LockOpen, Play, MousePointer, Target, ArrowRight,
  Vault as VaultIcon,
} from "lucide-react";
import VaultCube from "@/components/VaultCube";
import Sidebar from "@/components/layout/Sidebar";
import StoreDrawer from "@/components/layout/StoreDrawer";
import { useAuthStore } from "@/store/authStore";
import { logout } from "@/services/authService";

// ── Vault data — fresh user: only vault 1 unlocked ───────────────────────────
const ROADMAP_LEVELS = [
  { id: 1, title: "Basic Email Phishing",    description: "Master the fundamentals of identifying suspicious emails, spoofed senders, and deceptive subject lines designed to trick employees.",  difficulty: "Beginner",     status: "unlocked", xpReward: 100, coinsReward: 50,  pos: { top: "38%", left: "12%" }, connectTo: 2, tag: "EMAIL"       },
  { id: 2, title: "Spear Phishing",          description: "Identify fraudulent login pages designed to steal credentials. Learn URL inspection, visual spoofing, and domain tricks.",            difficulty: "Intermediate", status: "locked",   xpReward: 150, coinsReward: 75,  pos: { top: "62%", left: "24%" }, connectTo: 3, tag: "CREDENTIAL"  },
  { id: 3, title: "Link Manipulation",       description: "Recognise targeted URL manipulation attacks. Decode homograph attacks, punycode domains, and redirect chains.",                      difficulty: "Advanced",     status: "locked",   xpReward: 250, coinsReward: 100, pos: { top: "38%", left: "36%" }, connectTo: 4, tag: "URL ANALYSIS" },
  { id: 4, title: "Smishing — SMS Phishing", description: "Safely handle and identify dangerous mobile phishing attacks delivered via text message and in-app notifications.",                  difficulty: "Intermediate", status: "locked",   xpReward: 300, coinsReward: 150, pos: { top: "62%", left: "48%" }, connectTo: 5, tag: "MOBILE"      },
  { id: 5, title: "CEO Fraud / Whaling",     description: "Defend against complex multi-stage social engineering targeting C-suite executives and financial teams.",                            difficulty: "Expert",       status: "locked",   xpReward: 500, coinsReward: 250, pos: { top: "38%", left: "60%" }, connectTo: null, tag: "EXECUTIVE"  },
] as const;

const TOTAL     = ROADMAP_LEVELS.length;
const DONE      = ROADMAP_LEVELS.filter(v => v.status === "unlocked").length;
const PROG_PCT  = Math.round((DONE / TOTAL) * 100);

const diffColor = (d: string) => {
  if (d === "Beginner")     return { fg: "#22c55e", bg: "rgba(34,197,94,0.1)",   bd: "rgba(34,197,94,0.25)"  };
  if (d === "Intermediate") return { fg: "#f59e0b", bg: "rgba(245,158,11,0.1)", bd: "rgba(245,158,11,0.25)" };
  if (d === "Advanced")     return { fg: "#f97316", bg: "rgba(249,115,22,0.1)", bd: "rgba(249,115,22,0.25)" };
  if (d === "Expert")       return { fg: "#ef4444", bg: "rgba(239,68,68,0.1)",  bd: "rgba(239,68,68,0.25)"  };
  return                           { fg: "#94a3b8", bg: "rgba(148,163,184,0.1)", bd: "rgba(148,163,184,0.25)" };
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function VaultLevelsPage() {
  const navigate = useNavigate();
  const { user, clearUser } = useAuthStore();
  const [selectedVault, setSelectedVault] = useState<number | null>(1);
  const [showHelp, setShowHelp]           = useState(false);
  const [isStoreOpen, setIsStoreOpen]     = useState(false);

  const handleLogout = async () => {
    try { await logout(); } catch {}
    clearUser();
    navigate("/auth/login");
  };

  const sel = ROADMAP_LEVELS.find(v => v.id === selectedVault) ?? null;

  const drawLine = (
    a: (typeof ROADMAP_LEVELS)[number],
    b: (typeof ROADMAP_LEVELS)[number],
    active: boolean
  ) => (
    <line
      x1={a.pos.left} y1={a.pos.top}
      x2={b.pos.left} y2={b.pos.top}
      stroke={active ? "#06b6d4" : "rgba(6,182,212,0.12)"}
      strokeWidth={active ? "2.5" : "1.5"}
      strokeDasharray={active ? undefined : "7 7"}
      style={{ filter: active ? "drop-shadow(0 0 6px rgba(6,182,212,0.7))" : "none" }}
    />
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-200 flex overflow-hidden">

      {/* ── Sidebar ── */}
      <Sidebar activeTab="vault" onStoreClick={() => setIsStoreOpen(true)} onLogout={handleLogout} userName={user?.name ?? "Operator"} />

      {/* ── Main content ── */}
      <div className="flex-1 ml-16 transition-all duration-300 flex flex-col min-h-screen">

        {/* ── Top Header — matches Dashboard header style ── */}
        <header className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5 h-20 px-8 flex items-center justify-between">

          {/* Left — back button */}
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 group px-4 py-2 rounded-xl border border-white/5 bg-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all"
          >
            <ChevronRight size={14} className="text-cyan-500 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-cyan-400 transition-colors">Dashboard</span>
          </button>

          {/* Centre — title */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-1.5"
          >
            {/* HUD frame title */}
            <div className="relative flex items-center gap-3 px-8 py-2.5"
              style={{
                background: "rgba(6,182,212,0.04)",
                border: "1px solid rgba(6,182,212,0.2)",
                borderRadius: 12,
                boxShadow: "0 0 30px rgba(6,182,212,0.08), inset 0 0 20px rgba(6,182,212,0.03)",
              }}
            >
              {/* corner accents */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-500/60 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-500/60 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-500/60 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-500/60 rounded-br-lg" />
              {/* shimmer */}
              <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none opacity-40">
                <motion.div
                  animate={{ x: ["-120%", "220%"] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
                  className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent skew-x-12"
                />
              </div>
              <VaultIcon size={16} className="text-cyan-500 relative z-10" strokeWidth={1.5} />
              <h1 className="text-base font-black uppercase tracking-[0.35em] relative z-10"
                style={{ color: "#e2f8ff", textShadow: "0 0 20px rgba(6,182,212,0.4)" }}>
                Vault Realm
              </h1>
            </div>
            {/* progress sub-pill */}
            <div className="flex items-center gap-2.5 px-4 py-1 rounded-full"
              style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(6,182,212,0.12)" }}>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-600">VAULT {DONE}/{TOTAL}</span>
              <div className="w-20 h-1 bg-slate-900 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${PROG_PCT}%` }}
                  transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                  className="h-full rounded-full bg-cyan-500"
                  style={{ boxShadow: "0 0 6px rgba(6,182,212,0.7)" }}
                />
              </div>
              <span className="text-[9px] font-black text-slate-700">{PROG_PCT}%</span>
            </div>
          </motion.div>

          {/* Right — stat pills matching Dashboard's top-right style */}
          <motion.div
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="flex items-center gap-3"
          >
            {/* XP available */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/5 bg-white/5">
              <Zap size={13} className="text-cyan-400" />
              <div className="flex flex-col items-start leading-none">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Available XP</span>
                <span className="text-xs font-black text-white mt-0.5">
                  {ROADMAP_LEVELS.filter(v => v.status !== "locked").reduce((a, v) => a + v.xpReward, 0)}
                  <span className="text-cyan-500 ml-0.5 text-[10px]">XP</span>
                </span>
              </div>
            </div>
            {/* missions done */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/5 bg-white/5">
              <Star size={13} className="text-yellow-400" />
              <div className="flex flex-col items-start leading-none">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Missions</span>
                <span className="text-xs font-black text-white mt-0.5">
                  {DONE}<span className="text-slate-600 font-bold text-[10px]">/{TOTAL} Done</span>
                </span>
              </div>
            </div>
          </motion.div>
        </header>

        {/* ── Map area ── */}
        <div className="relative flex-1">

          {/* Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0" style={{
              backgroundImage: "linear-gradient(rgba(6,182,212,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.06) 1px,transparent 1px)",
              backgroundSize: "50px 50px",
            }} />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-transparent to-[#0a0a0f]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-transparent to-[#0a0a0f]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full opacity-10"
              style={{ background: "radial-gradient(ellipse, rgba(6,182,212,0.5) 0%, transparent 70%)" }} />
          </div>

          {/* SVG connector lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            {ROADMAP_LEVELS.map(node => {
              if (!node.connectTo) return null;
              const tgt = ROADMAP_LEVELS.find(n => n.id === node.connectTo);
              if (!tgt) return null;
              const active = node.status === "unlocked" && tgt.status === "unlocked";
              return <g key={`${node.id}-${tgt.id}`}>{drawLine(node, tgt, active)}</g>;
            })}
          </svg>

          {/* Vault cubes */}
          <div className="absolute inset-0 z-10">
            {ROADMAP_LEVELS.map(vault => (
              <motion.div
                key={vault.id}
                className="absolute"
                style={{
                  top: vault.pos.top,
                  left: vault.pos.left,
                  transform: "translate(-50%, -50%) scale(1.4)",
                  transformOrigin: "center center",
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1.4 }}
                transition={{ delay: 0.15 + vault.id * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                onMouseEnter={() => setSelectedVault(vault.id)}
                onMouseLeave={() => setSelectedVault(1)}
              >
                <VaultCube
                  id={vault.id}
                  title={vault.title}
                  status={vault.status as "locked" | "unlocked"}
                  top="0"
                  left="0"
                  selected={selectedVault === vault.id}
                  onClick={() => {
                    if (vault.status === "locked") return;
                    if (vault.id === 1) navigate("/vault01");
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* ── Right Detail Panel ── */}
          <AnimatePresence mode="wait">
            {sel && (
              <motion.div
                key={sel.id}
                initial={{ opacity: 0, x: 32, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-8 top-8 bottom-8 z-50 w-[300px] overflow-y-auto"
                style={{ scrollbarWidth: "none" }}
              >
                {/* card */}
                <div className="rounded-2xl overflow-hidden"
                  style={{
                    background: "rgba(13,17,23,0.96)",
                    border: sel.status === "locked"
                      ? "1px solid rgba(51,65,85,0.4)"
                      : "1px solid rgba(6,182,212,0.25)",
                    boxShadow: sel.status !== "locked"
                      ? "0 0 40px rgba(6,182,212,0.12), 0 20px 60px rgba(0,0,0,0.5)"
                      : "0 20px 60px rgba(0,0,0,0.4)",
                    backdropFilter: "blur(24px)",
                  }}
                >
                  {/* accent top bar */}
                  <div className="h-0.5 w-full" style={{
                    background: sel.status === "locked"
                      ? "rgba(51,65,85,0.5)"
                      : "linear-gradient(90deg, #06b6d4, #3b82f6, #06b6d4)",
                    backgroundSize: "200% 100%",
                    animation: sel.status !== "locked" ? "gradShift 3s linear infinite" : "none",
                  }} />

                  <div className="p-5">
                    {/* tag + title row */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded mb-2"
                          style={{ background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.15)" }}>
                          <div className="w-1 h-1 rounded-full bg-cyan-500" />
                          <span className="text-[8px] font-black text-cyan-500 uppercase tracking-[0.3em]">{sel.tag}</span>
                        </div>
                        <h2 className="text-sm font-black text-white leading-snug tracking-wide">{sel.title}</h2>
                      </div>
                      <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center" style={{
                        background: sel.status === "unlocked" ? "rgba(6,182,212,0.12)" : "rgba(51,65,85,0.2)",
                        border: `1px solid ${sel.status === "unlocked" ? "rgba(6,182,212,0.3)" : "rgba(51,65,85,0.3)"}`,
                      }}>
                        {sel.status === "unlocked" ? <Target size={14} className="text-cyan-400" />
                          : <Lock size={14} className="text-slate-600" />}
                      </div>
                    </div>

                    {/* description — styled like Dashboard text */}
                    <p className="text-xs text-slate-500 leading-relaxed mb-4 font-medium">{sel.description}</p>

                    {/* reward grid */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { label: "XP",    val: `+${sel.xpReward}`,    icon: Zap,    color: "#06b6d4" },
                        { label: "Coins", val: `+${sel.coinsReward}`, icon: Star,   color: "#f59e0b" },
                        { label: "Stage", val: `#${sel.id}`,          icon: Shield, color: "#a78bfa" },
                      ].map(({ label, val, icon: Icon, color }) => (
                        <div key={label}
                          className="rounded-xl p-2.5 flex flex-col items-center gap-1"
                          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}
                        >
                          <Icon size={11} style={{ color }} />
                          <span className="text-xs font-black text-white">{val}</span>
                          <span className="text-[8px] text-slate-700 uppercase tracking-wider font-bold">{label}</span>
                        </div>
                      ))}
                    </div>

                    {/* difficulty */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Difficulty</span>
                      {(() => { const s = diffColor(sel.difficulty); return (
                        <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                          style={{ color: s.fg, background: s.bg, border: `1px solid ${s.bd}` }}>
                          {sel.difficulty}
                        </span>
                      ); })()}
                    </div>

                    <div className="h-px mb-4" style={{ background: "rgba(255,255,255,0.04)" }} />

                    {/* CTA */}
                    <motion.button
                      whileHover={sel.status !== "locked" ? { scale: 1.02 } : {}}
                      whileTap={sel.status !== "locked" ? { scale: 0.98 } : {}}
                      disabled={sel.status === "locked"}
                      onClick={() => {
                        if (sel.status === "locked") return;
                        if (sel.id === 1) navigate("/vault01");
                        // future: else navigate(`/vault0${sel.id}`) when other vaults are built
                      }}
                      className="w-full py-3 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all"
                      style={
                        sel.status === "locked"
                          ? { background: "rgba(15,20,30,0.8)", color: "#334155", cursor: "not-allowed", border: "1px solid rgba(51,65,85,0.2)" }
                          : { background: "transparent", color: "#06b6d4", border: "1px solid #06b6d4", boxShadow: "0 0 18px rgba(6,182,212,0.2)" }
                      }
                    >
                      {sel.status === "locked"    && <Lock size={11} />}
                      {sel.status === "unlocked"  && <LockOpen size={11} />}
                      <span>
                        {sel.status === "locked" ? "Locked" : "Unlock Vault"}
                      </span>
                      {sel.status !== "locked" && <ArrowRight size={11} />}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>{/* end map area */}

        {/* ── Bottom bar ── */}
        <div className="relative z-30 border-t border-white/5 h-10 flex items-center justify-between px-8 bg-[#0a0a0f]/60 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
            <span className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-800">PHISHPULSE // VAULT_MAP_v2.1 // OPERATIONAL</span>
          </div>

          {/* Help button */}
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all"
            style={{
              borderColor: showHelp ? "rgba(6,182,212,0.4)" : "rgba(255,255,255,0.06)",
              background:  showHelp ? "rgba(6,182,212,0.06)" : "rgba(255,255,255,0.02)",
              color:       showHelp ? "#22d3ee" : "#475569",
            }}
          >
            <HelpCircle size={12} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Help</span>
            <motion.div animate={{ rotate: showHelp ? 0 : 180 }} transition={{ duration: 0.2 }}>
              <ChevronUp size={11} />
            </motion.div>
          </motion.button>
        </div>

        {/* Help tooltip */}
        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="fixed bottom-14 right-8 z-50 w-56 rounded-2xl overflow-hidden"
              style={{
                background: "rgba(13,17,23,0.97)",
                border: "1px solid rgba(6,182,212,0.15)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2"
                style={{ background: "rgba(6,182,212,0.04)" }}>
                <HelpCircle size={11} className="text-cyan-500" />
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-500">Navigation Guide</p>
              </div>
              <div className="px-4 py-3 space-y-2.5">
                {[
                  { icon: <MousePointer size={11} className="text-slate-500" />, text: "Hover a vault to preview details"    },
                  { icon: <Target      size={11} className="text-cyan-400"   />, text: "Cyan = available to start"           },
                  { icon: <Lock        size={11} className="text-slate-700"  />, text: "Dark = locked, finish previous first" },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      {icon}
                    </div>
                    <span className="text-[9px] text-slate-500 font-medium leading-tight">{text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>{/* end main */}

      <style>{`
        @keyframes gradShift {
          0%   { background-position: 0% 50%;   }
          100% { background-position: 200% 50%; }
        }
      `}</style>

      <StoreDrawer isOpen={isStoreOpen} onClose={() => setIsStoreOpen(false)} userCoins={user?.coins ?? 0} />
    </div>
  );
}