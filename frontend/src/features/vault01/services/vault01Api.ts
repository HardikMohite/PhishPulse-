/**
 * Vault 01 API Service
 * All calls use the existing configured axios instance from src/services/api.ts
 * No new axios instance. Auth cookie handled automatically.
 */

import api from '@/services/api';
import type {
  VaultMeta,
  Level,
  LevelWithTeaching,
  LevelEmail,
  VaultProgress,
  SubmitAnswerPayload,
  SubmitAnswerResponse,
  CheckAnswerPayload,
  CheckAnswerResponse,
} from '../types/vault01.types';

// ── Response shapes from backend ──────────────────────────────────────────────

export interface VaultOverviewResponse {
  meta: VaultMeta;
  levels: Level[];
}

export interface LevelDetailResponse {
  level: LevelWithTeaching;
  emails: LevelEmail[];
}

// ── API calls ─────────────────────────────────────────────────────────────────

export const getVaultOverview = async (): Promise<VaultOverviewResponse> => {
  const res = await api.get('/vault01');
  return res.data;
};

export const getAllLevels = async (): Promise<Level[]> => {
  const res = await api.get('/vault01/levels');
  return res.data;
};

export const getLevelDetail = async (levelId: number): Promise<LevelDetailResponse> => {
  const res = await api.get(`/vault01/level/${levelId}`);
  return res.data;
};

export const getProgress = async (): Promise<VaultProgress> => {
  const res = await api.get('/vault01/progress');
  return res.data;
};

export interface ResetVaultResponse {
  success: boolean;
  new_xp: number;
  new_coins: number;
  new_level: number;
  health: number;
}

export const resetVault = async (): Promise<ResetVaultResponse> => {
  const res = await api.post('/vault01/reset');
  return res.data;
};

export const submitAnswers = async (
  payload: SubmitAnswerPayload
): Promise<SubmitAnswerResponse> => {
  const res = await api.post('/vault01/submit', {
    level_id: payload.level_id,
    answers: payload.answers,
    time_seconds: payload.time_seconds,
  });
  return res.data;
};

export const checkAnswer = async (
  payload: CheckAnswerPayload
): Promise<CheckAnswerResponse> => {
  const res = await api.post('/vault01/check-answer', payload);
  return res.data;
};