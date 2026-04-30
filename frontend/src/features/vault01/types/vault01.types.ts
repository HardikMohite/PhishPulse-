// ─── Vault 01 Types ──────────────────────────────────────────────────────────
// All interfaces mirror the JSON content files and backend API responses exactly.

export type LevelStatus = 'locked' | 'unlocked' | 'active' | 'completed';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

// ── From levels.json ──────────────────────────────────────────────────────────
export interface Level {
  id: number;
  name: string;
  concept: string;
  description: string;
  difficulty: Difficulty;
  tag: string;
  email_count: number;
  xp_reward: number;
  coins_reward: number;
  est_minutes: number;
  status: LevelStatus;        // injected by backend overview endpoint
}

// ── From emails.json ──────────────────────────────────────────────────────────
export interface EmailLink {
  display_text: string;       // what user sees
  real_url: string;           // shown on hover
  is_dangerous: boolean;
}

export interface LevelEmail {
  id: number;
  level_id: number;
  sender: string;
  address: string;
  subject: string;
  preview: string;
  time: string;
  is_phishing: boolean;
  avatar_color: string;       // tailwind classes e.g. "bg-blue-600 text-white"
  content_html: string;       // full email HTML body
  links: EmailLink[];
}

// ── From rules.json ───────────────────────────────────────────────────────────
export interface RedFlag {
  label: string;
  explanation: string;
  highlight?: string;         // the exact text to highlight in the email
}

export interface LevelRule {
  level_id: number;
  correct_answers: Record<number, boolean>; // email_id -> is_phishing
  red_flags: RedFlag[];
  attack_timeline: Array<{ time: string; event: string; is_critical?: boolean }>;
  key_insight: string;
}

// ── From rewards.json ─────────────────────────────────────────────────────────
export interface LevelReward {
  level_id: number;
  badge_name: string;
  badge_tier: string;         // e.g. "BRONZE"
  title_unlocked: string;
  bonus_xp: number;
  bonus_coins: number;
  what_you_learned: string[];
}

// ── From meta.json ────────────────────────────────────────────────────────────
export interface VaultMeta {
  vault_id: number;
  title: string;
  subtitle: string;
  tier: string;               // "FOUNDATION TIER"
  total_levels: number;
  total_xp: number;
  total_coins: number;
  badge_name: string;
  est_total_minutes: number;
}

// ── Teaching content (per level, inside levels.json) ─────────────────────────
export interface QuizOption {
  id: string;                 // "A" | "B" | "C" | "D"
  text: string;
  is_correct: boolean;
}

export interface TeachingStep {
  step: number;               // 1 | 2 | 3
  type: 'concept' | 'comparison' | 'quiz';
  title: string;
  subtitle: string;
  // concept step
  body?: string;
  analogy?: string;
  icon_hint?: string;         // "clock" | "link" | "shield" etc.
  // comparison step
  legitimate_example?: string;
  phishing_example?: string;
  // quiz step
  quiz_question?: string;
  quiz_options?: QuizOption[];
  correct_explanation?: string;
  incorrect_explanation?: string;
}

export interface LevelWithTeaching extends Level {
  teaching_steps: TeachingStep[];
}

// ── API response shapes ───────────────────────────────────────────────────────
export interface VaultProgressEntry {
  level_id: number;
  status: LevelStatus;
  best_accuracy: number | null;
  completed_at: string | null;
}

export interface VaultProgress {
  vault_id: number;
  user_id: string;
  levels: VaultProgressEntry[];
}

export interface SubmitAnswerPayload {
  level_id: number;
  answers: Record<string, boolean>; // email_id as string -> user's guess
  time_seconds: number;
}

export interface CheckAnswerPayload {
  level_id: number;
  email_id: number;
  user_guess: boolean;
}

export interface CheckAnswerResponse {
  email_id: number;
  is_correct: boolean;
  is_phishing: boolean;     // ground truth, safe to reveal after user commits
  user_guess: boolean;
  tag: 'THREAT_BLOCKED' | 'SAFE_VERIFIED' | 'MISSED_THREAT' | 'FALSE_ALARM';
  health_change: number;    // 0 if correct, -20 if wrong
}

export interface SubmitAnswerResponse {
  correct: boolean;
  accuracy: number;           // 0–100
  xp_earned: number;
  coins_earned: number;
  new_xp: number;
  new_coins: number;
  new_level: number;
  level_up: boolean;          // true if profile level increased this submission
  health_change: number;      // negative on miss, 0 on pass
  next_level_unlocked: boolean;
  next_level_id: number | null;
  // Post-game debrief fields
  what_you_learned: string[];
  red_flags: RedFlag[];
  attack_timeline: Array<{ time: string; event: string; is_critical?: boolean }>;
  per_email_results: Array<{
    email_id: number;
    is_correct: boolean;
    correct_answer: boolean;
    user_guess: boolean | null;
    tag: string;
  }>;
}

// ── Local session state (not persisted to DB) ─────────────────────────────────
export interface SessionAnswer {
  email_id: number;
  user_answer: boolean;       // what user clicked
  is_correct: boolean;        // whether they were right
  xp_gained: number;
}