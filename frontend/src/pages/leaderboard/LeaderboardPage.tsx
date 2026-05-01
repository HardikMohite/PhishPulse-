import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trophy, Star, Flame, Crown, Loader2,
  ChevronRight,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import StoreDrawer from "@/components/layout/StoreDrawer";
import { useAuthStore } from "@/store/authStore";
import { logout } from "@/services/authService";
import { getLeaderboard } from "@/services/ctfService";
import type { LeaderboardEntry } from "@/services/ctfService";

const MEDAL: Record<number, { icon: string; color: string; glow: string }> = {
  1: { icon: "🥇", color: "#fbbf24", glow: "rgba(251,191,36,0.3)" },
  2: { icon: "🥈", color: "#94a3b8", glow: "rgba(148,163,184,0.2)" },
  3: { icon: "🥉", color: "#f97316", glow: "rgba(249,115,22,0.2)" },
};


export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStoreOpen, setIsStoreOpen] = useState(false);

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
      <Sidebar activeTab="leaderboard" onStoreClick={() => setIsStoreOpen(true)} onLogout={handleLogout} userName={user?.name || "Agent"} />

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
      <StoreDrawer isOpen={isStoreOpen} onClose={() => setIsStoreOpen(false)} userCoins={user?.coins ?? 0} />
    </div>
  );
}