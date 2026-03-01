import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Star, Flame, Crown } from "lucide-react";
import CustomShield from "@/components/CustomShield";

const MOCK_PLAYERS = [
  { rank: 1, name: "CyberNova",    level: 12, xp: 1840, streak: 14, solved: 9,  isYou: false },
  { rank: 2, name: "PhishHunter",  level: 10, xp: 1520, streak: 7,  solved: 7,  isYou: false },
  { rank: 3, name: "ZeroTrace",    level: 9,  xp: 1310, streak: 5,  solved: 6,  isYou: false },
  { rank: 4, name: "You",          level: 1,  xp: 0,    streak: 0,  solved: 0,  isYou: true  },
  { rank: 5, name: "ShadowByte",   level: 7,  xp: 980,  streak: 3,  solved: 4,  isYou: false },
  { rank: 6, name: "L0g1cBomb",    level: 6,  xp: 820,  streak: 2,  solved: 3,  isYou: false },
  { rank: 7, name: "PacketSniper", level: 5,  xp: 670,  streak: 1,  solved: 2,  isYou: false },
  { rank: 8, name: "NullPointer",  level: 4,  xp: 510,  streak: 0,  solved: 1,  isYou: false },
];

const MEDAL: Record<number, { icon: string; color: string; glow: string }> = {
  1: { icon: "🥇", color: "#fbbf24", glow: "rgba(251,191,36,0.3)"  },
  2: { icon: "🥈", color: "#94a3b8", glow: "rgba(148,163,184,0.2)" },
  3: { icon: "🥉", color: "#f97316", glow: "rgba(249,115,22,0.2)"  },
};

export default function LeaderboardPage() {
  const navigate = useNavigate();

  const fadeUp = (delay = 0) => ({
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: "easeOut" } },
  });

  // Podium order: 2nd | 1st | 3rd
  const podium = [MOCK_PLAYERS[1], MOCK_PLAYERS[0], MOCK_PLAYERS[2]];
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
        <motion.button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
          style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)", color: "#94a3b8" }}
          whileHover={{ borderColor: "rgba(6,182,212,0.4)", color: "#06b6d4" }}
        >
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

        {/* Podium */}
        <motion.div variants={fadeUp(0.1)} initial="hidden" animate="visible"
          className="flex items-end justify-center gap-4 mb-10">
          {podium.map((p, i) => {
            const rank = podiumRanks[i];
            const m = MEDAL[rank];
            return (
              <motion.div key={p.name}
                className={`flex flex-col items-center gap-2 ${podiumHeights[i]}`}
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-3xl">{m.icon}</span>
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{ background: `${m.glow}`, border: `2px solid ${m.color}60`, color: m.color }}>
                  {p.name[0]}
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

        {/* Full table */}
        <motion.div variants={fadeUp(0.25)} initial="hidden" animate="visible"
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(6,182,212,0.15)" }}>

          {/* Header row */}
          <div className="grid grid-cols-12 px-5 py-3 text-xs font-semibold"
            style={{ background: "rgba(6,182,212,0.06)", color: "#475569", borderBottom: "1px solid rgba(6,182,212,0.1)" }}>
            <span className="col-span-1">#</span>
            <span className="col-span-4">Agent</span>
            <span className="col-span-2 text-right">Level</span>
            <span className="col-span-2 text-right">XP</span>
            <span className="col-span-2 text-right">Solved</span>
            <span className="col-span-1 text-right">🔥</span>
          </div>

          {MOCK_PLAYERS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              className="grid grid-cols-12 items-center px-5 py-4"
              style={{
                background: p.isYou ? "rgba(6,182,212,0.08)" : i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
                borderBottom: "1px solid rgba(6,182,212,0.06)",
                borderLeft: p.isYou ? "3px solid #06b6d4" : "3px solid transparent",
              }}
            >
              <span className="col-span-1 font-bold text-sm">
                {MEDAL[p.rank]
                  ? <span>{MEDAL[p.rank].icon}</span>
                  : <span style={{ color: "#475569" }}>{p.rank}</span>}
              </span>

              <div className="col-span-4 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: p.isYou ? "rgba(6,182,212,0.2)" : "rgba(255,255,255,0.06)",
                    color: p.isYou ? "#06b6d4" : "#94a3b8",
                    border: p.isYou ? "1px solid rgba(6,182,212,0.4)" : "1px solid rgba(255,255,255,0.08)"
                  }}>
                  {p.name[0]}
                </div>
                <span className={`text-sm font-semibold ${p.isYou ? "text-cyan-400" : "text-white"}`}>
                  {p.name}{p.isYou && <span className="text-xs font-normal text-cyan-600 ml-1">(you)</span>}
                </span>
              </div>

              <span className="col-span-2 text-right text-sm" style={{ color: "#94a3b8" }}>
                <Trophy size={11} className="inline mr-1 text-cyan-400" />{p.level}
              </span>

              <span className="col-span-2 text-right text-sm font-semibold" style={{ color: "#f59e0b" }}>
                {p.xp.toLocaleString()}
              </span>

              <span className="col-span-2 text-right text-sm" style={{ color: "#94a3b8" }}>
                <Star size={11} className="inline mr-1" style={{ color: "#7c3aed" }} />{p.solved}
              </span>

              <span className="col-span-1 text-right text-sm" style={{ color: "#f59e0b" }}>
                <Flame size={11} className="inline" /> {p.streak}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <p className="text-center text-xs mt-6" style={{ color: "#1e293b" }}>
          Rankings update every 24 hours · Complete vaults & CTFs to climb the board
        </p>
      </div>
    </div>
  );
}
