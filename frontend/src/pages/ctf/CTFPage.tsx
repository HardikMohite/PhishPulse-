import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Flag, Clock, Trophy, Coins, Sparkles, CheckCircle2, X, Crown, Loader2 } from "lucide-react";
import CustomShield from "@/components/CustomShield";
import { useAuthStore } from "@/store/authStore";
import { getDailyChallenge, getPastChallenges, submitFlag } from "@/services/ctfService";
import type { CTFChallenge, SubmitFlagResult } from "@/services/ctfService";

function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const target = new Date(expiresAt).getTime();
    const tick = () => {
      const dist = target - Date.now();
      if (dist <= 0) { setTime("Expired"); return; }
      const h = Math.floor(dist / 3600000);
      const m = Math.floor((dist % 3600000) / 60000);
      const s = Math.floor((dist % 60000) / 1000);
      setTime(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return <span>{time}</span>;
}

function difficultyColor(d: string) {
  if (d === "Easy") return "#10b981";
  if (d === "Medium") return "#f59e0b";
  return "#ef4444";
}

interface ModalState {
  challenge: CTFChallenge;
  isPractice: boolean;
}

export default function CTFPage() {
  const navigate = useNavigate();
  const { updateUser } = useAuthStore();

  const [daily, setDaily] = useState<CTFChallenge | null>(null);
  const [past, setPast] = useState<CTFChallenge[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [modal, setModal] = useState<ModalState | null>(null);
  const [flagInput, setFlagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitFlagResult | null>(null);
  const flagRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      getDailyChallenge().catch(() => null),
      getPastChallenges().catch(() => []),
    ]).then(([d, p]) => {
      setDaily(d);
      setPast(p);
    }).catch((err) => setPageError(err.message || "Failed to load challenges"))
      .finally(() => setPageLoading(false));
  }, []);

  const openModal = (challenge: CTFChallenge, isPractice: boolean) => {
    setModal({ challenge, isPractice });
    setFlagInput("");
    setSubmitResult(null);
    setTimeout(() => flagRef.current?.focus(), 100);
  };

  const closeModal = () => {
    setModal(null);
    setFlagInput("");
    setSubmitResult(null);
  };

  const handleSubmit = async () => {
    if (!modal || !flagInput.trim()) return;
    setSubmitting(true);
    try {
      const result = await submitFlag(modal.challenge.id, flagInput.trim());
      setSubmitResult(result);
      if (result.correct) {
        // Update authStore with new XP/coins/level using the dedicated partial-update action
        updateUser({
          xp: result.new_xp,
          coins: result.new_coins,
          level: result.new_level,
        });
        // Mark challenge as solved in local state
        if (daily && modal.challenge.id === daily.id) {
          setDaily({ ...daily, solved: true });
        }
        setPast((prev) => prev.map((c) =>
          c.id === modal.challenge.id ? { ...c, solved: true } : c
        ));
      }
    } catch (err: any) {
      setSubmitResult({
        correct: false,
        message: err.message || "Submission failed. Please try again.",
        xp_earned: 0, coins_earned: 0,
        new_xp: 0, new_coins: 0, new_level: 0,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f", fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div className="border-b" style={{ background: "rgba(15,23,42,0.6)", borderColor: "rgba(6,182,212,0.1)" }}>
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CustomShield size={36} className="text-cyan-400" />
            <div className="text-2xl font-bold">
              <span className="text-white">Phish</span><span className="text-cyan-400">Pulse</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Flag size={20} className="text-cyan-400" />
            <span className="text-white font-semibold text-lg">CTF Daily Challenges</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.button onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", color: "#06b6d4" }}
              whileHover={{ background: "rgba(6,182,212,0.2)" }} whileTap={{ scale: 0.95 }}>
              <ArrowLeft size={15} /> Back
            </motion.button>
            <motion.button onClick={() => navigate("/leaderboard")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24" }}
              whileHover={{ borderColor: "rgba(251,191,36,0.6)", background: "rgba(251,191,36,0.15)" }}>
              <Crown size={15} /> Leaderboard
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-8 py-8">

        {pageLoading && (
          <div className="flex justify-center py-20">
            <Loader2 size={40} className="text-cyan-400 animate-spin" />
          </div>
        )}

        {pageError && (
          <div className="text-center py-20">
            <p className="text-red-400 text-lg">{pageError}</p>
          </div>
        )}

        {!pageLoading && !pageError && (
          <>
            {/* Daily Challenge */}
            {daily ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="rounded-2xl p-8 mb-8"
                style={{
                  background: "linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(139,92,246,0.15) 50%, rgba(6,182,212,0.15) 100%)",
                  border: daily.solved ? "2px solid rgba(16,185,129,0.5)" : "2px solid rgba(236,72,153,0.4)",
                  boxShadow: daily.solved ? "0 0 60px rgba(16,185,129,0.2)" : "0 0 60px rgba(236,72,153,0.2)",
                }}>
                <div className="flex items-center gap-3 mb-5">
                  {daily.solved ? (
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-sm font-bold"
                      style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                      <CheckCircle2 size={16} /> SOLVED ✓
                    </div>
                  ) : (
                    <motion.div className="flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-sm font-bold"
                      style={{ background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)" }}
                      animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                      <Sparkles size={16} /> NEW DAILY CHALLENGE <Sparkles size={16} />
                    </motion.div>
                  )}
                  {daily.expires_at && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-red-400 text-xs font-semibold"
                      style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)" }}>
                      <Clock size={13} /> Expires in <CountdownTimer expiresAt={daily.expires_at} />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-6">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-white mb-2">{daily.title}</h2>
                    <p className="text-slate-300 mb-5 text-sm leading-relaxed" style={{ whiteSpace: "pre-line" }}>
                      {daily.description.split("\n\n")[0]}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="px-3 py-1 rounded-lg text-sm font-semibold"
                        style={{ background: `${difficultyColor(daily.difficulty)}20`, color: difficultyColor(daily.difficulty), border: `1px solid ${difficultyColor(daily.difficulty)}40` }}>
                        {daily.difficulty}
                      </div>
                      <div className="flex items-center gap-1.5 text-yellow-400 font-bold">
                        <Trophy size={17} /> {daily.xp_reward} XP
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                        <Coins size={17} /> {daily.coins_reward} Coins
                      </div>
                    </div>
                  </div>
                  <motion.button
                    className="flex items-center gap-3 px-8 py-4 rounded-xl text-white font-bold text-lg shrink-0"
                    style={{
                      background: daily.solved
                        ? "linear-gradient(135deg, #10b981, #059669)"
                        : "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
                      boxShadow: daily.solved ? "0 0 30px rgba(16,185,129,0.4)" : "0 0 30px rgba(236,72,153,0.4)",
                    }}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => openModal(daily, false)}>
                    <Flag size={22} />
                    {daily.solved ? "View Again" : "Start Challenge"}
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <div className="rounded-2xl p-8 mb-8 text-center"
                style={{ background: "rgba(6,182,212,0.03)", border: "1px solid rgba(6,182,212,0.15)" }}>
                <Flag size={32} className="text-cyan-400/40 mx-auto mb-3" />
                <p className="text-white font-semibold">No active daily challenge</p>
                <p className="text-sm mt-1" style={{ color: "#475569" }}>Check back later — a new challenge will be posted soon.</p>
              </div>
            )}

            {/* Past Challenges */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Past Challenges</h2>
                <span className="text-xs text-slate-500 px-3 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  Practice mode — no rewards
                </span>
              </div>

              {past.length === 0 ? (
                <p className="text-slate-500 text-sm">No past challenges yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {past.map((c, i) => (
                    <motion.div key={c.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                      className="flex items-center justify-between p-5 rounded-xl"
                      style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(6,182,212,0.15)" }}>
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
                          <span className="flex items-center gap-1 line-through"><Trophy size={11} /> {c.xp_reward} XP</span>
                          <span className="flex items-center gap-1 line-through"><Coins size={11} /> {c.coins_reward} Coins</span>
                        </div>
                      </div>
                      <motion.button onClick={() => openModal(c, true)}
                        className="px-4 py-2 rounded-lg text-sm font-semibold ml-4"
                        style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.3)", color: "#06b6d4" }}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        {c.solved ? "View Again" : "Try It"}
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>

      {/* Flag Submission Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeModal}>
            <motion.div className="w-full max-w-lg rounded-2xl p-8"
              style={{ background: "#0d1117", border: "1px solid rgba(6,182,212,0.3)", boxShadow: "0 0 60px rgba(6,182,212,0.2)" }}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Flag size={18} className="text-cyan-400" />
                    <span className="text-cyan-400 text-sm font-semibold">
                      {modal.isPractice ? "Practice Mode" : "Daily Challenge"}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-xl">{modal.challenge.title}</h3>
                  {modal.isPractice && (
                    <span className="text-xs text-slate-500 mt-0.5 block">No rewards in practice mode</span>
                  )}
                </div>
                <button onClick={closeModal} className="text-slate-600 hover:text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Challenge description */}
              <div className="mb-5 p-4 rounded-lg text-sm text-slate-300 leading-relaxed"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", whiteSpace: "pre-line", maxHeight: 200, overflowY: "auto" }}>
                {modal.challenge.description}
              </div>

              {/* Rewards row */}
              {!modal.isPractice && (
                <div className="flex items-center gap-4 mb-5 text-sm">
                  <div className="flex items-center gap-1.5 text-yellow-400 font-semibold">
                    <Trophy size={15} /> {modal.challenge.xp_reward} XP
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                    <Coins size={15} /> {modal.challenge.coins_reward} Coins
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded font-semibold"
                    style={{ background: `${difficultyColor(modal.challenge.difficulty)}20`, color: difficultyColor(modal.challenge.difficulty) }}>
                    {modal.challenge.difficulty}
                  </span>
                </div>
              )}

              {/* Submission area */}
              {!submitResult ? (
                <>
                  <p className="text-slate-400 text-sm mb-3">
                    Submit the flag in format: <span className="text-cyan-400 font-mono">PHISH&#123;...&#125;</span>
                  </p>
                  <input ref={flagRef} type="text" value={flagInput}
                    onChange={(e) => setFlagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="PHISH{your_answer_here}"
                    className="w-full px-4 py-3 rounded-lg text-sm text-white font-mono outline-none mb-4"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(6,182,212,0.3)", caretColor: "#06b6d4" }} />
                  <motion.button onClick={handleSubmit} disabled={submitting || !flagInput.trim()}
                    className="w-full py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                      boxShadow: "0 0 20px rgba(6,182,212,0.3)",
                      opacity: submitting || !flagInput.trim() ? 0.6 : 1,
                    }}
                    whileHover={!submitting ? { scale: 1.02 } : {}} whileTap={!submitting ? { scale: 0.98 } : {}}>
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    {submitting ? "Submitting..." : "Submit Flag"}
                  </motion.button>
                </>
              ) : submitResult.correct ? (
                <motion.div className="text-center py-4" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                  <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-3" />
                  <h4 className="text-emerald-400 text-xl font-bold mb-2">Correct Flag! 🎉</h4>
                  <p className="text-slate-400 text-sm mb-3">{submitResult.message}</p>
                  {submitResult.xp_earned > 0 && (
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <span className="text-yellow-400 font-bold">+{submitResult.xp_earned} XP</span>
                      <span className="text-amber-400 font-bold">+{submitResult.coins_earned} Coins</span>
                      {submitResult.new_level >= 1 && (
                        <span className="text-cyan-400 font-bold">Level {submitResult.new_level}!</span>
                      )}
                    </div>
                  )}
                  <button onClick={closeModal}
                    className="px-6 py-2 rounded-lg text-white text-sm font-semibold"
                    style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.5)" }}>
                    Close
                  </button>
                </motion.div>
              ) : (
                <motion.div className="text-center py-4" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                  <X size={48} className="text-red-400 mx-auto mb-3" />
                  <h4 className="text-red-400 text-xl font-bold mb-2">Wrong Flag!</h4>
                  <p className="text-slate-400 text-sm mb-4">{submitResult.message}</p>
                  <button onClick={() => setSubmitResult(null)}
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