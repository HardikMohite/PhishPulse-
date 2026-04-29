/**
 * ResultCard (CompletionScreen merged)
 * Shows after level submission: accuracy ring, XP earned (real from backend),
 * health bar (dashboard style), time, streak, lesson recap, next level preview.
 * All values come from submitResult — nothing is hardcoded.
 */

import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Zap,
  Clock,
  Target,
  Trophy,
  Flame,
  RotateCcw,
  ArrowRight,
  Heart,
  Mail,
  Coins,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { formatTime, getAccuracyLabel, getAccuracyColor } from '../utils/scoring';
import type { SubmitAnswerResponse, LevelWithTeaching, Level } from '../types/vault01.types';

interface ResultCardProps {
  level: LevelWithTeaching;
  result: SubmitAnswerResponse;
  nextLevel: Level | null;
  elapsedSeconds: number;
  onReplay: () => void;
  onBackToMap: () => void;
  onNextLevel: () => void;
}

// ── Dashboard-style segmented health bar ─────────────────────────────────────
function HealthBar({ hp, maxHp = 100 }: { hp: number; maxHp?: number }) {
  const pct = (hp / maxHp) * 100;
  const segments = 10;
  const filled = Math.ceil((hp / maxHp) * segments);

  const barColor =
    pct > 70 ? 'bg-green-500 shadow-[0_0_10px_#22c55e]'
    : pct > 40 ? 'bg-yellow-500 shadow-[0_0_10px_#eab308]'
    : pct > 20 ? 'bg-orange-500 shadow-[0_0_10px_#f97316]'
    : 'bg-red-500 shadow-[0_0_10px_#ef4444]';

  const textColor =
    pct > 70 ? 'text-green-400'
    : pct > 40 ? 'text-yellow-400'
    : pct > 20 ? 'text-orange-400'
    : 'text-red-400';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Heart className={`w-5 h-5 ${textColor}`} strokeWidth={2.5} />
        <span className={`text-xl font-black ${textColor}`}>{hp}</span>
        <span className="text-xs text-slate-500 font-bold">/ {maxHp} HP</span>
      </div>
      <div className="flex gap-1 items-end">
        {Array.from({ length: segments }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0.5, opacity: 0.5 }}
            animate={{ scaleY: i < filled ? 1 : 0.8, opacity: i < filled ? 1 : 0.2 }}
            className={`h-2 flex-1 rounded-sm transition-all duration-500 ${
              i < filled ? barColor : 'bg-slate-800'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function ResultCard({
  level,
  result,
  nextLevel,
  elapsedSeconds,
  onReplay,
  onBackToMap,
  onNextLevel,
}: ResultCardProps) {
  const { user } = useAuthStore();
  const accuracyLabel = getAccuracyLabel(result.accuracy);
  const accuracyColor = getAccuracyColor(result.accuracy);

  // Estimate current HP: base 100 + health_change (negative on misses)
  const currentHp = Math.max(10, 100 + result.health_change);
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (result.accuracy / 100) * circumference;

  return (
    <main className="relative z-10 flex flex-col h-screen w-screen overflow-y-auto bg-[#0a0a0f] px-6 py-6 max-w-5xl mx-auto gap-5">
      {/* Background glow */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-cyan-400/10 blur-[150px] rounded-full pointer-events-none -translate-y-1/2 z-[-1]" />

      {/* ── Top banner ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center gap-2"
      >
        <div className="inline-flex items-center gap-3 bg-cyan-400/10 border border-cyan-400/30 px-6 py-2 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase">
            {result.correct ? 'Level Complete' : 'Level Attempted'}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter">
          Level {String(level.id).padStart(2, '0')} — {level.name}
        </h1>
      </motion.div>

      {/* ── Score card ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-[#0f172a]/80 border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-xl"
      >
        <div className="absolute -inset-10 bg-gradient-to-br from-cyan-400/5 via-transparent to-purple-500/5 pointer-events-none" />

        <div className="grid md:grid-cols-[auto_1fr_auto] gap-6 md:gap-8 items-center relative z-10">
          {/* Accuracy ring — matches dashboard CircularProgress style */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                <motion.circle
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  cx="48" cy="48" r="42"
                  stroke="#06b6d4" strokeWidth="8" fill="transparent"
                  strokeDasharray={circumference}
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white">
                  {Math.round(result.accuracy)}<span className="text-xl text-white/50">%</span>
                </span>
              </div>
            </div>
            <span className={`text-xs font-bold uppercase tracking-widest px-4 py-1.5 bg-cyan-400/10 rounded-full border border-cyan-400/20 ${accuracyColor}`}>
              {accuracyLabel}
            </span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex flex-col gap-1">
              <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> XP Earned
              </div>
              <span className="text-2xl font-black text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                +{result.xp_earned} XP
              </span>
            </div>

            <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex flex-col gap-1">
              <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">
                <Coins className="w-3.5 h-3.5 text-yellow-400" /> Coins
              </div>
              <span className="text-2xl font-black text-yellow-400">
                +{result.coins_earned}
              </span>
            </div>

            {/* Health bar — dashboard style */}
            <div className="bg-white/5 rounded-xl p-3 border border-white/5 col-span-2">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
                Integrity Levels
              </div>
              <HealthBar hp={currentHp} />
            </div>

            <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex flex-col gap-1">
              <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">
                <Clock className="w-3.5 h-3.5 text-white/40" /> Time
              </div>
              <span className="text-xl font-bold text-white">{formatTime(elapsedSeconds)}</span>
            </div>

            <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex flex-col gap-1">
              <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">
                <Target className="w-3.5 h-3.5 text-white/40" /> Accuracy
              </div>
              <span className={`text-xl font-bold ${accuracyColor}`}>{result.accuracy}%</span>
            </div>
          </div>

          {/* Streak */}
          <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-amber-400/10 to-amber-400/5 border border-amber-400/20 rounded-2xl text-center min-w-[180px]">
            <div className="w-16 h-16 bg-amber-400/20 rounded-full flex items-center justify-center mb-4 relative drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <div className="absolute inset-0 bg-amber-400/30 rounded-full animate-ping opacity-40" />
              <Flame className="w-8 h-8 text-amber-400 fill-amber-400" />
            </div>
            <span className="text-xl font-black text-white mb-1">{user?.streak ?? 0} Day Streak</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80">
              Streak Bonus Active
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Lower grid ────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-[1fr_260px] gap-4">

        {/* Lesson recap */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0f172a]/80 border border-white/10 rounded-2xl p-4 backdrop-blur-xl"
        >
          <h3 className="text-[11px] font-black tracking-widest text-cyan-400 uppercase mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4" /> What You Learned
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.what_you_learned.length > 0
              ? result.what_you_learned.map((item, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-white/80">
                    <span className="text-cyan-400 mr-2">•</span>{item}
                  </span>
                ))
              : level.teaching_steps
                  .filter((s) => s.type === 'concept')
                  .map((s, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-white/80">
                      <span className="text-cyan-400 mr-2">•</span>{s.title}
                    </span>
                  ))
            }
          </div>
        </motion.div>

        {/* Next level preview */}
        {nextLevel && result.next_level_unlocked && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#0f172a]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex flex-col items-start group cursor-pointer"
            onClick={onNextLevel}
          >
            <span className="text-[10px] font-black tracking-widest text-purple-400 uppercase mb-4 px-2 py-1 bg-purple-400/10 rounded border border-purple-400/20">
              Up Next: Level {nextLevel.id}
            </span>
            <h4 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
              {nextLevel.name}
            </h4>
            <p className="text-xs text-white/50 leading-relaxed mb-6">{nextLevel.description}</p>
            <div className="mt-auto flex items-center gap-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3 h-3" /> {nextLevel.email_count} Emails
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> ~{nextLevel.est_minutes} Min
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Action buttons ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 relative z-10 w-full"
      >
        <button
          onClick={onReplay}
          className="px-6 py-2.5 rounded-xl border border-white/10 text-[10px] uppercase font-bold tracking-widest text-white/50 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <RotateCcw className="w-4 h-4" /> Replay Level
        </button>

        <button
          onClick={onBackToMap}
          className="border-2 border-cyan-400 text-cyan-400 font-black uppercase tracking-tighter rounded-xl px-8 py-2.5 bg-transparent hover:bg-cyan-400/10 transition-all flex items-center gap-2 justify-center shadow-[0_0_12px_rgba(6,182,212,0.15)] w-full sm:w-auto"
        >
          ← Back to Vault Map
        </button>

        {nextLevel && result.next_level_unlocked && (
          <button
            onClick={onNextLevel}
            className="px-8 py-2.5 rounded-xl flex items-center gap-3 bg-cyan-400 text-black font-black uppercase tracking-tighter shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-105 active:scale-95 transition-all w-full sm:w-auto justify-center"
          >
            Next Level <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </motion.div>
    </main>
  );
}
