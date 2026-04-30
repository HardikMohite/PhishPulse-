/**
 * Vault01Page
 * Root page for Vault 01. Orchestrates all views via useVault01 hook.
 * No state lives here — all state is in the hook.
 * Route: /vault01
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ChevronRight,
  Mail,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import CustomShield from '@/components/CustomShield';
import Vault01Intro from '../components/Vault01Intro';
import LevelSelector from '../components/LevelSelector';
import CompletionScreen from '../components/CompletionScreen';
import EmailSimulation from '../components/EmailSimulation';
import RedScreen from '../components/RedScreen';
import ResultCard from '../components/ResultCard';
import { useVault01 } from '../hooks/useVault01';
import { isPassing } from '../utils/scoring';

// Inline loading screen (shown for 3 seconds before simulation)
function LoadingScreen() {
  return (
    <main className="relative z-10 flex flex-col items-center justify-center min-h-screen bg-[#0a0a0f] overflow-hidden gap-8 px-6">
      <div className="absolute inset-0 pointer-events-none opacity-10"
        style={{ backgroundImage: 'radial-gradient(rgba(6,182,212,0.1) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative flex items-center justify-center">
        {[1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.08 + i * 0.07, 1], opacity: [0.6 - i * 0.2, 1 - i * 0.2, 0.6 - i * 0.2] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
            className={`absolute border-2 border-cyan-400/${i === 1 ? '20' : '10'} rounded-full`}
            style={{ width: `${i * 80 + 80}px`, height: `${i * 80 + 80}px` }}
          />
        ))}
        <div className="relative w-24 h-24 bg-cyan-400/10 border-2 border-cyan-400/40 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.3)]">
          <Mail className="w-12 h-12 text-cyan-400" strokeWidth={1.5} />
        </div>
      </div>

      <div className="text-center space-y-3 relative z-10">
        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
          Initializing Email Inbox Simulation
        </h2>
        <p className="text-white/40 text-sm font-medium tracking-wide">
          Preparing your PhishPulse inbox environment...
        </p>
      </div>

      <div className="w-72 h-1.5 bg-white/10 rounded-full overflow-hidden relative z-10">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2.8, ease: 'easeInOut' }}
          className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] rounded-full"
        />
      </div>

      <div className="flex items-center gap-3 relative z-10">
        {['Loading emails', 'Injecting threats', 'Arming sensors'].map((label, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.8 }}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40"
          >
            <motion.div
              animate={{ backgroundColor: ['rgba(6,182,212,0.3)', 'rgba(6,182,212,1)', 'rgba(6,182,212,0.3)'] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.8 }}
              className="w-2 h-2 rounded-full bg-cyan-400/30"
            />
            {label}
          </motion.div>
        ))}
      </div>
    </main>
  );
}

export default function Vault01Page() {
  const hook = useVault01();
  const [resetConfirm, setResetConfirm] = useState(false);

  // ── Loading / error states ────────────────────────────────────────────────
  if (hook.pageLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <CustomShield size={48} className="text-cyan-400 animate-pulse" strokeWidth={1.5} />
          <p className="text-white/40 text-sm font-medium uppercase tracking-widest">Loading Vault 01...</p>
        </div>
      </div>
    );
  }

  if (hook.error || !hook.meta) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400" />
          <p className="text-white font-bold">{hook.error ?? 'Something went wrong'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 border border-cyan-400 text-cyan-400 rounded-xl font-bold uppercase tracking-wider hover:bg-cyan-400/10 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Full-screen views (no map chrome) ─────────────────────────────────────
  if (hook.view === 'loading') return <LoadingScreen />;

  if (hook.view === 'simulate' && hook.selectedLevel) {
    return (
      <EmailSimulation
        level={hook.selectedLevel}
        emails={hook.emails}
        selectedEmailId={hook.selectedEmailId}
        answers={hook.answers}
        sessionAnswers={hook.sessionAnswers}
        feedbackState={
          hook.selectedEmailId !== null && hook.answers[String(hook.selectedEmailId)] &&
          !hook.answers[String(hook.selectedEmailId)].pending
            ? hook.feedbackState
            : 'none'
        }
        showProfilePanel={hook.showProfilePanel}
        toastMsg={hook.toastMsg}
        allAnswered={hook.allAnswered}
        submitting={hook.submitting}
        elapsedSeconds={hook.elapsedSeconds}
        health={hook.health}
        onSelectEmail={hook.setSelectedEmailId}
        onBackToList={() => hook.setSelectedEmailId(null)}
        onAnswer={(emailId, guess) => hook.handleAnswer(emailId, guess)}
        onDismissFeedback={() => {
          hook.setFeedbackState('none');
          hook.setSelectedEmailId(null);
        }}
        onSeeRedScreen={() => hook.setView('red-screen')}
        onToggleProfile={() => hook.setShowProfilePanel((p: boolean) => !p)}
        onSubmit={hook.handleSubmit}
        onBackToMap={() => hook.setView('map')}
        onShowToast={hook.showToast}
      />
    );
  }

  if (hook.view === 'red-screen') {
    // Build red flags from the offending email when submitResult isn't available yet
    const emailForRedScreen = hook.redScreenEmail;
    const redFlags = hook.submitResult?.red_flags ?? (
      emailForRedScreen
        ? [
            {
              label: 'Suspicious sender address',
              explanation: `The email came from ${emailForRedScreen.address} — always verify the sender domain before acting.`,
              highlight: emailForRedScreen.address,
            },
            ...emailForRedScreen.links
              .filter((l) => l.is_dangerous)
              .map((l) => ({
                label: 'Dangerous link detected',
                explanation: `The link "${l.display_text}" leads to ${l.real_url} — a malicious destination.`,
                highlight: l.display_text,
              })),
          ]
        : []
    );
    const attackTimeline = hook.submitResult?.attack_timeline ?? [];

    return (
      <RedScreen
        levelName={hook.selectedLevel?.name ?? ''}
        redFlags={redFlags}
        attackTimeline={attackTimeline}
        onRetry={() => {
          hook.handleRetry();
        }}
        onContinue={() => hook.setView('map')}
      />
    );
  }

  if (hook.view === 'complete' && hook.selectedLevel && hook.submitResult) {
    // Safety guard: 'complete' should only ever be reached on a passing result.
    // If somehow a non-passing result ends up here (e.g. stale state), bounce to map.
    if (!isPassing(hook.submitResult.accuracy)) {
      hook.setView('map');
      return null;
    }

    const nextLevelId = hook.submitResult.next_level_id;
    const nextLevel = nextLevelId ? hook.levels.find((l) => l.id === nextLevelId) ?? null : null;

    return (
      <ResultCard
        level={hook.selectedLevel}
        result={hook.submitResult}
        emails={hook.emails}
        nextLevel={nextLevel}
        elapsedSeconds={hook.elapsedSeconds}
        health={hook.health}
        // onReplay is intentionally omitted on pass — passed levels are locked.
        // ResultCard hides the Replay button when onReplay is undefined and passed=true.
        onBackToMap={() => hook.setView('map')}
        onNextLevel={() => {
          const next = hook.levels.find((l) => l.id === nextLevelId);
          if (next) hook.handleSelectLevel(next);
        }}
      />
    );
  }

  // ── Map chrome (navbar + main content) ───────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden selection:bg-cyan-400/30 selection:text-cyan-400">
      {/* Background effects */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{ backgroundImage: 'radial-gradient(rgba(6,182,212,0.1) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navbar */}
      {hook.view !== 'loading' && hook.view !== 'simulate' && (
        <header className="sticky top-0 z-40 px-4 pt-4">
          <nav className="max-w-7xl mx-auto bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:px-6 flex items-center justify-between">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-cyan-400 blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative w-10 h-10 flex items-center justify-center bg-[#0a0a0f] border border-cyan-400/50 rounded-lg">
                  <CustomShield size={24} className="text-cyan-400" strokeWidth={1.5} />
                </div>
              </div>
              <span className="font-black text-xl tracking-tighter italic uppercase hidden sm:block">
                <span className="text-white">PHISH</span><span className="text-cyan-400">PULSE</span>
              </span>
            </div>

            {/* Reset Vault — map view only */}
            {hook.view === 'map' && (
              <div className="flex items-center">
                <AnimatePresence mode="wait">
                  {!resetConfirm ? (
                    /* ── Default: RESET VAULT button — cyan, hollow ── */
                    <motion.button
                      key="reset-idle"
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 6 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => setResetConfirm(true)}
                      className="flex items-center gap-2 border border-cyan-400 text-cyan-400 bg-transparent hover:bg-cyan-400/10 font-mono font-bold text-[11px] uppercase tracking-widest px-4 py-2 rounded-xl transition-all"
                    >
                      {/* Desktop label */}
                      <RotateCcw className="w-3.5 h-3.5 hidden sm:block" />
                      <span className="hidden sm:inline">Reset Vault</span>
                      {/* Mobile: icon only */}
                      <RotateCcw className="w-4 h-4 sm:hidden" />
                    </motion.button>
                  ) : (
                    /* ── Confirm state: inline, no modal ── */
                    <motion.div
                      key="reset-confirm"
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 6 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-2"
                    >
                      {/* Prompt text — hidden on mobile to save space */}
                      <span className="hidden sm:block font-mono text-[11px] text-white/40 uppercase tracking-widest whitespace-nowrap">
                        Reset all vault progress?
                      </span>

                      {/* Confirm — red, hollow */}
                      <button
                        onClick={() => {
                          setResetConfirm(false);
                          hook.handleResetVault();
                        }}
                        disabled={hook.resetting}
                        className="flex items-center gap-1.5 border border-red-500 text-red-400 bg-transparent hover:bg-red-500/10 font-mono font-bold text-[11px] uppercase tracking-widest px-4 py-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {hook.resetting ? (
                          <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3.5 h-3.5 hidden sm:block" />
                        )}
                        <span className="hidden sm:inline">
                          {hook.resetting ? 'Resetting…' : 'Confirm Reset'}
                        </span>
                        {/* Mobile: just the spinning icon when loading, checkmark otherwise */}
                        {hook.resetting
                          ? <RotateCcw className="w-4 h-4 animate-spin sm:hidden" />
                          : <span className="sm:hidden text-xs">✓</span>
                        }
                      </button>

                      {/* Cancel */}
                      <button
                        onClick={() => setResetConfirm(false)}
                        disabled={hook.resetting}
                        className="border border-white/20 text-white/40 bg-transparent hover:bg-white/5 font-mono font-bold text-[11px] uppercase tracking-widest px-3 py-2 rounded-xl transition-all disabled:opacity-30"
                      >
                        ✕
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

          </nav>
        </header>
      )}

      {/* ── Map view ──────────────────────────────────────────────────────── */}
      {hook.view === 'map' && (
        <main className="max-w-7xl mx-auto px-6 py-12 space-y-24">
          <Vault01Intro
            meta={hook.meta}
            levels={hook.levels}
            onBeginTraining={() => {
              const active = hook.levels.find((l) => l.status === 'active' || l.status === 'unlocked');
              if (active) hook.handleSelectLevel(active);
            }}
          />
          <LevelSelector
            levels={hook.levels}
            meta={hook.meta}
            focusedIndex={hook.focusedIndex}
            onSelect={hook.handleSelectLevel}
            onFocusChange={hook.setFocusedIndex}
          />
        </main>
      )}

      {/* ── Briefing view ─────────────────────────────────────────────────── */}
      {hook.view === 'briefing' && hook.selectedLevel && (
        <main className="relative z-10 flex flex-col justify-center px-4 py-6 max-w-4xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full bg-[#0f172a]/80 backdrop-blur-xl rounded-[2rem] border border-white/10 relative overflow-hidden p-6 md:p-8 mb-4"
          >
            {/* Watermark */}
            <div className="absolute -right-4 -bottom-16 text-[14rem] md:text-[18rem] font-black text-purple-500/5 leading-none select-none pointer-events-none">
              {String(hook.selectedLevel.id).padStart(2, '0')}
            </div>

            <div className="relative z-10 w-full mb-5">
              <div className="text-[10px] font-black text-cyan-400 tracking-widest uppercase mb-4">
                VAULT 01 <span className="opacity-50 mx-2 text-white">›</span> LEVEL {String(hook.selectedLevel.id).padStart(2, '0')}
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-6">
                {hook.selectedLevel.name}
              </h2>
              <div className="h-px w-full bg-gradient-to-r from-cyan-400/50 to-transparent shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
            </div>

            <div className="relative z-10 grid md:grid-cols-[1fr_300px] gap-6">
              {/* Mission brief */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-black text-cyan-400 tracking-widest uppercase bg-cyan-400/10 px-3 py-1.5 rounded-full inline-block border border-cyan-400/20">
                  Mission Briefing
                </h3>
                <ul className="space-y-3">
                  {hook.selectedLevel.teaching_steps
                    .filter((s) => s.type === 'concept' || s.type === 'comparison')
                    .slice(0, 3)
                    .map((s, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <Star className="w-4 h-4 text-cyan-400 fill-cyan-400 mt-0.5 shrink-0" />
                        <p className="text-sm font-medium text-white/80 leading-relaxed">
                          {s.type === 'concept' ? s.body ?? s.title : `Spot the difference: ${s.title}`}
                        </p>
                      </li>
                    ))}
                </ul>
              </div>

              {/* Stakes panel */}
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 relative overflow-hidden">
                  <div className="blur-[3px] pointer-events-none opacity-40 select-none">
                    <div className="w-10 h-10 bg-white/20 rounded-full mb-4" />
                    <div className="h-2 w-1/3 bg-white/40 rounded mb-2" />
                    <div className="h-2 w-full bg-white/20 rounded mb-1" />
                    <div className="h-2 w-5/6 bg-white/20 rounded mb-4" />
                    <div className="h-8 w-full bg-cyan-400/40 rounded mt-4" />
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="flex gap-1 mb-3">
                      {[0, 1, 2].map((i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                    </div>
                    <span className="text-xs font-bold text-white uppercase tracking-widest">
                      {hook.selectedLevel.email_count} Emails to analyse
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between text-[10px] font-bold tracking-widest uppercase">
                    <span className="text-white/50">Reward</span>
                    <span className="text-cyan-400 text-xs">+{hook.selectedLevel.xp_reward} XP</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between text-[10px] font-bold tracking-widest uppercase">
                    <span className="text-white/50">Est. Time</span>
                    <span className="text-amber-400 text-xs">~{hook.selectedLevel.est_minutes} Minutes</span>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3 text-red-400/90 text-[10px] font-bold tracking-widest uppercase leading-snug">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>One wrong click triggers Red Screen</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Briefing buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 w-full px-2 relative z-10">
            <button
              onClick={() => hook.setView('map')}
              className="border-2 border-cyan-400 text-cyan-400 font-black uppercase tracking-tighter rounded-xl px-8 py-3.5 !bg-transparent hover:!bg-cyan-400/10 transition-all flex items-center gap-2 justify-center shadow-[0_0_12px_rgba(6,182,212,0.15)] w-full sm:w-auto"
            >
              ← Back to Vault Map
            </button>
            <motion.button
              onClick={() => {
                hook.setTeachingStep(1);
                hook.setView('teaching');
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-cyan-400 text-cyan-400 font-black uppercase tracking-tighter rounded-xl px-10 py-4 bg-transparent hover:bg-cyan-400/10 transition-all flex items-center justify-center gap-3 w-full sm:w-auto shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            >
              Start Level <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </main>
      )}

      {/* ── Teaching view ─────────────────────────────────────────────────── */}
      {hook.view === 'teaching' && hook.selectedLevel && (
        <CompletionScreen
          level={hook.selectedLevel}
          teachingStep={hook.teachingStep}
          quizAnswered={hook.quizAnswered}
          onStepChange={hook.setTeachingStep}
          onQuizAnswer={(optionId) => {
            if (optionId === '') {
              hook.setQuizAnswered(null);
            } else {
              hook.setQuizAnswered(optionId);
            }
          }}
          onStartSimulation={() => hook.setView('loading')}
          onBack={() => hook.setView('briefing')}
          keyInsight={
            hook.selectedLevel.teaching_steps.find((s) => s.type === 'concept')?.analogy ??
            'Think before you click — urgency is the attacker\'s most powerful weapon.'
          }
        />
      )}

      {/* Toast — shown on map/briefing/teaching */}
      <AnimatePresence>
        {hook.toastMsg && hook.view !== 'simulate' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#0f172a] border border-cyan-400/20 text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-xl z-50 pointer-events-none whitespace-nowrap"
          >
            {hook.toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}