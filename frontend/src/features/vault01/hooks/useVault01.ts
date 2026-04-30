/**
 * useVault01 — Central state hook for Vault 01
 * Manages: view transitions, level data, email simulation, answer tracking, submission.
 *
 * REFACTOR NOTES:
 * - answers stored by email.id (string key), never array index
 * - each email locked after first answer (no re-answer)
 * - health persists across Retry; resets only on fresh level entry from map
 * - auto-submit triggered when all emails answered (800ms delay for last badge)
 * - no manual submit button needed
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getVaultOverview, getLevelDetail, submitAnswers, resetVault, checkAnswer } from '../services/vault01Api';
import { useAuthStore, MAX_HP } from '@/store/authStore';
import { isPassing, PASS_HEALTH_BONUS } from '../utils/scoring';
import type {
  VaultMeta,
  Level,
  LevelWithTeaching,
  LevelEmail,
  SessionAnswer,
  SubmitAnswerResponse,
} from '../types/vault01.types';

// ── View state ────────────────────────────────────────────────────────────────
export type VaultView =
  | 'map'
  | 'briefing'
  | 'teaching'
  | 'loading'
  | 'simulate'
  | 'red-screen'
  | 'complete';

export type FeedbackState = 'none' | 'correct' | 'threat-blocked' | 'false-alarm';

// ── Answer record keyed by email.id ───────────────────────────────────────────
export interface AnswerRecord {
  userGuess: boolean;
  isPhishing: boolean;
  isCorrect: boolean;
  tag: 'THREAT_BLOCKED' | 'SAFE_VERIFIED' | 'MISSED_THREAT' | 'FALSE_ALARM';
  healthChange: number;
  pending: boolean;
}

export function useVault01() {
  // ── Auth store — single source of truth for health ──────────────────────────
  const { health, deductHealth, setHealth, restoreHealth, updateUser } = useAuthStore();

  // ── Core data ───────────────────────────────────────────────────────────────
  const [meta, setMeta] = useState<VaultMeta | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<LevelWithTeaching | null>(null);
  const [emails, setEmails] = useState<LevelEmail[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [levelLoading, setLevelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── View & navigation ───────────────────────────────────────────────────────
  const [view, setView] = useState<VaultView>('map');
  const [focusedIndex, setFocusedIndex] = useState(0);

  // ── Teaching state ──────────────────────────────────────────────────────────
  const [teachingStep, setTeachingStep] = useState(1);
  const [quizAnswered, setQuizAnswered] = useState<string | null>(null);

  // ── Simulation state ────────────────────────────────────────────────────────
  const [selectedEmailId, setSelectedEmailId] = useState<number | null>(null);
  // Answers keyed by String(email.id) — locked after first answer
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({});
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // ── Timer ───────────────────────────────────────────────────────────────────
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Submit state ────────────────────────────────────────────────────────────
  const [submitResult, setSubmitResult] = useState<SubmitAnswerResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Feedback overlay state ───────────────────────────────────────────────────
  const [feedbackState, setFeedbackState] = useState<FeedbackState>('none');

  // ── Red screen email (for MISSED_THREAT before submit completes) ─────────────
  const [redScreenEmail, setRedScreenEmail] = useState<LevelEmail | null>(null);

  // ── Reset state ─────────────────────────────────────────────────────────────
  const [resetting, setResetting] = useState(false);

  // ── Ref: guards against double-deduction (Strict Mode / concurrent renders) ──
  const deductedEmails = useRef<Set<string>>(new Set());

  // ── Load overview on mount ──────────────────────────────────────────────────
  useEffect(() => {
    getVaultOverview()
      .then(({ meta, levels }) => { setMeta(meta); setLevels(levels); })
      .catch(() => setError('Failed to load vault. Please try again.'))
      .finally(() => setPageLoading(false));
  }, []);

  // ── Loading screen auto-advance ─────────────────────────────────────────────
  useEffect(() => {
    if (view !== 'loading') return;
    const t = setTimeout(() => setView('simulate'), 3000);
    return () => clearTimeout(t);
  }, [view]);

  // ── Scroll to top on teaching step change ───────────────────────────────────
  useEffect(() => {
    if (view === 'teaching') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [teachingStep, view]);

  // ── Keyboard navigation on map ───────────────────────────────────────────────
  useEffect(() => {
    if (view !== 'map') return;
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight': setFocusedIndex((p) => Math.min(p + 1, levels.length - 1)); break;
        case 'ArrowLeft':  setFocusedIndex((p) => Math.max(p - 1, 0)); break;
        case 'ArrowDown':  setFocusedIndex((p) => Math.min(p + 2, levels.length - 1)); break;
        case 'ArrowUp':    setFocusedIndex((p) => Math.max(p - 2, 0)); break;
        case 'Enter':      handleSelectLevel(levels[focusedIndex]); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [view, focusedIndex, levels]);

  // ── Timer: reset + start when simulate loads, stop on other views ────────────
  useEffect(() => {
    if (view === 'simulate') {
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    } else {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [view]);

  // ── Toast helper ─────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2200);
  }, []);

  // ── Select a level (fresh entry — resets health to 100) ──────────────────────
  // Completed levels are locked — they cannot be replayed once passed.
  // Only 'unlocked' and 'active' (in-progress/failed) levels are enterable.
  const handleSelectLevel = useCallback(async (level: Level) => {
    if (level.status === 'locked') {
      showToast('Complete the previous level to unlock this one.');
      return;
    }
    if (level.status === 'completed') {
      showToast('You already passed this level. Move forward!');
      return;
    }
    setFocusedIndex(levels.findIndex((l) => l.id === level.id));
    setLevelLoading(true);
    try {
      const { level: full, emails: levelEmails } = await getLevelDetail(level.id);
      setSelectedLevel(full);
      setEmails(levelEmails);
      setTeachingStep(1);
      setQuizAnswered(null);
      setAnswers({});
      deductedEmails.current.clear();
      setSelectedEmailId(null);
      setSubmitResult(null);
      // Only reset health to MAX on a brand-new entry (never attempted before).
      // If the level was already 'active' (previously tried and failed), carry
      // the user's real health forward — don't wipe accumulated penalties.
      if (level.status !== 'active') {
        setHealth(MAX_HP);
      }
      setView('briefing');
    } catch {
      showToast('Failed to load level. Please try again.');
    } finally {
      setLevelLoading(false);
    }
  }, [levels, showToast]);

  // ── Record an answer — calls Phase 1 API, locked after first click ───────────
  //
  // Flow:
  //  1. Immediately lock the email in local state (pending: true) to disable buttons
  //  2. Call POST /vault01/check-answer for ground truth
  //  3. Store full AnswerRecord from response
  //  4. Apply health change to authStore
  //  5. Set feedbackState based on tag (or go straight to red-screen for MISSED_THREAT)
  //
  // Double-deduction protection: deductedEmails ref guards against any double-fire
  const handleAnswer = useCallback(async (emailId: number, userGuess: boolean) => {
    if (!selectedLevel) return;
    const key = String(emailId);

    // State-level lock — if already answered or pending, do nothing
    setAnswers((prev) => {
      if (prev[key]) return prev;
      // Mark as pending immediately to disable buttons
      return {
        ...prev,
        [key]: {
          userGuess,
          isPhishing: false,      // placeholder until API responds
          isCorrect: false,
          tag: 'MISSED_THREAT' as const,
          healthChange: 0,
          pending: true,
        },
      };
    });

    // Guard: if deductedEmails already has this key, we're in a double-invoke
    if (deductedEmails.current.has(key + '_started')) return;
    deductedEmails.current.add(key + '_started');

    try {
      const result = await checkAnswer({
        level_id: selectedLevel.id,
        email_id: emailId,
        user_guess: userGuess,
      });

      const record: AnswerRecord = {
        userGuess: result.user_guess,
        isPhishing: result.is_phishing,
        isCorrect: result.is_correct,
        tag: result.tag,
        healthChange: result.health_change,
        pending: false,
      };

      setAnswers((prev) => ({ ...prev, [key]: record }));

      // Apply health change — ref guards against double-deduction
      if (result.health_change !== 0 && !deductedEmails.current.has(key)) {
        deductedEmails.current.add(key);
        deductHealth();
      }

      // Drive view based on tag
      if (result.tag === 'MISSED_THREAT') {
        // Instant game over — show red screen immediately
        const email = emails.find((e) => e.id === emailId) ?? null;
        setRedScreenEmail(email);
        setView('red-screen');
      } else if (result.tag === 'FALSE_ALARM') {
        setFeedbackState('false-alarm');
      } else if (result.tag === 'THREAT_BLOCKED') {
        setFeedbackState('threat-blocked');
      } else {
        // SAFE_VERIFIED — brief correct overlay
        setFeedbackState('correct');
      }
    } catch {
      // On API failure, remove the pending lock so user can retry
      setAnswers((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      deductedEmails.current.delete(key + '_started');
      showToast('Failed to check answer. Please try again.');
    }
  }, [selectedLevel, emails, deductHealth, showToast]);

  // ── Derived counts ────────────────────────────────────────────────────────────
  const answeredCount = Object.keys(answers).length;
  const allAnswered = emails.length > 0 && answeredCount >= emails.length;

  // Derived sessionAnswers (for existing components that still use this shape)
  const sessionAnswers: SessionAnswer[] = Object.entries(answers).map(([idStr, rec]) => ({
    email_id: Number(idStr),
    user_answer: rec.userGuess,
    is_correct: rec.isCorrect,
    xp_gained: rec.isCorrect
      ? Math.round((selectedLevel?.xp_reward ?? 50) / (emails.length || 1))
      : 0,
  }));

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!selectedLevel || submitting) return;
    setSubmitting(true);

    const answersMap: Record<string, boolean> = {};
    Object.entries(answers).forEach(([id, rec]) => { answersMap[id] = rec.userGuess; });

    try {
      const result = await submitAnswers({
        level_id: selectedLevel.id,
        answers: answersMap,
        time_seconds: elapsedSeconds,
      });
      setSubmitResult(result);

      const passed = isPassing(result.accuracy);

      if (passed) {
        // Write backend-authoritative XP, coins, level into the store.
        // This is the only place these values are updated — backend is the source of truth.
        updateUser({
          xp:    result.new_xp,
          coins: result.new_coins,
          level: result.new_level,
        });
        // Grant +PASS_HEALTH_BONUS HP reward for passing — clamped to MAX_HP in store
        restoreHealth(PASS_HEALTH_BONUS);
        // Optimistically lock the completed level before the backend refresh arrives.
        // This prevents the player from re-entering the level if the refresh is slow or fails.
        setLevels((prev) =>
          prev.map((l) =>
            l.id === selectedLevel.id ? { ...l, status: 'completed' as const } : l
          )
        );
        // Refresh level list so the newly-unlocked next level appears on the map.
        const { levels: updated } = await getVaultOverview().catch(() => ({ levels, meta })) as any;
        if (updated) setLevels(updated);
        setView('complete');
      } else {
        // Failed — no XP/coins/health-bonus granted; go straight to red-screen
        setView('red-screen');
      }
    } catch {
      showToast('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [selectedLevel, answers, elapsedSeconds, submitting, showToast]);

  // ── Auto-submit 800ms after last answer ──────────────────────────────────────
  useEffect(() => {
    if (!allAnswered || submitting || submitResult) return;
    const t = setTimeout(() => handleSubmit(), 800);
    return () => clearTimeout(t);
  }, [allAnswered, submitting, submitResult, handleSubmit]);

  // ── Retry — resets simulation state and health for a new attempt ─────────────
  // Called ONLY from the fail path (RedScreen → Try Again).
  // Must NOT be wired to the pass path (ResultCard pass state has no Replay button).
  // Health is reset to MAX_HP: the penalties from the failed run belonged to
  // that attempt and should not accumulate into the next fresh attempt.
  const handleRetry = useCallback(() => {
    setAnswers({});
    setSelectedEmailId(null);
    setSubmitResult(null);
    setFeedbackState('none');
    setRedScreenEmail(null);
    deductedEmails.current.clear();
    setHealth(MAX_HP); // fresh attempt → full health restored
    setView('simulate');
  }, [setHealth]);

  // ── Reset vault — wipes all progress, syncs authStore from backend ──────────
  const handleResetVault = useCallback(async () => {
    if (resetting) return;
    setResetting(true);
    try {
      const fresh = await resetVault();
      updateUser({ xp: fresh.new_xp, coins: fresh.new_coins, level: fresh.new_level });
      setHealth(fresh.health);
      setAnswers({});
      setSelectedEmailId(null);
      setSubmitResult(null);
      setFeedbackState('none');
      setRedScreenEmail(null);
      deductedEmails.current.clear();
      setElapsedSeconds(0);
      setFocusedIndex(0);
      const { meta: freshMeta, levels: freshLevels } = await getVaultOverview();
      setMeta(freshMeta);
      setLevels(freshLevels);
      setView('map');
      showToast('Vault progress reset');
    } catch {
      showToast('Reset failed. Please try again.');
    } finally {
      setResetting(false);
    }
  }, [resetting, updateUser, setHealth, showToast]);

  return {
    meta, levels, selectedLevel, emails,
    pageLoading, levelLoading, error,
    view, setView, focusedIndex, setFocusedIndex,
    teachingStep, setTeachingStep, quizAnswered, setQuizAnswered,
    selectedEmailId, setSelectedEmailId,
    answers,
    sessionAnswers,
    feedbackState, setFeedbackState,
    redScreenEmail,
    showProfilePanel, setShowProfilePanel,
    toastMsg, showToast,
    elapsedSeconds,
    health,
    submitResult, submitting, allAnswered, answeredCount,
    handleSelectLevel, handleAnswer, handleSubmit, handleRetry,
    handleResetVault, resetting,
  };
}