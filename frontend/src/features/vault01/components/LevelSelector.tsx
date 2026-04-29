/**
 * LevelSelector
 * The 10-level grid + vault completion rewards section.
 * Keyboard-navigable. Status-aware (locked / unlocked / active / completed).
 */

import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Lock,
  Mail,
  Trophy,
  Clock,
  Zap,
  Coins,
} from 'lucide-react';
import type { Level, VaultMeta } from '../types/vault01.types';

interface LevelSelectorProps {
  levels: Level[];
  meta: VaultMeta;
  focusedIndex: number;
  onSelect: (level: Level) => void;
  onFocusChange: (index: number) => void;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner:     'text-green-400 bg-green-400/10 border-green-400/20',
  Intermediate: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  Advanced:     'text-orange-400 bg-orange-400/10 border-orange-400/20',
  Expert:       'text-red-400 bg-red-400/10 border-red-400/20',
};

export default function LevelSelector({
  levels,
  meta,
  focusedIndex,
  onSelect,
  onFocusChange,
}: LevelSelectorProps) {
  return (
    <>
      {/* ── Level Grid ─────────────────────────────────────────────────────── */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase tracking-widest text-white/80">
            Available <span className="text-cyan-400">Levels</span>
          </h2>
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
            <div className="flex gap-1">
              {['←', '↑', '↓', '→'].map((k) => (
                <div
                  key={k}
                  className="w-5 h-5 border border-white/20 rounded flex items-center justify-center text-[9px]"
                >
                  {k}
                </div>
              ))}
            </div>
            Navigate with Arrows
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {levels.map((level, idx) => {
            const isFocused    = idx === focusedIndex;
            const isCompleted  = level.status === 'completed';
            const isActive     = level.status === 'active';
            const isLocked     = level.status === 'locked';

            return (
              <motion.div
                key={level.id}
                animate={{
                  scale: isFocused ? 1.02 : 1,
                  borderColor: isFocused
                    ? 'rgba(6,182,212,0.5)'
                    : isCompleted
                    ? 'rgba(34,197,94,0.2)'
                    : 'rgba(255,255,255,0.05)',
                }}
                className={`p-6 bg-[#0f172a]/80 backdrop-blur-xl rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                  isFocused
                    ? 'bg-cyan-400/5 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                    : isLocked
                    ? 'opacity-50 cursor-not-allowed'
                    : 'opacity-90'
                }`}
                onClick={() => {
                  onFocusChange(idx);
                  onSelect(level);
                }}
              >
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex flex-col gap-1">
                    <span
                      className={`text-[10px] font-black tracking-widest uppercase ${
                        isFocused ? 'text-cyan-400' : 'text-white/40'
                      }`}
                    >
                      Level {String(level.id).padStart(2, '0')}
                    </span>
                    <h3
                      className={`text-xl font-bold ${
                        isFocused ? 'text-white' : 'text-white/80'
                      }`}
                    >
                      {level.name}
                    </h3>
                  </div>

                  {/* Status indicator */}
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : isActive ? (
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                  ) : isLocked ? (
                    <Lock className="w-4 h-4 text-white/20" />
                  ) : null}
                </div>

                <div className="flex items-center justify-between relative z-10 gap-3 flex-wrap">
                  <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">
                    {level.concept}
                  </p>
                  <div className="flex items-center gap-2">
                    {/* Difficulty badge */}
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        DIFFICULTY_COLOR[level.difficulty] ?? 'text-white/40 bg-white/5 border-white/10'
                      }`}
                    >
                      {level.difficulty}
                    </span>
                    {/* Email count */}
                    <div className="px-2 py-1 bg-white/5 rounded-md flex items-center gap-1.5 border border-white/5">
                      <Mail className="w-3 h-3 text-white/40" />
                      <span className="text-[10px] font-bold text-white/60">
                        {level.email_count} Emails
                      </span>
                    </div>
                  </div>
                </div>

                {/* XP + coins row */}
                <div className="flex items-center gap-4 mt-3 relative z-10">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                    <Zap className="w-3 h-3" />+{level.xp_reward} XP
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-400">
                    <Coins className="w-3 h-3" />+{level.coins_reward}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-white/30">
                    <Clock className="w-3 h-3" />~{level.est_minutes}m
                  </span>
                </div>

                {/* Focused highlight overlay */}
                {isFocused && (
                  <motion.div
                    layoutId="focus-indicator"
                    className="absolute inset-0 bg-cyan-400/5 pointer-events-none"
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Vault Rewards Banner ───────────────────────────────────────────── */}
      <section className="px-4">
        <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 max-w-5xl mx-auto rounded-3xl p-8 md:p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 blur-[100px] group-hover:bg-cyan-400/20 transition-colors" />

          <div className="relative flex flex-col md:flex-row items-center gap-12">
            {/* Badge preview */}
            <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 to-purple-500/20 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative w-40 h-40 rounded-full flex items-center justify-center bg-[#0a0a0f] border-4 border-white/5 overflow-hidden">
                <Trophy className="w-16 h-16 text-amber-400/40 grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm group-hover:opacity-0 transition-opacity">
                  <Lock className="w-8 h-8 text-white/40" />
                </div>
              </div>
              <div className="absolute -bottom-2 bg-[#0a0a0f] px-6 py-2 rounded-full border border-white/10 shadow-xl">
                <span className="text-xs font-black tracking-tight text-white/40 group-hover:text-amber-400 transition-colors uppercase">
                  {meta.badge_name} 🥉
                </span>
              </div>
            </div>

            <div className="hidden md:block h-24 w-px bg-white/10" />

            {/* Text */}
            <div className="flex-1 space-y-6 text-center md:text-left">
              <div>
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                  Vault Completion Reward
                </div>
                <h3 className="text-3xl font-black mb-2 tracking-tight uppercase">
                  Clearance Badge Earned
                </h3>
                <p className="text-white/60 text-sm">
                  Complete all {meta.total_levels} levels to earn your official clearance badge and permanent XP boost.
                </p>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
                <div className="flex flex-col items-start">
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    Vault 01 Bonus
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-black text-cyan-400 font-mono">
                      +{meta.total_xp} XP
                    </span>
                    <span className="text-2xl font-black text-amber-400 font-mono">
                      +{meta.total_coins} COINS
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
