/**
 * Vault 01 Scoring Utilities
 * Pure functions — no side effects, no API calls.
 */

import type { SessionAnswer } from '../types/vault01.types';

export const calculateAccuracy = (answers: SessionAnswer[]): number => {
  if (answers.length === 0) return 0;
  const correct = answers.filter((a) => a.is_correct).length;
  return Math.round((correct / answers.length) * 100);
};

export const calculateTotalXP = (answers: SessionAnswer[]): number =>
  answers.reduce((sum, a) => sum + a.xp_gained, 0);

export const getAccuracyLabel = (accuracy: number): string => {
  if (accuracy === 100) return 'Perfect';
  if (accuracy >= 80) return 'Excellent';
  if (accuracy >= 60) return 'Passed';
  return 'Failed — Try Again';
};

export const getAccuracyColor = (accuracy: number): string => {
  if (accuracy >= 80) return 'text-green-400';
  if (accuracy >= 60) return 'text-yellow-400';
  return 'text-red-400';
};

export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, '0')}s`;
};
