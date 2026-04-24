import api from './api';

export interface CTFChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  xp_reward: number;
  coins_reward: number;
  is_active: boolean;
  expires_at: string | null;
  solved: boolean;
}

export const getDailyChallenge = async (): Promise<CTFChallenge | null> => {
  const response = await api.get('ctf/daily');
  const data = response.data;
  // Backend stores expires_at as naive UTC (no "Z" suffix). Normalise it so
  // the browser parses it as UTC instead of local time, fixing the countdown.
  if (data?.expires_at && !data.expires_at.endsWith('Z') && !data.expires_at.includes('+')) {
    data.expires_at += 'Z';
  }
  return data;
};

export const getPastChallenges = async (): Promise<CTFChallenge[]> => {
  const response = await api.get('ctf/past');
  return response.data.map((c: CTFChallenge) => {
    if (c.expires_at && !c.expires_at.endsWith('Z') && !c.expires_at.includes('+')) {
      c.expires_at += 'Z';
    }
    return c;
  });
};

export interface SubmitFlagResult {
  correct: boolean;
  message: string;
  xp_earned: number;
  coins_earned: number;
  new_xp: number;
  new_coins: number;
  new_level: number;
}

export const submitFlag = async (challengeId: string, flag: string): Promise<SubmitFlagResult> => {
  const response = await api.post(`ctf/submit/${challengeId}`, { flag });
  return response.data;
};

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  level: number;
  xp: number;
  streak: number;
  coins: number;
  is_you: boolean;
}

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const response = await api.get('leaderboard');
  return response.data;
};