/**
 * EmailViewer
 * Right panel of the Gmail simulation — shows the open email.
 * Contains: toolbar, email header, HTML body, hover link detection,
 * the Safe / Phishing decision bar at the bottom, and the feedback overlay.
 * Uses real user data from authStore for avatar letter.
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Archive,
  AlertTriangle,
  Trash2,
  Mail,
  Clock,
  Star,
  MoreVertical,
  ChevronRight,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  Check,
  HeartCrack,
  Search,
} from 'lucide-react';
import CustomShield from '@/components/CustomShield';
import HoverLinkModal from './HoverLinkModal';
import { useAuthStore } from '@/store/authStore';
import type { LevelEmail, SessionAnswer, EmailLink } from '../types/vault01.types';

interface EmailViewerProps {
  email: LevelEmail;
  emails: LevelEmail[];
  feedbackState: 'none' | 'correct' | 'incorrect';
  sessionAnswer?: SessionAnswer;
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
  onAnswer: (emailId: number, guess: boolean) => void;
  onDismissFeedback: () => void;
  onSeeRedScreen: () => void;
  onShowToast: (msg: string) => void;
  currentIndex: number;
  totalCount: number;
}

/** Strip white/light backgrounds and dark text colors from inline styles in email HTML */
function sanitizeEmailHtml(html: string): string {
  return html
    .replace(/background\s*:\s*(white|#fff|#ffffff|#FFF|#FFFFFF)\b/gi, 'background:#151929')
    .replace(/background-color\s*:\s*(white|#fff|#ffffff|#FFF|#FFFFFF)\b/gi, 'background-color:#151929')
    .replace(/\bcolor\s*:\s*black\b/gi, 'color:rgba(255,255,255,0.85)')
    .replace(/\bcolor\s*:\s*#000\b/gi, 'color:rgba(255,255,255,0.85)')
    .replace(/\bcolor\s*:\s*#000000\b/gi, 'color:rgba(255,255,255,0.85)')
    .replace(/\bcolor\s*:\s*#333\b/gi, 'color:rgba(255,255,255,0.7)')
    .replace(/\bcolor\s*:\s*#666\b/gi, 'color:rgba(255,255,255,0.4)')
    .replace(/bgcolor\s*=\s*["']?(white|#fff|#ffffff)["']?/gi, 'bgcolor="#151929"');
}

export default function EmailViewer({
  email,
  emails,
  feedbackState,
  sessionAnswer,
  onBack,
  onPrev,
  onNext,
  onAnswer,
  onDismissFeedback,
  onSeeRedScreen,
  onShowToast,
  currentIndex,
  totalCount,
}: EmailViewerProps) {
  const { user } = useAuthStore();
  const [hoveredLink, setHoveredLink] = useState<EmailLink | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const bodyRef = useRef<HTMLDivElement>(null);

  const avatarLetter = user?.name?.charAt(0).toUpperCase() ?? 'U';
  const isAnswered = !!sessionAnswer;

  // ── Link hover detection ──────────────────────────────────────────────────
  const handleMouseOver = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (!anchor) { setHoveredLink(null); return; }

    const hrefAttr = anchor.getAttribute('href') ?? '';
    // Match against known links
    const match = email.links.find(
      (l) =>
        l.display_text.toLowerCase().includes(anchor.textContent?.toLowerCase() ?? '') ||
        anchor.getAttribute('data-link-id') === String(l.display_text)
    );

    if (match) {
      setHoveredLink(match);
      setHoverPos({ x: e.clientX, y: e.clientY });
    } else if (hrefAttr && hrefAttr !== '#') {
      // Fallback: show the href
      setHoveredLink({ display_text: anchor.textContent ?? '', real_url: hrefAttr, is_dangerous: false });
      setHoverPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseOut = (e: React.MouseEvent) => {
    const target = e.relatedTarget as HTMLElement | null;
    if (!target?.closest('a')) setHoveredLink(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (hoveredLink) setHoverPos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#1a1f2e] relative w-full">

      {/* ── Action toolbar ──────────────────────────────────────────────── */}
      <div className="flex items-center h-16 px-3 border-b border-[#2d3452] shrink-0">
        <div className="flex items-center gap-0">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-transparent border border-cyan-400/30 hover:bg-[#3c4043] hover:border-cyan-400/60 transition-colors mr-1"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 text-[#9aa0a6]" />
          </button>
          {[Archive, AlertTriangle, Trash2, Mail, Clock].map((Icon, i) => (
            <button
              key={i}
              onClick={() => onShowToast('Action disabled in simulation mode.')}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-transparent border border-cyan-400/30 hover:bg-[#3c4043] hover:border-cyan-400/60 transition-colors"
            >
              <Icon className="w-5 h-5 text-[#9aa0a6]" />
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1 text-[#9aa0a6]">
          <span className="text-xs mr-2">{currentIndex + 1} of {totalCount}</span>
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-transparent border border-cyan-400/30 hover:bg-[#3c4043] hover:border-cyan-400/60 transition-colors disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <button
            onClick={onNext}
            disabled={currentIndex === totalCount - 1}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-transparent border border-cyan-400/30 hover:bg-[#3c4043] hover:border-cyan-400/60 transition-colors disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => onShowToast('More options disabled in simulation.')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-transparent border border-cyan-400/30 hover:bg-[#3c4043] hover:border-cyan-400/60 transition-colors ml-1"
          >
            <MoreVertical className="w-5 h-5 text-[#9aa0a6]" />
          </button>
        </div>
      </div>

      {/* ── Email body ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pb-36">
        <div className="px-16 py-6 max-w-[900px]">

          {/* Subject + badges */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <h2 className="text-[26px] font-normal text-[#e3e3e3] leading-tight flex-1 min-w-0">
              {email.subject}
            </h2>
            <span className="flex items-center gap-1 bg-[#3c4043] text-[#9aa0a6] text-xs px-3 py-1 rounded-full cursor-pointer hover:bg-[#55575a] shrink-0">
              Inbox ✕
            </span>
          </div>

          {/* Sender info */}
          <div className="flex items-start gap-3 mb-8">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shrink-0 mt-1 ${email.avatar_color}`}
            >
              {email.sender.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 min-w-0 flex-wrap">
                  <span className="font-semibold text-[#e3e3e3] text-sm">{email.sender}</span>
                  <span className="text-[#9aa0a6] text-xs truncate">
                    &lt;{email.address}&gt;
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0 text-[#9aa0a6]">
                  <span className="text-xs whitespace-nowrap mr-2">{email.time} (1 hour ago)</span>
                  <button className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent border border-cyan-400/30 hover:bg-[#3c4043] hover:border-cyan-400/60 transition-colors">
                    <Star className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onShowToast('Reply is disabled in simulation mode.')}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent border border-cyan-400/30 hover:bg-[#3c4043] hover:border-cyan-400/60 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent border border-cyan-400/30 hover:bg-[#3c4043] hover:border-cyan-400/60 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button className="flex items-center gap-1 mt-0.5 group">
                <span className="text-xs text-[#9aa0a6]">to me</span>
                <ChevronRight className="w-3 h-3 text-[#9aa0a6] rotate-90 group-hover:text-[#e3e3e3] transition-colors" />
              </button>
            </div>
          </div>

          {/* HTML email content — link hover detection */}
          <div
            ref={bodyRef}
            className="text-sm text-[#e3e3e3] leading-[1.7] font-sans"
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            onMouseMove={handleMouseMove}
            dangerouslySetInnerHTML={{ __html: sanitizeEmailHtml(email.content_html) }}
          />

          {/* Reply / Forward (disabled) */}
          <div className="flex items-center gap-3 mt-12 flex-wrap">
            {['Reply', 'Forward'].map((label, i) => (
              <button
                key={label}
                onClick={() => onShowToast(`${label} is disabled in simulation mode.`)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#5f6368] text-[#e3e3e3] text-sm hover:bg-[#3c4043] transition-colors opacity-60 cursor-not-allowed"
              >
                {i === 0 ? <RotateCcw className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Decision bar ────────────────────────────────────────────────── */}
      <div className="absolute bottom-0 inset-x-0 bg-[#1a1f2e]/95 border-t border-[#2d3452] backdrop-blur-sm px-4 py-3 z-40">
        <div className="max-w-[500px] mx-auto space-y-2">
          <div className="flex justify-center">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-cyan-400/70 bg-cyan-400/5 border border-cyan-400/20 px-4 py-1.5 rounded-full">
              <CustomShield size={14} className="text-cyan-400" strokeWidth={1.5} />
              {isAnswered ? 'You already classified this email' : 'Inspect links before deciding'}
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => !isAnswered && onAnswer(email.id, false)}
              disabled={isAnswered}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm uppercase tracking-wide transition-all ${
                isAnswered
                  ? 'bg-white/5 text-white/20 cursor-not-allowed'
                  : 'bg-green-500/20 border border-green-500/40 text-green-400 hover:bg-green-500/30 hover:border-green-400/60 shadow-[0_0_12px_rgba(34,197,94,0.15)]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" /> Safe
            </button>
            <button
              onClick={() => !isAnswered && onAnswer(email.id, true)}
              disabled={isAnswered}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm uppercase tracking-wide transition-all ${
                isAnswered
                  ? 'bg-white/5 text-white/20 cursor-not-allowed'
                  : 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 hover:border-red-400/60 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
              }`}
            >
              <AlertTriangle className="w-4 h-4" /> Phishing
            </button>
          </div>
        </div>
      </div>

      {/* ── Link hover tooltip ──────────────────────────────────────────── */}
      <HoverLinkModal link={hoveredLink} x={hoverPos.x} y={hoverPos.y} />

      {/* ── Feedback overlay ────────────────────────────────────────────── */}
      <AnimatePresence>
        {feedbackState !== 'none' && (
          <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 260 }}
              className="w-full max-w-md bg-[#131320] border border-white/10 rounded-2xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.8)] relative overflow-hidden"
            >
              {feedbackState === 'correct' ? (
                <>
                  <div className="absolute top-0 inset-x-0 h-1 bg-green-500 shadow-[0_0_20px_rgba(16,185,129,0.8)]" />
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-4 relative">
                      <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-20" />
                      <Check className="w-10 h-10" strokeWidth={3} />
                    </div>
                    <h3 className="text-xl font-black text-green-400 uppercase tracking-wider mb-2">
                      Correct — Identified
                    </h3>
                    <div className="bg-amber-400/10 border border-amber-400/20 text-amber-400 px-4 py-1.5 rounded-full font-black text-lg mb-6 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                      +{sessionAnswer?.xp_gained ?? 0} XP
                    </div>
                    <div className="flex items-center justify-between w-full pt-4 border-t border-white/10 mt-2">
                      <span className="text-xs font-bold text-white/40">Keep going →</span>
                      <button
                        onClick={onDismissFeedback}
                        className="text-[11px] uppercase font-bold text-cyan-400 tracking-widest hover:text-white transition-colors"
                      >
                        Continue →
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="absolute top-0 inset-x-0 h-1 bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                      <AlertTriangle className="w-10 h-10 text-red-400" />
                    </div>
                    <h3 className="text-xl font-black text-red-400 uppercase tracking-wider mb-2">
                      Missed — This Was Phishing
                    </h3>
                    <div className="flex items-center gap-2 text-red-400 font-black text-lg mb-6 bg-red-400/10 px-4 py-1.5 rounded-full border border-red-400/20">
                      <HeartCrack className="w-5 h-5" /> -10 Health
                    </div>
                    <p className="text-white/80 font-medium leading-relaxed mb-4 max-w-md">
                      You marked this as safe, but it is an attack. Hover the links to check their real destination.
                    </p>
                    <div className="flex items-center justify-center gap-4 w-full pt-4 border-t border-white/5">
                      <button
                        onClick={onDismissFeedback}
                        className="px-6 py-3 border border-white/20 rounded-xl text-xs uppercase font-bold text-white/60 hover:bg-white/5 transition-colors"
                      >
                        Continue
                      </button>
                      <button
                        onClick={onSeeRedScreen}
                        className="px-6 py-3 bg-cyan-400 rounded-xl text-xs uppercase font-bold text-black hover:bg-cyan-300 shadow-[0_0_16px_rgba(6,182,212,0.4)] transition-all hover:scale-105 active:scale-95"
                      >
                        See Damage →
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}