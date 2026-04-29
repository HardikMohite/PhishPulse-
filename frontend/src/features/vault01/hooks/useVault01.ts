/**
 * useVault01 — Central state hook for Vault 01
 * Manages: view transitions, level data, email simulation, answer tracking, submission.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getVaultOverview, getLevelDetail, submitAnswers } from '../services/vault01Api';
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

export function useVault01() {
  // ── Core data ───────────────────────────────────────────────────────────────
  const [meta, setMeta] = useState<VaultMeta | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<LevelWithTeaching | null>(null);
  const [emails, setEmails] = useState<LevelEmail[]>([]);
  // phishingMap stores the correct answer per email_id — populated from rules.json via API
  // Key: email_id (number), Value: true = is phishing, false = safe
  const [phishingMap, setPhishingMap] = useState<Record<number, boolean>>({});
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
  const [sessionAnswers, setSessionAnswers] = useState<SessionAnswer[]>([]);
  const [feedbackState, setFeedbackState] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // ── Timer ───────────────────────────────────────────────────────────────────
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Submit result ───────────────────────────────────────────────────────────
  const [submitResult, setSubmitResult] = useState<SubmitAnswerResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Load overview on mount ──────────────────────────────────────────────────
  useEffect(() => {
    getVaultOverview()
      .then(({ meta, levels }) => {
        setMeta(meta);
        setLevels(levels);
      })
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

  // ── Timer: start when simulate, stop on other views ─────────────────────────
  useEffect(() => {
    if (view === 'simulate') {
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [view]);

  // ── Toast helper ─────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2200);
  }, []);

  // ── Select a level ────────────────────────────────────────────────────────────
  const handleSelectLevel = useCallback(async (level: Level) => {
    if (level.status === 'locked') {
      showToast('Complete the previous level to unlock this one.');
      return;
    }
    setFocusedIndex(levels.findIndex((l) => l.id === level.id));
    setLevelLoading(true);
    try {
      const { level: full, emails: levelEmails } = await getLevelDetail(level.id);
      setSelectedLevel(full);
      setEmails(levelEmails);
      // Build phishingMap from level rules so immediate feedback is accurate.
      // We fetch /vault01/level/{id} which returns the level + emails (no answers).
      // The rules (correct answers) come from /vault01/progress context OR
      // we derive them after submit. For now initialise empty — feedback shows
      // "Logged" until submit returns red_flags which reveal the truth.
      setPhishingMap({});
      setTeachingStep(1);
      setQuizAnswered(null);
      setSessionAnswers([]);
      setSelectedEmailId(null);
      setFeedbackState('none');
      setSubmitResult(null);
      setView('briefing');
    } catch {
      showToast('Failed to load level. Please try again.');
    } finally {
      setLevelLoading(false);
    }
  }, [levels, showToast]);

  // ── Record an answer ──────────────────────────────────────────────────────────
  const handleAnswer = useCallback((emailId: number, userGuess: boolean) => {
    // If we have the correct answer in phishingMap use it, otherwise treat as unknown
    const knownAnswer = phishingMap[emailId];
    const isCorrect = knownAnswer !== undefined ? userGuess === knownAnswer : false;
    const xpGained = isCorrect ? Math.round((selectedLevel?.xp_reward ?? 50) / (emails.length || 1)) : 0;

    setSessionAnswers((prev) => {
      if (prev.find((a) => a.email_id === emailId)) return prev;
      return [...prev, { email_id: emailId, user_answer: userGuess, is_correct: isCorrect, xp_gained: xpGained }];
    });

    // Only show feedback overlay if we know the correct answer
    if (knownAnswer !== undefined) {
      setFeedbackState(isCorrect ? 'correct' : 'incorrect');
    } else {
      // Answer logged — show neutral toast, no overlay
      setFeedbackState('none');
    }
  }, [selectedLevel, emails, phishingMap]);

  // ── Submit all answers ────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!selectedLevel || submitting) return;
    setSubmitting(true);

    const answersMap: Record<string, boolean> = {};
    sessionAnswers.forEach((a) => {
      answersMap[String(a.email_id)] = a.user_answer;
    });

    try {
      const result = await submitAnswers({
        level_id: selectedLevel.id,
        answers: answersMap,
        time_seconds: elapsedSeconds,
      });
      setSubmitResult(result);
      // Refresh levels to get updated statuses
      const { levels: updated } = await getVaultOverview().catch(() => ({ levels, meta })) as any;
      if (updated) setLevels(updated);
      setView('complete');
    } catch {
      showToast('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [selectedLevel, sessionAnswers, elapsedSeconds, submitting, showToast]);

  // ── Reset simulation for retry ────────────────────────────────────────────────
  const handleRetry = useCallback(() => {
    setSessionAnswers([]);
    setSelectedEmailId(null);
    setFeedbackState('none');
    setView('simulate');
  }, []);

  // ── Check if all emails answered ─────────────────────────────────────────────
  const allAnswered = sessionAnswers.length >= emails.length && emails.length > 0;

  return {
    // Data
    meta, levels, selectedLevel, emails,
    pageLoading, levelLoading, error,
    // View
    view, setView, focusedIndex, setFocusedIndex,
    // Teaching
    teachingStep, setTeachingStep, quizAnswered, setQuizAnswered,
    // Simulation
    selectedEmailId, setSelectedEmailId,
    sessionAnswers, feedbackState, setFeedbackState,
    showProfilePanel, setShowProfilePanel,
    toastMsg, showToast,
    elapsedSeconds,
    // Results
    submitResult, submitting, allAnswered,
    // Actions
    handleSelectLevel, handleAnswer, handleSubmit, handleRetry,
  };
}