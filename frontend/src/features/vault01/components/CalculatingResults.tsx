/**
 * CalculatingResults
 * 5-second cinematic interstitial shown after API resolves and before result card appears.
 * Cold, technical, military-debrief aesthetic matching PhishPulse design language.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_LINES = [
  '> Analysing email decisions...',
  '> Cross-referencing threat database...',
  '> Calculating integrity score...',
  '> Generating debrief report...',
];

// Timings (ms) at which each status line appears
const LINE_DELAYS = [400, 1300, 2400, 3400];

// Progress ring counts to 100% over 4000ms
const RING_DURATION = 4000;
const CIRCUMFERENCE = 2 * Math.PI * 54; // r=54

interface CalculatingResultsProps {
  onComplete: () => void; // called after 5s (handled by parent, but we also animate the flash)
}

export default function CalculatingResults({ onComplete }: CalculatingResultsProps) {
  const [progress, setProgress] = useState(0);
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [flash, setFlash] = useState(false);

  // Animate progress ring 0→100 over RING_DURATION
  useEffect(() => {
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, Math.round((elapsed / RING_DURATION) * 100));
      setProgress(pct);
      if (elapsed < RING_DURATION) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Reveal status lines sequentially
  useEffect(() => {
    const timers = LINE_DELAYS.map((delay, i) =>
      setTimeout(() => setVisibleLines((prev) => [...prev, i]), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // White flash at ~4.6s, then call onComplete at 5s
  useEffect(() => {
    const flashTimer = setTimeout(() => setFlash(true), 4600);
    const doneTimer = setTimeout(() => {
      setFlash(false);
      onComplete();
    }, 5000);
    return () => {
      clearTimeout(flashTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  const strokeOffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  return (
    <motion.main
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0f] overflow-hidden"
    >
      {/* Dot-grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(6,182,212,0.12) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/5 blur-[180px] rounded-full pointer-events-none" />

      {/* White flash overlay */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute inset-0 bg-white z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Scan-line overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
        }}
      />

      {/* Core content */}
      <div className="relative z-20 flex flex-col items-center gap-10">
        {/* Progress ring */}
        <div className="relative flex items-center justify-center" style={{ width: 148, height: 148 }}>
          {/* Outer glow ring */}
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.04, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full"
            style={{ boxShadow: '0 0 40px 10px rgba(6,182,212,0.15)' }}
          />

          <svg width="148" height="148" viewBox="0 0 148 148" className="transform -rotate-90">
            {/* Track */}
            <circle
              cx="74" cy="74" r="54"
              stroke="rgba(6,182,212,0.12)"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Progress arc */}
            <circle
              cx="74" cy="74" r="54"
              stroke="#06b6d4"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(6,182,212,0.8)) drop-shadow(0 0 20px rgba(6,182,212,0.4))',
                transition: 'stroke-dashoffset 0.05s linear',
              }}
            />
          </svg>

          {/* Center icon + percentage */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            {/* Pulsing shield icon */}
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                {/* Scanning eye inside */}
                <ellipse cx="12" cy="12" rx="3" ry="2" />
                <circle cx="12" cy="12" r="1" fill="#06b6d4" />
              </svg>
            </motion.div>
            <span className="text-cyan-400 font-mono text-lg font-black tabular-nums leading-none">
              {progress}<span className="text-xs text-cyan-400/60">%</span>
            </span>
          </div>
        </div>

        {/* Status lines */}
        <div className="flex flex-col gap-3 min-w-[320px]">
          {STATUS_LINES.map((line, i) => (
            <AnimatePresence key={i}>
              {visibleLines.includes(i) && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="flex items-center gap-2"
                >
                  <TypewriterLine text={line} speed={28} />
                  {i === visibleLines[visibleLines.length - 1] && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.7, repeat: Infinity }}
                      className="text-cyan-400 font-mono text-sm"
                    >
                      _
                    </motion.span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>

        {/* Bottom label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-3 mt-2"
        >
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-cyan-400"
          />
          <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white/30 font-mono">
            PhishPulse Analysis Engine v2.1
          </span>
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }}
            className="w-1.5 h-1.5 rounded-full bg-cyan-400"
          />
        </motion.div>
      </div>
    </motion.main>
  );
}

// Simple typewriter text component
function TypewriterLine({ text, speed = 30 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span className="text-sm font-mono text-cyan-400/80 tracking-wide">
      {displayed}
    </span>
  );
}