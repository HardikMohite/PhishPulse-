import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trophy, Star, Flame, Crown, Loader2,
  LayoutDashboard, Vault as VaultIcon, AlertTriangle, Swords as SwordsIcon,
  TrophyIcon, ShoppingBag as ShoppingBagIcon, LockKeyhole, LogOut, ChevronRight,
} from "lucide-react";
import CustomShield from "@/components/CustomShield";
import { useAuthStore } from "@/store/authStore";
import { logout } from "@/services/authService";
import { getLeaderboard } from "@/services/ctfService";
import type { LeaderboardEntry } from "@/services/ctfService";

const MEDAL: Record<number, { icon: string; color: string; glow: string }> = {
  1: { icon: "🥇", color: "#fbbf24", glow: "rgba(251,191,36,0.3)" },
  2: { icon: "🥈", color: "#94a3b8", glow: "rgba(148,163,184,0.2)" },
  3: { icon: "🥉", color: "#f97316", glow: "rgba(249,115,22,0.2)" },
};

/* ─── Sidebar Component ───────────────────────────────────────────────── */
const Sidebar = ({ onLogout, userName }: { onLogout: () => void; userName: string }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { label: "Dashboard",      icon: LayoutDashboard, id: "dashboard",   path: "/dashboard"    },
    { label: "Vault Realm",    icon: VaultIcon,       id: "vault",        path: "/vault-realm"  },
    { label: "Incident Gate",  icon: AlertTriangle,   id: "incident",     locked: true, path: "/incident-gate" },
    { label: "CTF Challenges", icon: SwordsIcon,      id: "ctf",          path: "/ctf"          },
    { label: "Leaderboard",    icon: TrophyIcon,      id: "leaderboard",  path: "/leaderboard"  },
    { label: "Store",          icon: ShoppingBagIcon, id: "store"                               },
  ];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed left-0 top-0 bottom-0 z-50 bg-[#0d1117] border-r border-cyan-500/10 flex flex-col ${isHovered ? "w-64" : "w-16"}`}
      style={{ transition: "width 300ms cubic-bezier(0.4,0,0.2,1)", boxShadow: isHovered ? "20px 0 60px rgba(0,0,0,0.5)" : "none" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent opacity-50 pointer-events-none" />

      {/* Logo */}
      <div className={`px-4 h-28 flex items-center transition-all duration-300 ${isHovered ? "gap-4" : "justify-center"}`}>
        <motion.div
          className="flex-shrink-0 relative"
          animate={isHovered ? { rotate: [0, 5, 0, -5, 0], scale: [1, 1.08, 1] } : { rotate: -12, scale: 1 }}
          transition={isHovered ? { rotate: { duration: 6, repeat: Infinity }, scale: { duration: 4, repeat: Infinity } } : { duration: 0.5 }}
        >
          <motion.div
            animate={isHovered ? { opacity: [0.4, 0.8, 0.4], scale: [1, 1.2, 1] } : { opacity: 0 }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 bg-cyan-500/30 blur-2xl rounded-full"
          />
          <CustomShield
            className={`text-cyan-400 relative z-10 transition-all duration-500 ${isHovered ? "w-12 h-12" : "w-9 h-9"}`}
            strokeWidth={1.5}
          />
        </motion.div>
        <div className={`flex flex-col whitespace-nowrap transition-all duration-500 ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12 pointer-events-none"}`}>
          <div className="flex items-baseline">
            <span className="text-2xl font-black tracking-tighter text-white uppercase">PHISH</span>
            <span className="text-2xl font-black tracking-tighter text-cyan-400 uppercase">PULSE</span>
          </div>
          <div className="flex items-center gap-1.5 -mt-0.5">
            <div className="w-1 h-1 rounded-full bg-cyan-500 shadow-[0_0_5px_#06b6d4]" />
            <p className="text-[7.5px] uppercase tracking-[0.5em] text-slate-500 font-bold">TERMINAL_ACTIVE</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 mt-8 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { if (item.path) navigate(item.path); }}
            className="w-full group relative flex items-center gap-4 p-3 rounded-xl transition-all"
            style={{
              background:  item.id === "leaderboard" ? "rgba(6,182,212,0.05)" : "transparent",
              color:       item.id === "leaderboard" ? "#22d3ee" : "#94a3b8",
              borderLeft:  item.id === "leaderboard" ? "2px solid #22d3ee" : "2px solid transparent",
            }}
          >
            <div className="relative">
              <item.icon className="w-5 h-5 min-w-[20px] transition-all duration-300 group-hover:scale-110 group-hover:text-cyan-400" />
              {item.locked && (
                <div className="absolute -bottom-1 -right-1 text-orange-500 bg-[#0d1117] rounded-full p-0.5">
                  <LockKeyhole size={8} />
                </div>
              )}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"}`}>
              {item.label}
            </span>
            {item.locked && isHovered && (
              <span className="ml-auto text-[8px] font-black bg-orange-500/10 text-orange-500 border border-orange-500/20 px-1.5 py-0.5 rounded">LOCKED</span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-6 mt-auto border-t border-white/5 pt-4 space-y-4">
        <div className={`p-3 rounded-2xl bg-white/5 flex items-center gap-3 transition-all overflow-hidden ${!isHovered ? "justify-center p-2" : ""}`}>
          <div className="w-8 h-8 min-w-[32px] rounded-full bg-slate-800 border border-white/10 overflow-hidden flex-shrink-0">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} alt="avatar" />
          </div>
          <div className={`transition-all duration-300 whitespace-nowrap ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none"}`}>
            <p className="text-[10px] font-black text-white uppercase tracking-tighter truncate max-w-[140px]">{userName}</p>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold">Active</span>
            </div>
          </div>
        </div>

        <motion.button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 bg-red-500/5 transition-colors group"
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut className="w-5 h-5 min-w-[20px] text-red-400 transition-colors" />
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"}`}>
            Logout
          </span>
        </motion.button>
      </div>
    </div>
  );
};


export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLeaderboard()
      .then(setPlayers)
      .catch((err) => setError(err.message || "Failed to load leaderboard"))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay } },
  });

  // Podium: show top 3 in 2nd|1st|3rd order
  const top3 = players.filter((p) => p.rank <= 3);
  const podiumOrder = [
    top3.find((p) => p.rank === 2),
    top3.find((p) => p.rank === 1),
    top3.find((p) => p.rank === 3),
  ].filter(Boolean) as LeaderboardEntry[];
  const podiumRanks = [2, 1, 3];
  const podiumHeights = ["pt-8", "pt-0", "pt-12"];

  return (
    <div className="flex min-h-screen" style={{ background: "#0a0a0f", fontFamily: "'Inter', sans-serif" }}>
      <Sidebar onLogout={handleLogout} userName={user?.name || "Agent"} />

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
            <div className="flex items-center gap-3">
              <Crown size={16} className="text-cyan-500" style={{ filter: "drop-shadow(0 0 8px #06b6d4)" }} />
              <h1 className="text-base font-black uppercase tracking-[0.35em] text-white" style={{ textShadow: "0 0 20px rgba(6,182,212,0.4)" }}>Global Leaderboard</h1>
              <Crown size={16} className="text-cyan-500" style={{ filter: "drop-shadow(0 0 8px #06b6d4)" }} />
            </div>
          </motion.div>

          {/* Right — spacer */}
          <div></div>
        </header>

        {/* Main */}
        <div className="flex-1 max-w-3xl mx-auto px-6 py-10 w-full">

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="text-cyan-400 animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-10">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && players.length === 0 && (
          <div className="text-center py-10">
            <p className="text-slate-500">No agents on the leaderboard yet. Be the first!</p>
          </div>
        )}

        {!loading && !error && players.length > 0 && (
          <>
            {/* Podium — only if 3+ players */}
            {podiumOrder.length >= 1 && (
              <motion.div variants={fadeUp(0.1)} initial="hidden" animate="visible"
                className="flex items-end justify-center gap-4 mb-10">
                {podiumOrder.map((p, i) => {
                  const rank = podiumRanks[i];
                  const m = MEDAL[rank];
                  if (!m) return null;
                  return (
                    <motion.div key={p.id} className={`flex flex-col items-center gap-2 ${podiumHeights[i]}`} whileHover={{ scale: 1.05 }}>
                      <span className="text-3xl">{m.icon}</span>
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold"
                        style={{ background: m.glow, border: `2px solid ${m.color}60`, color: m.color }}>
                        {p.name[0].toUpperCase()}
                      </div>
                      <p className="text-white font-bold text-sm text-center">{p.name}</p>
                      <p className="text-xs font-semibold" style={{ color: m.color }}>{p.xp.toLocaleString()} XP</p>
                      <div className="w-full text-center px-6 py-3 rounded-xl"
                        style={{
                          background: `linear-gradient(180deg, ${m.glow} 0%, rgba(0,0,0,0) 100%)`,
                          border: `1px solid ${m.color}30`,
                          minWidth: rank === 1 ? "120px" : "100px",
                          minHeight: rank === 1 ? "80px" : rank === 2 ? "60px" : "48px",
                        }}>
                        <span className="text-xs font-bold" style={{ color: m.color }}>#{rank}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Full table */}
            <motion.div variants={fadeUp(0.25)} initial="hidden" animate="visible"
              className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(6,182,212,0.15)" }}>
              <div className="grid grid-cols-12 px-5 py-3 text-xs font-semibold"
                style={{ background: "rgba(6,182,212,0.06)", color: "#475569", borderBottom: "1px solid rgba(6,182,212,0.1)" }}>
                <span className="col-span-1">#</span>
                <span className="col-span-4">Agent</span>
                <span className="col-span-2 text-right">Level</span>
                <span className="col-span-2 text-right">XP</span>
                <span className="col-span-2 text-right">Coins</span>
                <span className="col-span-1 text-right">🔥</span>
              </div>

              {players.map((p, i) => (
                <motion.div key={p.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="grid grid-cols-12 items-center px-5 py-4"
                  style={{
                    background: p.is_you ? "rgba(6,182,212,0.08)" : i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
                    borderBottom: "1px solid rgba(6,182,212,0.06)",
                    borderLeft: p.is_you ? "3px solid #06b6d4" : "3px solid transparent",
                  }}>
                  <span className="col-span-1 font-bold text-sm">
                    {MEDAL[p.rank] ? <span>{MEDAL[p.rank].icon}</span> : <span style={{ color: "#475569" }}>{p.rank}</span>}
                  </span>

                  <div className="col-span-4 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: p.is_you ? "rgba(6,182,212,0.2)" : "rgba(255,255,255,0.06)",
                        color: p.is_you ? "#06b6d4" : "#94a3b8",
                        border: p.is_you ? "1px solid rgba(6,182,212,0.4)" : "1px solid rgba(255,255,255,0.08)",
                      }}>
                      {p.name[0].toUpperCase()}
                    </div>
                    <span className={`text-sm font-semibold ${p.is_you ? "text-cyan-400" : "text-white"}`}>
                      {p.name}{p.is_you && <span className="text-xs font-normal text-cyan-600 ml-1">(you)</span>}
                    </span>
                  </div>

                  <span className="col-span-2 text-right text-sm" style={{ color: "#94a3b8" }}>
                    <Trophy size={11} className="inline mr-1 text-cyan-400" />{p.level}
                  </span>
                  <span className="col-span-2 text-right text-sm font-semibold" style={{ color: "#f59e0b" }}>
                    {p.xp.toLocaleString()}
                  </span>
                  <span className="col-span-2 text-right text-sm" style={{ color: "#94a3b8" }}>
                    <Star size={11} className="inline mr-1" style={{ color: "#7c3aed" }} />{p.coins}
                  </span>
                  <span className="col-span-1 text-right text-sm" style={{ color: "#f59e0b" }}>
                    <Flame size={11} className="inline" /> {p.streak}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            <p className="text-center text-xs mt-6" style={{ color: "#1e293b" }}>
              Rankings update in real time · Complete vaults & CTFs to climb the board
            </p>
          </>
        )}
        </div>
      </div>
    </div>
  );
}