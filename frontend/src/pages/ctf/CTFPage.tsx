import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Flag, Clock, Trophy, Coins, Sparkles, CheckCircle2, X, Crown } from "lucide-react";
import CustomShield from "@/components/CustomShield";

export default function CTFPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number | null>(null); // eslint-disable-line
  const [modalOpen, setModalOpen] = useState(false);
  const [modalChallenge, setModalChallenge] = useState<{ title: string; isPractice: boolean } | null>(null);
  const [flagInput, setFlagInput] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "correct" | "wrong">("idle");

  const openModal = (title: string, isPractice: boolean) => {
    setModalChallenge({ title, isPractice });
    setFlagInput("");
    setSubmitStatus("idle");
    setModalOpen(true);
  };

  const handleFlagSubmit = () => {
    if (!flagInput.trim()) return;
    // Demo: any flag starting with "PHISH{" is correct
    if (flagInput.trim().toUpperCase().startsWith("PHISH{")) {
      setSubmitStatus("correct");
    } else {
      setSubmitStatus("wrong");
    }
  };

  const pastChallenges = [
    { id: 1, title: "Email Header Analysis", difficulty: "Hard", xp: 100, coins: 60, solved: true },
    { id: 2, title: "URL Inspection Challenge", difficulty: "Easy", xp: 30, coins: 20, solved: false },
    { id: 3, title: "Social Engineering Detection", difficulty: "Medium", xp: 75, coins: 45, solved: false },
  ];

  const difficultyColor = (d: string) => {
    if (d === "Easy") return "#10b981";
    if (d === "Medium") return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f", fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div className="border-b" style={{ background: "rgba(15,23,42,0.6)", borderColor: "rgba(6,182,212,0.1)" }}>
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          
          {/* Left - Logo */}
          <div className="flex items-center gap-3">
            <CustomShield size={36} className="text-cyan-400" />
            <div className="text-2xl font-bold">
              <span className="text-white">Phish</span>
              <span className="text-cyan-400">Pulse</span>
            </div>
          </div>

          {/* Center - Page Title */}
          <div className="flex items-center gap-2">
            <Flag size={20} className="text-cyan-400" />
            <span className="text-white font-semibold text-lg">CTF Daily Challenges</span>
          </div>

          {/* Right - Back Button */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", color: "#06b6d4" }}
              whileHover={{ background: "rgba(6,182,212,0.2)", boxShadow: "0 0 20px rgba(6,182,212,0.3)" }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={15} /> Back
            </motion.button>
            <motion.button
              onClick={() => navigate("/leaderboard")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24" }}
              whileHover={{ borderColor: "rgba(251,191,36,0.6)", background: "rgba(251,191,36,0.15)" }}
            >
              <Crown size={15} /> Leaderboard
            </motion.button>
          </div>

        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">

        {/* Daily Challenge Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl p-8 mb-8"
          style={{
            background: "linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(139,92,246,0.15) 50%, rgba(6,182,212,0.15) 100%)",
            border: "2px solid rgba(236,72,153,0.4)",
            boxShadow: "0 0 60px rgba(236,72,153,0.2)"
          }}
        >
          {/* Badges Row */}
          <div className="flex items-center gap-3 mb-5">
            <motion.div
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-sm font-bold"
              style={{ background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)" }}
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles size={16} />
              NEW DAILY CHALLENGE
              <Sparkles size={16} />
            </motion.div>

            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-red-400 text-xs font-semibold"
              style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)" }}
            >
              <Clock size={13} />
              Expires in 13:59:59
            </div>
          </div>

          {/* Content Row */}
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">Suspicious Login Alert</h2>
              <p className="text-slate-300 mb-5">
                Analyze the email and identify the phishing indicators. Find the flag hidden in the suspicious link.
              </p>

              <div className="flex items-center gap-4">
                <div className="px-3 py-1 rounded-lg text-sm font-semibold text-amber-400"
                  style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.4)" }}>
                  Medium
                </div>
                <div className="flex items-center gap-1.5 text-yellow-400 font-bold">
                  <Trophy size={17} />
                  50 XP
                </div>
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Coins size={17} />
                  30 Coins
                </div>
              </div>
            </div>

            <motion.button
              className="flex items-center gap-3 px-8 py-4 rounded-xl text-white font-bold text-lg shrink-0"
              style={{
                background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
                boxShadow: "0 0 30px rgba(236,72,153,0.4)"
              }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(236,72,153,0.6)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openModal("Suspicious Login Alert", false)}
            >
              <Flag size={22} />
              Start Challenge
            </motion.button>
          </div>
        </motion.div>

        {/* Past Challenges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Past Challenges</h2>
            <span className="text-xs text-slate-500 px-3 py-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              Practice mode — no rewards
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {pastChallenges.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center justify-between p-5 rounded-xl"
                style={{
                  background: "rgba(15,23,42,0.6)",
                  border: `1px solid ${selected === c.id ? "rgba(6,182,212,0.5)" : "rgba(6,182,212,0.15)"}`,
                  boxShadow: selected === c.id ? "0 0 20px rgba(6,182,212,0.15)" : "none"
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-semibold">{c.title}</span>
                    {c.solved && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)" }}>
                        <CheckCircle2 size={11} style={{ color: "#10b981" }} />
                        <span className="text-xs font-semibold" style={{ color: "#10b981" }}>Solved</span>
                      </div>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded font-semibold"
                      style={{ background: `${difficultyColor(c.difficulty)}20`, color: difficultyColor(c.difficulty) }}>
                      {c.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1 line-through">
                      <Trophy size={11} /> {c.xp} XP
                    </span>
                    <span className="flex items-center gap-1 line-through">
                      <Coins size={11} /> {c.coins} Coins
                    </span>
                  </div>
                </div>

                <motion.button
                  onClick={() => openModal(c.title, true)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold ml-4"
                  style={{
                    background: selected === c.id ? "rgba(6,182,212,0.2)" : "rgba(6,182,212,0.08)",
                    border: "1px solid rgba(6,182,212,0.3)",
                    color: "#06b6d4"
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {c.solved ? "View Again" : "Try It"}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* ── Flag Submission Modal ── */}
      <AnimatePresence>
        {modalOpen && modalChallenge && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl p-8"
              style={{ background: "#0d1117", border: "1px solid rgba(6,182,212,0.3)", boxShadow: "0 0 60px rgba(6,182,212,0.2)" }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Flag size={18} className="text-cyan-400" />
                    <span className="text-cyan-400 text-sm font-semibold">Submit Flag</span>
                  </div>
                  <h3 className="text-white font-bold text-xl">{modalChallenge.title}</h3>
                  {modalChallenge.isPractice && (
                    <span className="text-xs text-slate-500 mt-1 block">Practice mode — no rewards</span>
                  )}
                </div>
                <button onClick={() => setModalOpen(false)}
                  className="text-slate-600 hover:text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Flag Input */}
              {submitStatus === "idle" && (
                <>
                  <p className="text-slate-400 text-sm mb-4">
                    Enter the flag in the format: <span className="text-cyan-400 font-mono">PHISH&#123;...&#125;</span>
                  </p>
                  <input
                    type="text"
                    value={flagInput}
                    onChange={(e) => setFlagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleFlagSubmit()}
                    placeholder="PHISH{your_answer_here}"
                    className="w-full px-4 py-3 rounded-lg text-sm text-white font-mono outline-none mb-4"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(6,182,212,0.3)",
                      caretColor: "#06b6d4"
                    }}
                    autoFocus
                  />
                  <motion.button
                    onClick={handleFlagSubmit}
                    className="w-full py-3 rounded-lg text-white font-semibold"
                    style={{ background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)", boxShadow: "0 0 20px rgba(6,182,212,0.3)" }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Submit Flag
                  </motion.button>
                </>
              )}

              {/* Correct */}
              {submitStatus === "correct" && (
                <motion.div className="text-center py-4" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                  <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-3" />
                  <h4 className="text-emerald-400 text-xl font-bold mb-2">Correct Flag! 🎉</h4>
                  <p className="text-slate-400 text-sm mb-4">
                    {modalChallenge.isPractice ? "Great job! No rewards in practice mode." : "You've earned XP and Coins!"}
                  </p>
                  <button onClick={() => setModalOpen(false)}
                    className="px-6 py-2 rounded-lg text-white text-sm font-semibold"
                    style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.5)" }}>
                    Close
                  </button>
                </motion.div>
              )}

              {/* Wrong */}
              {submitStatus === "wrong" && (
                <motion.div className="text-center py-4" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                  <X size={48} className="text-red-400 mx-auto mb-3" />
                  <h4 className="text-red-400 text-xl font-bold mb-2">Wrong Flag!</h4>
                  <p className="text-slate-400 text-sm mb-4">That's not correct. Try again!</p>
                  <button onClick={() => setSubmitStatus("idle")}
                    className="px-6 py-2 rounded-lg text-white text-sm font-semibold"
                    style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.5)" }}>
                    Try Again
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}