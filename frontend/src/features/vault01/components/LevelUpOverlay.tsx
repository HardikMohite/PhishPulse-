/**
 * LevelUpOverlay
 * Full-screen "system reboot" overlay shown when a player's profile level increases.
 * Cold, technical aesthetic — scan lines, static flicker, then clean restoration.
 * Auto-dismisses after 5 seconds or on [ CONTINUE ] click.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MAX_HP } from '@/store/authStore';

interface LevelUpOverlayProps {
  newLevel: number;
  newXp: number;
  prevHp: number;           // HP before the full restore
  onDismiss: () => void;
}

// XP required to reach a given level (mirrors backend: level = xp // 100 + 1)
function xpForLevel(level: number): number {
  return (level - 1) * 100;
}

// ── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 32, delay = 0) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const start = setTimeout(() => {
      const iv = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(iv);
        }
      }, speed);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(start);
  }, [text, speed, delay]);
  return displayed;
}

// ── Animated HP bar fill ──────────────────────────────────────────────────────
function HpFillBar({ from, to = MAX_HP }: { from: number; to?: number }) {
  const [current, setCurrent] = useState(from);
  const segments = 20;

  useEffect(() => {
    const start = performance.now();
    const duration = 1800;
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCurrent(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => { raf = requestAnimationFrame(tick); }, 600);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [from, to]);

  const filled = Math.round((current / MAX_HP) * segments);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black font-mono uppercase tracking-widest text-green-400/70">
          Integrity Levels
        </span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-black font-mono text-green-400 tabular-nums">{current}</span>
          <span className="text-xs text-white/30 font-mono">/ {MAX_HP} HP</span>
          <span className="text-xs font-bold font-mono text-green-400 ml-1">FULL RESTORE</span>
        </div>
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: segments }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0.4, opacity: 0 }}
            animate={{
              scaleY: i < filled ? 1 : 0.4,
              opacity: i < filled ? 1 : 0.12,
            }}
            transition={{
              delay: 0.6 + i * 0.04,
              duration: 0.25,
              ease: 'easeOut',
            }}
            className={`h-3 flex-1 rounded-[2px] transition-colors duration-300 ${
              i < filled
                ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.7)]'
                : 'bg-white/5'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ── Countdown ring ────────────────────────────────────────────────────────────
function CountdownRing({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  const circumference = 2 * Math.PI * 20;

  useEffect(() => {
    const iv = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) { clearInterval(iv); onDone(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [onDone]);

  const offset = circumference * (remaining / seconds);

  return (
    <div className="relative w-10 h-10 flex items-center justify-center">
      <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
        <circle cx="20" cy="20" r="20" stroke="rgba(6,182,212,0.1)" strokeWidth="3" fill="transparent" />
        <circle
          cx="20" cy="20" r="20"
          stroke="#06b6d4"
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.9s linear' }}
        />
      </svg>
      <span className="absolute text-[10px] font-black font-mono text-cyan-400 tabular-nums">{remaining}</span>
    </div>
  );
}

// ── Particle dots ─────────────────────────────────────────────────────────────
function Particles() {
  const dots = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 2,
    dur: Math.random() * 2 + 1.5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((d) => (
        <motion.div
          key={d.id}
          className="absolute rounded-full bg-cyan-400"
          style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.size, height: d.size }}
          animate={{ opacity: [0, 0.8, 0], y: [0, -30, -60] }}
          transition={{ delay: d.delay, duration: d.dur, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LevelUpOverlay({ newLevel, newXp, prevHp, onDismiss }: LevelUpOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<'flicker' | 'reveal'>('flicker');
  const systemLine = useTypewriter('> SYSTEM INTEGRITY RESTORED', 36, 800);
  const rebootLine = useTypewriter('> FULL HEALTH RESTORE INITIATED...', 30, 1400);

  // XP bar progress
  const xpThisLevel = newXp - xpForLevel(newLevel);
  const xpPerLevel = 100;
  const [xpBarWidth, setXpBarWidth] = useState(0);

  // 1.5s delay so result card is visible first
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  // Flicker phase: 600ms of static, then reveal
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setPhase('reveal'), 650);
    return () => clearTimeout(t);
  }, [visible]);

  useEffect(() => {
    if (phase !== 'reveal') return;
    const t = setTimeout(() => {
      setXpBarWidth(Math.min((xpThisLevel / xpPerLevel) * 100, 100));
    }, 1000);
    return () => clearTimeout(t);
  }, [phase, xpThisLevel]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] bg-[#0a0a0f] flex items-center justify-center overflow-hidden"
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(6,182,212,0.1) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Scan-line overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)',
          }}
        />

        {/* Particles */}
        <Particles />

        {/* Static flicker phase */}
        <AnimatePresence>
          {phase === 'flicker' && (
            <motion.div
              initial={{ opacity: 0.7 }}
              animate={{ opacity: [0.7, 0.3, 0.9, 0.2, 0.8, 0] }}
              transition={{ duration: 0.6, times: [0, 0.15, 0.3, 0.5, 0.75, 1] }}
              className="absolute inset-0 z-20 pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(6,182,212,0.06) 1px, rgba(6,182,212,0.06) 2px)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Sweeping scan line */}
        <motion.div
          initial={{ top: '-5%' }}
          animate={{ top: '105%' }}
          transition={{ duration: 1.2, delay: 0.5, ease: 'linear' }}
          className="absolute left-0 right-0 h-[2px] bg-cyan-400/30 z-20 pointer-events-none"
          style={{ boxShadow: '0 0 20px 6px rgba(6,182,212,0.15)' }}
        />

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: phase === 'reveal' ? 1 : 0, scale: phase === 'reveal' ? 1 : 0.95 }}
          transition={{ duration: 0.4, delay: phase === 'reveal' ? 0.1 : 0 }}
          className="relative z-30 flex flex-col items-center gap-8 px-8 w-full max-w-lg"
        >
          {/* Top label */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-cyan-400/20" />
            <span className="text-[9px] font-black font-mono tracking-[0.3em] uppercase text-cyan-400/50">
              PhishPulse System Event
            </span>
            <div className="h-px flex-1 bg-cyan-400/20" />
          </div>

          {/* Level badge — hero element */}
          <div className="relative flex items-center justify-center">
            {/* Pulsing glow rings */}
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.1 + i * 0.08, 1], opacity: [0.4 - i * 0.1, 0.15 - i * 0.03, 0.4 - i * 0.1] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
                className="absolute border border-cyan-400/30 rounded-full"
                style={{ width: `${120 + i * 50}px`, height: `${120 + i * 50}px` }}
              />
            ))}

            {/* Badge */}
            <div className="relative w-36 h-36 flex flex-col items-center justify-center bg-[#0a0a0f] border-2 border-cyan-400/60 rounded-full"
              style={{ boxShadow: '0 0 40px rgba(6,182,212,0.3), inset 0 0 30px rgba(6,182,212,0.05)' }}>
              <span className="text-[9px] font-black font-mono tracking-[0.2em] text-cyan-400/60 uppercase mb-1">
                LEVEL
              </span>
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
                className="text-5xl font-black font-mono text-cyan-400 tabular-nums"
                style={{ textShadow: '0 0 30px rgba(6,182,212,0.8), 0 0 60px rgba(6,182,212,0.4)' }}
              >
                {String(newLevel).padStart(2, '0')}
              </motion.span>
            </div>
          </div>

          {/* Status lines */}
          <div className="flex flex-col gap-2 w-full">
            <p className="text-sm font-mono text-cyan-400/80 tracking-wide min-h-[20px]">
              {systemLine}
              {systemLine.length < '> SYSTEM INTEGRITY RESTORED'.length && (
                <span className="animate-pulse">_</span>
              )}
            </p>
            <p className="text-xs font-mono text-white/40 tracking-wide min-h-[18px]">
              {rebootLine}
              {rebootLine.length > 0 && rebootLine.length < '> FULL HEALTH RESTORE INITIATED...'.length && (
                <span className="animate-pulse">_</span>
              )}
            </p>
          </div>

          {/* HP bar — fills from prevHp to 100 */}
          <div className="w-full">
            <HpFillBar from={prevHp} to={MAX_HP} />
          </div>

          {/* XP bar */}
          <div className="w-full flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black font-mono uppercase tracking-widest text-white/30">
                XP Progress
              </span>
              <span className="text-xs font-mono text-cyan-400/70">
                {newXp} XP — Level {newLevel}
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-cyan-400 rounded-full"
                style={{ boxShadow: '0 0 8px rgba(6,182,212,0.6)', width: `${xpBarWidth}%`, transition: 'width 1.4s cubic-bezier(0.16,1,0.3,1)' }}
              />
            </div>
          </div>

          {/* Reward chips */}
          <div className="flex gap-3 w-full">
            {[
              { label: 'New Level', value: `LVL ${String(newLevel).padStart(2, '0')}`, color: 'text-cyan-400', bg: 'bg-cyan-400/8 border-cyan-400/20' },
              { label: 'HP Restored', value: `${MAX_HP} HP`, color: 'text-green-400', bg: 'bg-green-400/8 border-green-400/20' },
            ].map((chip) => (
              <motion.div
                key={chip.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8, duration: 0.3 }}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border font-mono ${chip.bg}`}
              >
                <span className={`text-lg font-black ${chip.color}`}>{chip.value}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">{chip.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Continue button + countdown */}
          <div className="flex items-center gap-4 mt-2">
            <CountdownRing seconds={5} onDone={onDismiss} />
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={onDismiss}
              className="px-8 py-3 border-2 border-cyan-400 text-cyan-400 font-black uppercase tracking-widest text-[10px] font-mono rounded-xl bg-transparent hover:bg-cyan-400/10 transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)]"
            >
              [ CONTINUE ]
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}