/**
 * RedScreen
 * Full-screen danger view shown instantly when the user marks a phishing email as Safe
 * (MISSED_THREAT). Shows the specific offending email — sender, subject, dangerous links,
 * red flags, and attack timeline — all derived from that email.
 *
 * No "Continue" option. The only action is [ RESET LEVEL ], which calls onRetry and
 * restarts the simulation from email 1 with health restored to what it was at level entry.
 */

import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Clock,
  Search,
  RotateCcw,
  AlertTriangle,
  Mail,
  Link2,
  User,
} from 'lucide-react';
import type { LevelEmail } from '../types/vault01.types';

interface RedScreenProps {
  levelName: string;
  redFlags: Array<{ label: string; explanation: string; highlight?: string }>;
  attackTimeline: Array<{ time: string; event: string; is_critical?: boolean }>;
  /** The specific phishing email that was incorrectly marked as Safe */
  missedEmail: LevelEmail | null;
  onRetry: () => void;
}

export default function RedScreen({
  levelName,
  redFlags,
  attackTimeline,
  missedEmail,
  onRetry,
}: RedScreenProps) {
  // Build red flags from missedEmail if none passed from submit result
  const displayFlags =
    redFlags.length > 0
      ? redFlags
      : missedEmail
      ? [
          {
            label: 'Suspicious sender address',
            explanation: `The email came from ${missedEmail.address} — always verify the sender domain before clicking anything.`,
            highlight: missedEmail.address,
          },
          ...missedEmail.links
            .filter((l) => l.is_dangerous)
            .map((l) => ({
              label: 'Dangerous link detected',
              explanation: `The link "${l.display_text}" leads to ${l.real_url} — a malicious destination designed to steal credentials.`,
              highlight: l.display_text,
            })),
        ]
      : [];

  const dangerousLinks = missedEmail?.links.filter((l) => l.is_dangerous) ?? [];

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
              You Missed The Threat
            </h1>
            <p className="text-white/70 text-lg">
              You marked a phishing email as <span className="text-red-400 font-bold">Safe</span>.
              Here is what would have happened in real life:
            </p>
          </div>

          {/* ── Offending email card ──────────────────────────────────── */}
          {missedEmail && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="bg-[#1A0505] border border-red-500/50 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden"
            >
              {/* Top glow line */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />

              <h3 className="text-xs font-black tracking-widest text-red-400 uppercase flex items-center gap-2">
                <Mail className="w-4 h-4" /> The Email You Missed
              </h3>

              {/* Sender row */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${missedEmail.avatar_color}`}
                >
                  {missedEmail.sender.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm">{missedEmail.sender}</span>
                    <span className="flex items-center gap-1 text-xs text-red-400/80 font-mono bg-red-500/10 border border-red-500/20 rounded px-2 py-0.5">
                      <User className="w-3 h-3" />
                      {missedEmail.address}
                    </span>
                  </div>
                  <p className="text-white/50 text-xs">{missedEmail.time}</p>
                </div>
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black tracking-widest text-white/30 uppercase">Subject</span>
                <p className="text-white font-bold text-base leading-snug">{missedEmail.subject}</p>
              </div>

              {/* Dangerous links */}
              {dangerousLinks.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black tracking-widest text-red-400/70 uppercase">
                    Dangerous Links ({dangerousLinks.length})
                  </span>
                  <div className="flex flex-col gap-2">
                    {dangerousLinks.map((link, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg"
                      >
                        <Link2 className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-sm font-bold text-white/90 truncate">
                            {link.display_text}
                          </span>
                          <span className="text-xs text-red-400/70 font-mono truncate">
                            → {link.real_url}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Two panels: timeline + red flags ────────────────────────── */}
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
                  <>
                    <div className="flex gap-4"><span className="text-red-500/60 font-mono text-sm w-12 shrink-0 pt-0.5">0:00</span><span className="text-white/80">You marked the email as Safe</span></div>
                    <div className="flex gap-4"><span className="text-red-500/60 font-mono text-sm w-12 shrink-0 pt-0.5">0:05</span><span className="text-white/80">Clicked the embedded link</span></div>
                    <div className="flex gap-4"><span className="text-red-500/60 font-mono text-sm w-12 shrink-0 pt-0.5">0:47</span><span className="text-white/80">Entered credentials on fake page</span></div>
                    <div className="flex gap-4 border-l-2 border-red-500/40 pl-3"><span className="text-red-500/60 font-mono text-sm w-12 shrink-0 pt-0.5">1:00</span><span className="text-red-400 font-bold">Attacker received your data</span></div>
                    <div className="flex gap-4"><span className="text-red-500/60 font-mono text-sm w-12 shrink-0 pt-0.5">2:00</span><span className="text-white/80">Account fully compromised</span></div>
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
                {displayFlags.length > 0 ? (
                  displayFlags.map((flag, i) => (
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
                  <p className="text-white/40 text-sm">Red flag details will appear here.</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Bottom action — RESET LEVEL only, no continue ──────────── */}
          <div className="flex flex-col items-center gap-4 mt-4 pb-8">
            <p className="text-[10px] uppercase font-bold tracking-widest text-white/30 text-center">
              Study the red flags above — then restart from email 1
            </p>
            <button
              onClick={onRetry}
              className="flex items-center gap-3 px-10 py-4 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 transition-all text-white font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_40px_rgba(220,38,38,0.6)]"
            >
              <RotateCcw className="w-5 h-5" />
              [ RESET LEVEL ]
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