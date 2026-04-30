/**
 * EmailSimulation
 * Full Gmail-clone inbox simulation.
 *
 * REFACTOR CHANGES:
 * - Accepts `answers` (Record<string, AnswerRecord>) and `health` from hook
 * - Health badge placed between Search bar and Timer in header
 * - Submit bar removed entirely (auto-submit in hook)
 * - InboxCard receives answerRecord (not legacy sessionAnswer)
 * - Answered rows are locked — no re-selection
 * - feedbackState / onDismissFeedback kept for EmailViewer compat
 */

import {
  Menu,
  Search,
  Inbox,
  Star,
  Clock,
  Send,
  FileText,
  RotateCcw,
  ChevronRight,
  MoreVertical,
  AlertTriangle,
  ArrowLeft,
  Heart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomShield from '@/components/CustomShield';
import InboxCard from './InboxCard';
import EmailViewer from './EmailViewer';
import { useAuthStore } from '@/store/authStore';
import type { LevelEmail, SessionAnswer, LevelWithTeaching } from '../types/vault01.types';
import type { AnswerRecord } from '../hooks/useVault01';

interface EmailSimulationProps {
  level: LevelWithTeaching;
  emails: LevelEmail[];
  selectedEmailId: number | null;
  answers: Record<string, AnswerRecord>;
  sessionAnswers: SessionAnswer[];          // kept for EmailViewer compat
  feedbackState: 'none' | 'correct' | 'threat-blocked' | 'false-alarm';
  showProfilePanel: boolean;
  toastMsg: string | null;
  allAnswered: boolean;
  submitting: boolean;
  elapsedSeconds: number;
  health: number;
  onSelectEmail: (id: number) => void;
  onBackToList: () => void;
  onAnswer: (emailId: number, guess: boolean) => void;
  onDismissFeedback: () => void;
  onSeeRedScreen: () => void;
  onToggleProfile: () => void;
  onSubmit: () => void;
  onBackToMap: () => void;
  onShowToast: (msg: string) => void;
}

function HealthBadge({ health }: { health: number }) {
  const color =
    health > 60
      ? 'border-cyan-400/60 text-cyan-400'
      : health > 40
      ? 'border-yellow-400/60 text-yellow-400'
      : 'border-red-400/60 text-red-400';

  return (
    <div className={`hidden sm:flex items-center gap-1.5 bg-[#303134] border ${color} px-3 py-1.5 rounded-full text-xs font-bold font-mono`}>
      <Heart className="w-3 h-3 fill-current" />
      HEALTH {health}
    </div>
  );
}

export default function EmailSimulation({
  level,
  emails,
  selectedEmailId,
  answers,
  sessionAnswers,
  feedbackState,
  showProfilePanel,
  toastMsg,
  allAnswered,
  submitting,
  elapsedSeconds,
  health,
  onSelectEmail,
  onBackToList,
  onAnswer,
  onDismissFeedback,
  onSeeRedScreen,
  onToggleProfile,
  onSubmit,
  onBackToMap,
  onShowToast,
}: EmailSimulationProps) {
  const { user } = useAuthStore();
  const avatarLetter = user?.name?.charAt(0).toUpperCase() ?? 'U';
  const selectedEmail = emails.find((e) => e.id === selectedEmailId) ?? null;
  const selectedIndex = selectedEmail ? emails.indexOf(selectedEmail) : -1;
  const answeredCount = Object.keys(answers).length;

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <main className="flex flex-col h-screen w-screen overflow-hidden bg-[#202124] text-[#e3e3e3]">

      {/* ── Gmail top header ──────────────────────────────────────────── */}
      <div className="flex items-center h-16 px-4 gap-3 shrink-0 bg-[#202124] border-b border-[#3c4043]">
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-transparent hover:bg-[#3c4043] transition-colors shrink-0">
          <Menu className="w-5 h-5 text-[#e3e3e3]" />
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2 w-[200px] shrink-0">
          <CustomShield size={28} className="text-cyan-400" strokeWidth={1.5} />
          <span className="font-black text-[20px] tracking-tighter italic leading-none uppercase">
            <span className="text-white">PHISH</span><span className="text-cyan-400">PULSE</span>
          </span>
          <span className="text-[#9aa0a6] text-sm font-normal not-italic ml-0.5">Mail</span>
        </div>

        {/* Search bar */}
        <div className="flex-1 max-w-[720px] mx-auto">
          <div className="flex items-center bg-[#303134] hover:bg-[#3c4043] focus-within:bg-[#3c4043] rounded-2xl h-12 px-4 gap-3 transition-colors">
            <Search className="w-5 h-5 text-[#9aa0a6] shrink-0" />
            <input
              type="text"
              placeholder="Search mail"
              className="flex-1 bg-transparent border-none outline-none text-[#e3e3e3] placeholder:text-[#9aa0a6] text-base font-normal"
              readOnly
              onClick={() => onShowToast('Search is disabled in simulation mode.')}
            />
          </div>
        </div>

        {/* Right side: [HEALTH] [Timer] [Level Badge] [Avatar] */}
        <div className="flex items-center gap-3 ml-auto shrink-0">
          {/* Health badge — NEW, sits between search and timer */}
          <HealthBadge health={health} />

          {/* Timer */}
          <div className="hidden sm:flex items-center gap-2 bg-[#303134] border border-[#5f6368] text-[#9aa0a6] px-3 py-1.5 rounded-full text-xs font-mono">
            <Clock className="w-3.5 h-3.5" />
            {formatTimer(elapsedSeconds)}
          </div>

          {/* Level chip */}
          <div className="hidden sm:flex items-center gap-2 bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
            Level {String(level.id).padStart(2, '0')}
            <span className="text-cyan-400/40">·</span>
            {answeredCount}/{emails.length}
          </div>

          {/* Avatar */}
          <button
            onClick={onToggleProfile}
            className="w-9 h-9 rounded-full bg-cyan-400 flex items-center justify-center font-bold text-black text-sm shrink-0 hover:ring-2 hover:ring-cyan-400/50 transition-all"
          >
            {avatarLetter}
          </button>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Left sidebar */}
        <div className="w-[256px] shrink-0 flex flex-col pt-2 overflow-y-auto hidden md:flex bg-[#202124]">
          {/* Compose button */}
          <div className="px-2 mb-2">
            <button
              onClick={() => onShowToast('Compose is disabled in simulation mode.')}
              className="flex items-center gap-3 bg-[#c2e7ff] hover:bg-[#d3eeff] active:bg-[#a8cfee] text-[#001d35] rounded-[18px] pl-4 pr-8 h-[56px] w-auto transition-all cursor-not-allowed shadow-[0_1px_3px_rgba(0,0,0,0.3),0_4px_8px_rgba(0,0,0,0.2)] hover:shadow-[0_1px_3px_rgba(0,0,0,0.4),0_6px_12px_rgba(0,0,0,0.25)]"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#001d35" />
              </svg>
              <span className="font-medium text-[14px] tracking-wide">Compose</span>
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex flex-col mt-2 pr-4">
            {[
              { icon: Inbox,    label: 'Inbox',   count: emails.length, active: true  },
              { icon: Star,     label: 'Starred', count: null, active: false },
              { icon: Clock,    label: 'Snoozed', count: null, active: false },
              { icon: Send,     label: 'Sent',    count: null, active: false },
              { icon: FileText, label: 'Drafts',  count: null, active: false },
            ].map(({ icon: Icon, label, count, active }) => (
              <div
                key={label}
                onClick={active ? undefined : () => onShowToast(`${label} is disabled in simulation mode.`)}
                className={`flex items-center justify-between pl-6 pr-4 rounded-r-full cursor-pointer transition-colors h-[32px] ${
                  active ? 'bg-[#414549] font-semibold' : 'hover:bg-[#35363a]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon className={`w-[18px] h-[18px] ${active ? 'text-[#e3e3e3]' : 'text-[#e3e3e3]/70'}`} />
                  <span className={`text-sm ${active ? 'text-[#e3e3e3] font-semibold' : 'text-[#e3e3e3]'}`}>{label}</span>
                </div>
                {count !== null && <span className="text-xs font-bold text-[#e3e3e3]">{count}</span>}
              </div>
            ))}
          </nav>

          <div className="mt-auto px-6 py-4 border-t border-[#3c4043]">
            <p className="text-[11px] text-[#9aa0a6]">Signed in as</p>
            <p className="text-[11px] text-cyan-400 font-semibold truncate">
              {user?.email ?? 'trainee@phishpulse.com'}
            </p>
          </div>

          <div className="px-4 pb-4">
            <button
              onClick={onBackToMap}
              className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-cyan-400 text-cyan-400 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-cyan-400/10 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Vault
            </button>
          </div>
        </div>

        {/* Email list */}
        <div className={`flex flex-col bg-[#202124] min-h-0 ${selectedEmailId ? 'hidden' : 'flex-1 w-full'}`}>
          {/* Toolbar */}
          <div className="flex items-center h-14 px-4 gap-2 border-b border-[#3c4043] shrink-0 bg-[#202124]">
            <div className="flex items-center gap-0.5">
              <div className="w-4 h-4 border-2 border-[#9aa0a6] rounded-sm cursor-pointer hover:border-[#e3e3e3] transition-colors" />
              <ChevronRight className="w-3.5 h-3.5 text-[#9aa0a6] rotate-90 cursor-pointer" />
            </div>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent hover:bg-[#3c4043] transition-colors ml-1">
              <RotateCcw className="w-4 h-4 text-[#9aa0a6]" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent hover:bg-[#3c4043] transition-colors">
              <MoreVertical className="w-4 h-4 text-[#9aa0a6]" />
            </button>
            <div className="flex-1" />
            <span className="text-xs text-[#9aa0a6]">1–{emails.length} of {emails.length}</span>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#3c4043] shrink-0 bg-[#202124]">
            <button className="flex items-center gap-2 px-4 py-3 border-b-2 border-[#8ab4f8] text-[#8ab4f8] text-sm font-medium">
              <Inbox className="w-4 h-4" /> Primary
            </button>
            <button
              onClick={() => onShowToast('Promotions tab is disabled in simulation mode.')}
              className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-[#9aa0a6] text-sm hover:text-[#e3e3e3] hover:bg-[#35363a] transition-colors"
            >
              Promotions
              <span className="bg-[#4caf50] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">41 new</span>
            </button>
            <button
              onClick={() => onShowToast('Social tab is disabled in simulation mode.')}
              className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-[#9aa0a6] text-sm hover:text-[#e3e3e3] hover:bg-[#35363a] transition-colors"
            >
              Social
              <span className="bg-[#1a73e8] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">50 new</span>
            </button>
            <button
              onClick={() => onShowToast('Updates tab is disabled in simulation mode.')}
              className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-[#9aa0a6] text-sm hover:text-[#e3e3e3] hover:bg-[#35363a] transition-colors"
            >
              Updates
              <span className="bg-[#1a73e8] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">50 new</span>
            </button>
          </div>

          {/* Email rows */}
          <div className="flex-1 overflow-y-auto">
            {emails.map((email) => (
              <InboxCard
                key={email.id}
                email={email}
                isSelected={selectedEmailId === email.id}
                answerRecord={answers[String(email.id)]}
                onClick={() => onSelectEmail(email.id)}
              />
            ))}
          </div>

          {/* Auto-submit indicator — replaces manual submit bar */}
          <AnimatePresence>
            {allAnswered && submitting && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="border-t border-cyan-400/30 bg-[#0a0a1a] px-6 py-4 flex items-center justify-center gap-3"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full"
                />
                <p className="text-sm text-cyan-400 font-bold uppercase tracking-widest">
                  Analysing results...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Email viewer */}
        {selectedEmail && (
          <EmailViewer
            email={selectedEmail}
            emails={emails}
            feedbackState={feedbackState}
            answerRecord={answers[String(selectedEmail.id)]}
            sessionAnswer={sessionAnswers.find((a) => a.email_id === selectedEmail.id)}
            onBack={onBackToList}
            onPrev={() => {
              const idx = emails.indexOf(selectedEmail);
              if (idx > 0) onSelectEmail(emails[idx - 1].id);
            }}
            onNext={() => {
              const idx = emails.indexOf(selectedEmail);
              if (idx < emails.length - 1) onSelectEmail(emails[idx + 1].id);
            }}
            onAnswer={onAnswer}
            onDismissFeedback={onDismissFeedback}
            onSeeRedScreen={onSeeRedScreen}
            onShowToast={onShowToast}
            currentIndex={selectedIndex}
            totalCount={emails.length}
          />
        )}
      </div>

      {/* Profile panel */}
      <AnimatePresence>
        {showProfilePanel && (
          <>
            <div className="fixed inset-0 z-40" onClick={onToggleProfile} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              className="fixed top-16 right-3 w-[340px] bg-[#282a2d] border border-[#3c4043] rounded-3xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="text-center py-4 px-4 border-b border-[#3c4043]">
                <p className="text-xs text-[#9aa0a6] font-medium">{user?.email ?? 'trainee@phishpulse.com'}</p>
                <p className="text-xs text-[#5f6368] mt-0.5">PhishPulse Mail</p>
              </div>
              <div className="flex flex-col items-center py-6 px-4">
                <div className="w-20 h-20 rounded-full bg-cyan-400 flex items-center justify-center font-bold text-black text-3xl mb-3 shadow-lg">
                  {avatarLetter}
                </div>
                <h3 className="text-lg font-medium text-[#e3e3e3]">Hi, {user?.name?.split(' ')[0] ?? 'Trainee'}!</h3>
                <p className="text-xs text-[#9aa0a6] mt-1">{user?.email ?? 'trainee@phishpulse.com'}</p>
                <button
                  onClick={() => onShowToast('Account management is disabled in simulation.')}
                  className="mt-4 px-6 py-2 rounded-full border border-[#5f6368] text-[#e3e3e3] text-sm hover:bg-[#3c4043] transition-colors"
                >
                  Manage your PhishPulse Account
                </button>
              </div>
              <div className="mx-4 mb-4 p-4 bg-[#303134] border border-[#3c4043] rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#e3e3e3] leading-tight">You are in simulation mode</p>
                    <p className="text-xs text-[#9aa0a6] mt-1 leading-relaxed">
                      Compose, Reply, and Forward are disabled. Focus on identifying phishing emails.
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-4 pb-4 pt-1">
                <button
                  onClick={() => { onToggleProfile(); onBackToMap(); }}
                  className="w-full text-center py-2.5 rounded-full border border-[#5f6368] text-[#e3e3e3] text-sm hover:bg-[#3c4043] transition-colors"
                >
                  Exit Simulation
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#3c4043] border border-[#5f6368] text-[#e3e3e3] text-xs font-semibold px-5 py-2.5 rounded-full shadow-xl z-50 pointer-events-none whitespace-nowrap"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}