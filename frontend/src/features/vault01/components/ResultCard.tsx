/**
 * ResultCard — Full Redesign
 * Military debrief screen. Cold and clinical for FAIL, clean system-confirmation for PASS.
 * All numbers animate/count up on mount. Reward tiles stagger in on PASS.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Clock,
  Target,
  RotateCcw,
  ArrowRight,
  Heart,
  Mail,
  Coins,
  ShieldCheck,
  ShieldX,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  formatTime,
  isPassing,
  PASS_THRESHOLD,
  PASS_HEALTH_BONUS,
  buildDebriefRows,
} from '../utils/scoring';
import type { SubmitAnswerResponse, LevelWithTeaching, Level, LevelEmail } from '../types/vault01.types';

interface ResultCardProps {
  level: LevelWithTeaching;
  result: SubmitAnswerResponse;
  emails: LevelEmail[];
  nextLevel: Level | null;
  elapsedSeconds: number;
  health: number;
  onReplay?: () => void;
  onBackToMap: () => void;
  onNextLevel: () => void;
}

// ── Animated counter hook ─────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1500, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const startTime = performance.now() + delay;
    let raf: number;
    const tick = (now: number) => {
      if (now < startTime) { raf = requestAnimationFrame(tick); return; }
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay]);
  return value;
}

// ── Segmented health bar ──────────────────────────────────────────────────────
function HealthBar({ hp, prevHp, passed, maxHp = 100 }: { hp: number; prevHp: number; passed: boolean; maxHp?: number }) {
  const segments = 10;
  const filled = Math.ceil((hp / maxHp) * segments);
  const [flickered, setFlickered] = useState(false);

  useEffect(() => {
    if (!passed) {
      const t = setTimeout(() => setFlickered(true), 400);
      const t2 = setTimeout(() => setFlickered(false), 900);
      return () => { clearTimeout(t); clearTimeout(t2); };
    }
  }, [passed]);

  const getSegmentColor = (i: number) => {
    if (i >= filled) return 'bg-white/5';
    const pct = (hp / maxHp) * 100;
    if (!passed && flickered) return 'bg-red-500/80 shadow-[0_0_8px_#ef4444]';
    if (pct > 70) return 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]';
    if (pct > 40) return 'bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.6)]';
    if (pct > 20) return 'bg-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.6)]';
    return 'bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.6)]';
  };

  const textColor = (hp / maxHp) > 0.7 ? 'text-green-400' : (hp / maxHp) > 0.4 ? 'text-yellow-400' : (hp / maxHp) > 0.2 ? 'text-orange-400' : 'text-red-400';

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className={`w-4 h-4 ${textColor}`} strokeWidth={2.5} />
          <span className={`text-[10px] font-black font-mono uppercase tracking-widest ${textColor}`}>Integrity Levels</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xl font-black font-mono ${textColor}`}>{hp}</span>
          <span className="text-xs text-white/30 font-mono">/ {maxHp} HP</span>
          <span className={`text-xs font-bold font-mono ml-1 ${passed ? 'text-green-400' : 'text-red-400/60'}`}>
            {passed ? `+${PASS_HEALTH_BONUS} HP` : '0 HP'}
          </span>
        </div>
      </div>
      <div className="flex gap-1 items-end">
        {Array.from({ length: segments }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0.5, opacity: 0 }}
            animate={{ scaleY: i < filled ? 1 : 0.6, opacity: i < filled ? 1 : 0.2 }}
            transition={{ delay: passed ? 0.8 + i * 0.05 : 0.2, duration: 0.3 }}
            className={`h-3 flex-1 rounded-[2px] transition-all duration-300 ${getSegmentColor(i)}`}
          />
        ))}
      </div>
    </div>
  );
}

// ── Reward tile ───────────────────────────────────────────────────────────────
function RewardTile({ icon: Icon, label, value, unit, color, delay }: {
  icon: React.ElementType; label: string; value: number; unit?: string;
  color: 'amber' | 'yellow' | 'green'; delay: number;
}) {
  const counted = useCountUp(value, 1200, delay + 200);
  const colors = {
    amber:  { text: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/25',  glow: 'shadow-[0_0_20px_rgba(245,158,11,0.1)]'   },
    yellow: { text: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/25', glow: 'shadow-[0_0_20px_rgba(250,204,21,0.1)]'    },
    green:  { text: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/25',  glow: 'shadow-[0_0_20px_rgba(74,222,128,0.1)]'    },
  }[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.35, ease: 'easeOut' }}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${colors.bg} ${colors.border} ${colors.glow}`}
    >
      <Icon className={`w-5 h-5 ${colors.text}`} strokeWidth={2} />
      <span className={`text-2xl font-black font-mono ${colors.text} tabular-nums`}>
        +{counted}{unit}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 font-mono">{label}</span>
    </motion.div>
  );
}

// ── Stat chip ─────────────────────────────────────────────────────────────────
function StatChip({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-4 py-3 bg-white/3 border border-white/8 rounded-xl flex-1">
      <Icon className="w-4 h-4 text-white/30" strokeWidth={1.5} />
      <span className="text-white/80 font-mono text-sm font-black tabular-nums">{value}</span>
      <span className="text-[9px] font-bold uppercase tracking-widest text-white/30 font-mono">{label}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ResultCard({ level, result, emails, nextLevel, elapsedSeconds, health, onReplay, onBackToMap, onNextLevel }: ResultCardProps) {
  const passed = isPassing(result.accuracy);
  const currentHp = Math.max(0, health);
  const prevHp = passed ? Math.max(0, currentHp - PASS_HEALTH_BONUS) : currentHp;

  const circumference = 2 * Math.PI * 64;
  const [ringOffset, setRingOffset] = useState(circumference);
  const accuracyCounted = useCountUp(Math.round(result.accuracy), 1800, 300);
  const [debriefOpen, setDebriefOpen] = useState(!passed); // auto-open on fail

  useEffect(() => {
    const target = circumference - (result.accuracy / 100) * circumference;
    const t = setTimeout(() => setRingOffset(target), 200);
    return () => clearTimeout(t);
  }, [result.accuracy, circumference]);

  const borderColor = passed ? 'border-cyan-400/20' : 'border-red-500/20';

  // Build debrief rows from per_email_results joined with email data
  const debriefRows = buildDebriefRows(result.per_email_results ?? [], emails);
  const wrongRows   = debriefRows.filter((r) => !r.isCorrect);
  const correctRows = debriefRows.filter((r) => r.isCorrect);

  return (
    <main className="relative z-10 flex flex-col min-h-screen w-screen overflow-y-auto bg-[#0a0a0f]">
      {/* Dot grid */}
      <div className="fixed inset-0 pointer-events-none opacity-40"
        style={{ backgroundImage: 'radial-gradient(rgba(6,182,212,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      {/* Scan lines */}
      <div className="fixed inset-0 pointer-events-none z-10"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px)' }} />

      <div className="relative z-20 flex flex-col gap-0 max-w-2xl mx-auto w-full px-4 py-6">

        {/* ── PASS / FAIL Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`relative w-full overflow-hidden rounded-t-2xl border-t-4 ${
            passed ? 'border-t-cyan-400 bg-cyan-400/5 border border-cyan-400/20' : 'border-t-red-500 bg-red-500/5 border border-red-500/20'
          }`}
        >
          <div className="flex flex-col items-center py-5 px-6 text-center relative z-10">
            {passed ? <ShieldCheck className="w-6 h-6 text-cyan-400 mb-2" strokeWidth={1.5} /> : <ShieldX className="w-6 h-6 text-red-400 mb-2" strokeWidth={1.5} />}
            <span className={`text-xs font-black tracking-[0.25em] uppercase font-mono mb-2 ${passed ? 'text-cyan-400' : 'text-red-400'}`}>
              {passed ? '[ THREAT NEUTRALISED ]' : '[ SECURITY BREACH DETECTED ]'}
            </span>
            <h1 className="text-xl font-black text-white tracking-tight uppercase">
              Level {String(level.id).padStart(2, '0')} — {level.name}
            </h1>
          </div>
          <div className={`absolute inset-0 pointer-events-none ${passed ? 'bg-gradient-to-b from-cyan-400/8 to-transparent' : 'bg-gradient-to-b from-red-500/8 to-transparent'}`} />
        </motion.div>

        {/* ── Accuracy Ring (Hero) ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className={`flex flex-col items-center gap-4 py-8 px-6 border-x ${
            passed ? 'border-cyan-400/20 bg-cyan-400/3' : 'border-red-500/20 bg-red-500/3'
          }`}
        >
          <div className="relative flex items-center justify-center" style={{ width: 172, height: 172 }}>
            <div className="absolute inset-0 rounded-full pointer-events-none" style={{
              boxShadow: passed
                ? '0 0 50px 8px rgba(6,182,212,0.15), 0 0 100px 20px rgba(6,182,212,0.06)'
                : '0 0 50px 8px rgba(239,68,68,0.15), 0 0 100px 20px rgba(239,68,68,0.06)',
            }} />
            <svg width="172" height="172" viewBox="0 0 172 172" className="-rotate-90">
              <circle cx="86" cy="86" r="64" stroke={passed ? 'rgba(6,182,212,0.1)' : 'rgba(239,68,68,0.1)'} strokeWidth="8" fill="transparent" />
              <circle
                cx="86" cy="86" r="64"
                stroke={passed ? '#06b6d4' : '#ef4444'}
                strokeWidth="8" fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={ringOffset}
                strokeLinecap="round"
                style={{
                  filter: passed
                    ? 'drop-shadow(0 0 10px rgba(6,182,212,0.9)) drop-shadow(0 0 24px rgba(6,182,212,0.5))'
                    : 'drop-shadow(0 0 10px rgba(239,68,68,0.9)) drop-shadow(0 0 24px rgba(239,68,68,0.5))',
                  transition: 'stroke-dashoffset 2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <span className={`text-4xl font-black font-mono tabular-nums ${passed ? 'text-cyan-400' : 'text-red-400'}`}>
                {accuracyCounted}<span className="text-xl text-white/40">%</span>
              </span>
            </div>
          </div>

          <div className={`px-5 py-1.5 rounded-full border text-xs font-black tracking-widest uppercase font-mono ${
            passed ? 'bg-cyan-400/15 border-cyan-400/40 text-cyan-400' : 'bg-red-500/15 border-red-500/40 text-red-400'
          }`}>
            {passed ? '✓ PASSED' : '✕ FAILED'}
          </div>

          {!passed && (
            <p className="text-xs text-white/40 font-mono text-center max-w-xs leading-relaxed">
              Score <span className="text-red-400">{result.accuracy}%</span> — minimum{' '}
              <span className="text-white/60">{PASS_THRESHOLD}%</span> required to earn rewards
            </p>
          )}
        </motion.div>

        {/* ── Reward / Fail Section ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`px-6 py-5 border-x ${borderColor}`}
        >
          {passed ? (
            <div className="grid grid-cols-3 gap-3">
              <RewardTile icon={Zap}   label="XP Earned"     value={result.xp_earned}   color="amber"  delay={400} />
              <RewardTile icon={Coins} label="Pulse Credits" value={result.coins_earned} color="yellow" delay={600} />
              <RewardTile icon={Heart} label="HP Restored"   value={PASS_HEALTH_BONUS}  unit=" HP" color="green" delay={800} />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 py-3 px-4 bg-red-500/8 border border-red-500/20 rounded-xl"
            >
              <ShieldX className="w-5 h-5 text-red-400 shrink-0" strokeWidth={1.5} />
              <span className="text-xs font-black uppercase tracking-widest font-mono text-red-400">
                [ NO REWARDS — REPLAY TO EARN ]
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* ── Health Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`px-6 py-5 border-x ${borderColor}`}
        >
          <HealthBar hp={currentHp} prevHp={prevHp} passed={passed} />
        </motion.div>

        {/* ── Stats Row ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`flex gap-2 px-6 py-5 border-x border-b ${borderColor}`}
        >
          <StatChip icon={Clock}  label="Time"     value={formatTime(elapsedSeconds)} />
          <StatChip icon={Mail}   label="Emails"   value={String(level.email_count)} />
          <StatChip icon={Target} label="Accuracy" value={`${result.accuracy}%`} />
        </motion.div>

        {/* ── Debrief Section ── */}
        {debriefRows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`border-x border-b rounded-b-none ${borderColor} overflow-hidden`}
          >
            {/* Collapsible header */}
            <button
              onClick={() => setDebriefOpen((o) => !o)}
              className="w-full flex items-center justify-between px-6 py-4 bg-white/3 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest font-mono text-white/60">
                  Email Debrief
                </span>
                {wrongRows.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[9px] font-black font-mono uppercase tracking-widest">
                    {wrongRows.length} mistake{wrongRows.length !== 1 ? 's' : ''}
                  </span>
                )}
                {wrongRows.length === 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-[9px] font-black font-mono uppercase tracking-widest">
                    Perfect
                  </span>
                )}
              </div>
              {debriefOpen
                ? <ChevronUp className="w-4 h-4 text-white/30" />
                : <ChevronDown className="w-4 h-4 text-white/30" />
              }
            </button>

            {debriefOpen && (
              <div className="divide-y divide-white/5">
                {/* Wrong answers first */}
                {wrongRows.map((row) => (
                  <div key={row.emailId} className="px-6 py-4 flex gap-4 items-start bg-red-500/3">
                    <div className="mt-0.5 shrink-0">
                      {row.tag === 'MISSED_THREAT'
                        ? <XCircle className="w-4 h-4 text-red-400" />
                        : <AlertTriangle className="w-4 h-4 text-amber-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-bold text-white/90 truncate">{row.subject}</span>
                        <span className={`text-[9px] font-black font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                          row.tag === 'MISSED_THREAT'
                            ? 'bg-red-500/15 border-red-500/30 text-red-400'
                            : 'bg-amber-400/15 border-amber-400/30 text-amber-400'
                        }`}>
                          {row.tag === 'MISSED_THREAT' ? 'Missed Threat' : 'False Alarm'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-white/40 mb-1.5">
                        <span>You: <span className={row.userGuess ? 'text-red-400' : 'text-green-400'}>{row.userGuess ? 'Phishing' : 'Safe'}</span></span>
                        <span className="text-white/20">→</span>
                        <span>Correct: <span className={row.correctAnswer ? 'text-red-400' : 'text-green-400'}>{row.correctAnswer ? 'Phishing' : 'Safe'}</span></span>
                      </div>
                      <p className="text-[11px] text-white/50 leading-relaxed">{row.reason}</p>
                    </div>
                  </div>
                ))}

                {/* Correct answers recap */}
                {correctRows.map((row) => (
                  <div key={row.emailId} className="px-6 py-3 flex gap-4 items-start">
                    <div className="mt-0.5 shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-green-400/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-medium text-white/50 truncate">{row.subject}</span>
                        <span className={`text-[9px] font-black font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                          row.tag === 'THREAT_BLOCKED'
                            ? 'bg-cyan-400/10 border-cyan-400/20 text-cyan-400/70'
                            : 'bg-green-500/10 border-green-500/20 text-green-400/70'
                        }`}>
                          {row.tag === 'THREAT_BLOCKED' ? 'Threat Blocked' : 'Safe Verified'}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/30 mt-0.5 leading-relaxed">{row.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Action Buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="flex flex-col gap-3 mt-5"
        >
          {passed ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onBackToMap}
                className="flex-1 border border-white/15 text-white/50 hover:text-white hover:border-white/30 font-black uppercase tracking-widest rounded-xl px-6 py-3 bg-transparent transition-all text-[10px] font-mono flex items-center justify-center gap-2"
              >
                ← Back to Vault Map
              </button>
              {nextLevel && result.next_level_unlocked && (
                <button
                  onClick={onNextLevel}
                  className="flex-1 px-8 py-3 rounded-xl flex items-center justify-center gap-3 bg-cyan-400 text-black font-black uppercase tracking-widest text-[10px] font-mono shadow-[0_0_24px_rgba(6,182,212,0.5)] hover:shadow-[0_0_36px_rgba(6,182,212,0.7)] hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Next Level <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onReplay}
              className="w-full border-2 border-red-500 text-red-400 hover:bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.2)] px-6 py-3.5 rounded-xl text-[10px] uppercase font-black tracking-widest font-mono flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Replay Level — Aim for {PASS_THRESHOLD}%
            </button>
          )}
        </motion.div>
      </div>
    </main>
  );
}