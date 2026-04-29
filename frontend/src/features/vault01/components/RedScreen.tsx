/**
 * RedScreen
 * Full-screen danger view shown when user falls for a phishing email.
 * Shows attack timeline + red flags pulled from rules.json via submit result.
 * Uses CustomShield and real user data.
 */

import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Clock,
  Search,
  RotateCcw,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import CustomShield from '@/components/CustomShield';
import type { SubmitAnswerResponse } from '../types/vault01.types';

interface RedScreenProps {
  levelName: string;
  // Rules data comes from the submit result OR from pre-loaded rules for the level
  redFlags: Array<{ label: string; explanation: string; highlight?: string }>;
  attackTimeline: Array<{ time: string; event: string; is_critical?: boolean }>;
  onRetry: () => void;
  onContinue: () => void;
}

export default function RedScreen({
  levelName,
  redFlags,
  attackTimeline,
  onRetry,
  onContinue,
}: RedScreenProps) {
  return (
    <main className="relative z-50 flex flex-col h-screen w-screen overflow-hidden bg-[#0D0000] text-[#e3e3e3]">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between h-14 px-6 border-b border-red-500/30 bg-[#0D0000]/90 backdrop-blur-sm z-10">
        <span className="font-black text-[18px] tracking-tighter italic uppercase">
          PHISH<span className="text-cyan-400">PULSE</span>
        </span>
        <span className="text-xs font-black tracking-widest uppercase text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Phishing Detected — Training Consequence Active
        </span>
        <div />
      </div>

      {/* ── Scrollable content ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto z-10">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">

          {/* Hero */}
          <div className="flex flex-col items-center text-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/40 blur-[50px] rounded-full animate-pulse" />
              <ShieldAlert className="w-20 h-20 text-red-400 relative z-10" strokeWidth={1} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-red-400 tracking-tight">
              You Clicked The Phishing Link
            </h1>
            <p className="text-white/70 text-lg">
              Here is what would have happened in real life:
            </p>
          </div>

          {/* Two panels */}
          <div className="grid md:grid-cols-2 gap-6 w-full">

            {/* Attack timeline */}
            <div className="bg-[#1A0A0A] border border-red-500/40 rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-red-500/5 pointer-events-none" />
              <h3 className="text-xs font-black tracking-widest text-red-400 uppercase flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-400/80" /> Attack Timeline
              </h3>
              <div className="space-y-4 flex-1">
                {attackTimeline.length > 0 ? (
                  attackTimeline.map((entry, i) => (
                    <div
                      key={i}
                      className={`flex gap-4 ${
                        entry.is_critical ? 'border-l-2 border-red-500/40 pl-3' : ''
                      }`}
                    >
                      <span className="text-red-500/60 font-mono text-sm w-12 shrink-0 pt-0.5">
                        {entry.time}
                      </span>
                      <span
                        className={`font-medium ${
                          entry.is_critical ? 'text-red-400 font-bold' : 'text-white/80'
                        }`}
                      >
                        {entry.event}
                      </span>
                    </div>
                  ))
                ) : (
                  // Fallback generic timeline if rules not loaded yet
                  <>
                    <div className="flex gap-4"><span className="text-red-500/60 font-mono text-sm w-12 shrink-0 pt-0.5">0:00</span><span className="text-white/80">You clicked the link</span></div>
                    <div className="flex gap-4"><span className="text-red-500/60 font-mono text-sm w-12 shrink-0 pt-0.5">0:05</span><span className="text-white/80">Landed on a convincing fake page</span></div>
                    <div className="flex gap-4"><span className="text-red-500/60 font-mono text-sm w-12 shrink-0 pt-0.5">0:47</span><span className="text-white/80">Entered your credentials</span></div>
                    <div className="flex gap-4 border-l-2 border-red-500/40 pl-3"><span className="text-red-500/60 font-mono text-sm w-12 shrink-0 pt-0.5">1:00</span><span className="text-red-400 font-bold">Attacker received your data</span></div>
                    <div className="flex gap-4"><span className="text-red-500/60 font-mono text-sm w-12 shrink-0 pt-0.5">2:00</span><span className="text-white/80">Your account fully compromised</span></div>
                  </>
                )}
              </div>
              <div className="bg-red-500/10 border-l-4 border-red-500 p-4 mt-2">
                <p className="text-red-400 font-black text-sm uppercase tracking-wider">
                  Total damage: Full compromise in minutes
                </p>
              </div>
            </div>

            {/* Red flags */}
            <div className="bg-[#0A0A1A] border border-cyan-400/30 rounded-2xl p-6 md:p-8 flex flex-col gap-6">
              <h3 className="text-xs font-black tracking-widest text-cyan-400 uppercase flex items-center gap-2">
                <Search className="w-4 h-4" /> Red Flags In That Email
              </h3>
              <div className="space-y-4 flex-1">
                {redFlags.length > 0 ? (
                  redFlags.map((flag, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 p-3 bg-white/5 rounded-lg border border-white/5 hover:border-cyan-400/30 transition-colors"
                    >
                      <Search className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-bold text-white block mb-1">
                          {flag.highlight ? `"${flag.highlight}"` : flag.label}
                        </span>
                        <span className="text-sm text-white/60">{flag.explanation}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-white/40 text-sm">Red flag details will appear after submission.</p>
                )}
              </div>
            </div>
          </div>

          {/* Bottom actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between w-full mt-6 gap-6">
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-6 py-4 rounded-xl border border-red-500/40 hover:bg-red-500/10 hover:border-red-500 transition-all text-red-400/90 font-bold uppercase tracking-widest text-[11px] w-full sm:w-auto justify-center"
            >
              <RotateCcw className="w-4 h-4" />
              Try This Email Again
            </button>

            <p className="text-[10px] uppercase font-bold tracking-widest text-white/40 order-3 sm:order-none mt-4 sm:mt-0 text-center">
              No XP lost — this is how you learn
            </p>

            <button
              onClick={onContinue}
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-black uppercase tracking-tighter shadow-xl w-full sm:w-auto justify-center transition-all hover:scale-105 active:scale-95"
            >
              I Understand — Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-[60] overflow-hidden">
        <motion.div
          animate={{ y: ['-100%', '200%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="w-full h-32 bg-gradient-to-b from-transparent via-red-500/30 to-transparent"
        />
      </div>
    </main>
  );
}
