import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Star, Flame, Crown, Loader2 } from "lucide-react";
import CustomShield from "@/components/CustomShield";
import { getLeaderboard } from "@/services/ctfService";
import type { LeaderboardEntry } from "@/services/ctfService";

const MEDAL: Record<number, { icon: string; color: string; glow: string }> = {
  1: { icon: "🥇", color: "#fbbf24", glow: "rgba(251,191,36,0.3)" },
  2: { icon: "🥈", color: "#94a3b8", glow: "rgba(148,163,184,0.2)" },
  3: { icon: "🥉", color: "#f97316", glow: "rgba(249,115,22,0.2)" },
};

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLeaderboard()
      .then(setPlayers)
      .catch((err) => setError(err.message || "Failed to load leaderboard"))
      .finally(() => setLoading(false));
  }, []);

  const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: "easeOut" } },
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
    <div className="min-h-screen" style={{ background: "#0a0a0f", fontFamily: "'Inter', sans-serif" }}>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4"
        style={{ background: "rgba(10,10,15,0.95)", borderBottom: "1px solid rgba(6,182,212,0.1)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
          <CustomShield size={32} className="text-cyan-400" style={{ filter: "drop-shadow(0 0 8px #06b6d4)" }} />
          <div>
            <div className="text-2xl font-bold leading-none tracking-tight">
              <span className="text-white">Phish</span><span className="text-cyan-400">Pulse</span>
            </div>
            <div className="text-xs" style={{ color: "#475569", letterSpacing: "0.1em" }}>Leaderboard</div>
          </div>
        </div>
        <motion.button onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
          style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)", color: "#94a3b8" }}
          whileHover={{ borderColor: "rgba(6,182,212,0.4)", color: "#06b6d4" }}>
          <ArrowLeft size={15} /> Back
        </motion.button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <motion.div variants={fadeUp(0)} initial="hidden" animate="visible" className="mb-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Crown size={28} style={{ color: "#fbbf24", filter: "drop-shadow(0 0 8px #fbbf24)" }} />
            <h1 className="text-3xl font-bold text-white">Global Leaderboard</h1>
            <Crown size={28} style={{ color: "#fbbf24", filter: "drop-shadow(0 0 8px #fbbf24)" }} />
          </div>
          <p className="text-sm" style={{ color: "#475569" }}>Top agents ranked by total XP earned</p>
        </motion.div>

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
  );
}