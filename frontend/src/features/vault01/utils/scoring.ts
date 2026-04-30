/**
 * Vault 01 Scoring Utilities
 * Pure functions — no side effects, no API calls.
 */

import type { SessionAnswer } from '../types/vault01.types';

/** Minimum accuracy (0–100) required to pass a level and earn rewards. */
export const PASS_THRESHOLD = 75;

/** HP restored to the player when they pass a level (score ≥ PASS_THRESHOLD). */
export const PASS_HEALTH_BONUS = 5;

export const calculateAccuracy = (answers: SessionAnswer[]): number => {
  if (answers.length === 0) return 0;
  const correct = answers.filter((a) => a.is_correct).length;
  return Math.round((correct / answers.length) * 100);
};

export const calculateTotalXP = (answers: SessionAnswer[]): number =>
  answers.reduce((sum, a) => sum + a.xp_gained, 0);

export const isPassing = (accuracy: number): boolean => accuracy >= PASS_THRESHOLD;

export const getAccuracyLabel = (accuracy: number): string => {
  if (accuracy === 100) return 'Perfect';
  if (accuracy >= 90) return 'Excellent';
  if (accuracy >= PASS_THRESHOLD) return 'Passed';
  return 'Failed — Try Again';
};

export const getAccuracyColor = (accuracy: number): string => {
  if (accuracy >= 90) return 'text-green-400';
  if (accuracy >= PASS_THRESHOLD) return 'text-yellow-400';
  return 'text-red-400';
};

export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, '0')}s`;
};

// ── Debrief row shape ─────────────────────────────────────────────────────────

export interface DebriefRow {
  emailId: number;
  subject: string;
  sender: string;
  tag: string;
  userGuess: boolean | null;
  correctAnswer: boolean;
  isCorrect: boolean;
  /** One-line reason shown to user — derived from email links or sender */
  reason: string;
}

/**
 * Build debrief rows for ResultCard by joining per_email_results from the
 * submit response with the full email objects (which carry subject, links etc).
 * All emails are included — correct ones as a recap, wrong ones as explanation.
 */
export const buildDebriefRows = (
  perEmailResults: Array<{
    email_id: number;
    is_correct: boolean;
    correct_answer: boolean;
    user_guess: boolean | null;
    tag: string;
  }>,
  emails: Array<{
    id: number;
    subject: string;
    sender: string;
    address: string;
    links: Array<{ display_text: string; real_url: string; is_dangerous: boolean }>;
  }>
): DebriefRow[] => {
  return perEmailResults.map((r) => {
    const email = emails.find((e) => e.id === r.email_id);
    const subject = email?.subject ?? `Email #${r.email_id}`;
    const sender  = email?.address ?? '';

    let reason = '';
    if (r.tag === 'MISSED_THREAT') {
      // Find the first dangerous link to call out
      const badLink = email?.links.find((l) => l.is_dangerous);
      reason = badLink
        ? `Dangerous link hidden as "${badLink.display_text}" → ${badLink.real_url}`
        : `Sender domain "${sender}" is not a legitimate address`;
    } else if (r.tag === 'FALSE_ALARM') {
      reason = `"${sender}" is a legitimate sender — no dangerous links present`;
    } else if (r.tag === 'THREAT_BLOCKED') {
      const badLink = email?.links.find((l) => l.is_dangerous);
      reason = badLink
        ? `Correctly spotted malicious link: ${badLink.real_url}`
        : `Correctly identified suspicious sender: ${sender}`;
    } else {
      // SAFE_VERIFIED
      reason = `Correctly identified "${sender}" as a safe sender`;
    }

    return {
      emailId:       r.email_id,
      subject,
      sender,
      tag:           r.tag,
      userGuess:     r.user_guess,
      correctAnswer: r.correct_answer,
      isCorrect:     r.is_correct,
      reason,
    };
  });
};