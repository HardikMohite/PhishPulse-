/**
 * avatarSystem.ts
 *
 * Central source of truth for the agent avatar system.
 *
 * - Uses DiceBear v9 (api.dicebear.com/9.x) — fixes the broken v7 URLs
 * - Male agents are locked to short-hair `top` values
 * - Female agents are locked to long-hair `top` values
 * - Cyber agents use the `bottts` style (robots — no hair constraint needed)
 * - Each agent has a fixed `top` param encoded directly in `extraParams` so the
 *   URL always renders the correct hair regardless of seed entropy
 *
 * Usage:
 *   import { PRESET_AVATARS, getAvatarUrl } from '@/avatarSystem';
 *
 *   // Simple URL
 *   <img src={getAvatarUrl(avatar)} />
 *
 *   // Or build manually
 *   <img src={buildAvatarUrl(seed, style, extraParams)} />
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AvatarCategory = 'male' | 'female' | 'cyber';

export interface PresetAvatar {
  /** Unique stable ID used as React key and for selectedAvatarId state */
  id: string;
  /** Agent display name shown in the picker and on the profile */
  label: string;
  /** DiceBear seed — determines face features, skin tone, etc. */
  seed: string;
  /** DiceBear style identifier */
  style: 'avataaars' | 'bottts';
  /** Additional URL query params (e.g. hair lock) — no leading '?' */
  extraParams: string;
  /** Used to group avatars in the picker UI */
  category: AvatarCategory;
}

// ---------------------------------------------------------------------------
// DiceBear v9 short-hair top values (avataaars)
// Reference: https://www.dicebear.com/styles/avataaars/
// ---------------------------------------------------------------------------
const SHORT_HAIR_TOPS = [
  'shortHairShortFlat',
  'shortHairShortWaved',
  'shortHairSides',
  'shortHairDreads01',
  'shortHairFrizzle',
] as const;

// DiceBear v9 long-hair top values (avataaars)
const LONG_HAIR_TOPS = [
  'longHairStraight',
  'longHairStraight2',
  'longHairCurvy',
  'longHairDreads',
  'longHairBob',
] as const;

// ---------------------------------------------------------------------------
// URL builder
// ---------------------------------------------------------------------------

/**
 * Builds a DiceBear v9 avatar URL.
 *
 * @param seed        - Determines the avatar face/skin/eyes
 * @param style       - 'avataaars' | 'bottts'
 * @param extraParams - Pre-encoded query string WITHOUT leading '?'
 *                      e.g. "top=shortHairShortFlat&accessoriesProbability=20"
 */
export function buildAvatarUrl(
  seed: string,
  style: 'avataaars' | 'bottts',
  extraParams?: string,
): string {
  const base = `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
  return extraParams ? `${base}&${extraParams}` : base;
}

/** Convenience overload that accepts a full PresetAvatar object */
export function getAvatarUrl(avatar: Pick<PresetAvatar, 'seed' | 'style' | 'extraParams'>): string {
  return buildAvatarUrl(avatar.seed, avatar.style, avatar.extraParams);
}

/**
 * Reconstruct a URL from the values stored in the DB / authStore.
 * Falls back gracefully when avatar_style is missing.
 */
export function getAvatarUrlFromUser(
  avatarSeed: string | undefined,
  avatarStyle: string | undefined,
): string {
  const seed = avatarSeed || 'agent-one';
  const style = (avatarStyle as PresetAvatar['style']) || 'avataaars';

  // Find the matching preset so we can reattach the extraParams (hair lock)
  const preset = PRESET_AVATARS.find(
    (a) => a.seed === seed && a.style === style,
  );

  if (preset) return getAvatarUrl(preset);

  // Unknown seed (legacy / custom) — render without hair lock
  return buildAvatarUrl(seed, style);
}

// ---------------------------------------------------------------------------
// Preset agents
// ---------------------------------------------------------------------------

export const PRESET_AVATARS: PresetAvatar[] = [
  // ── Male agents (short hair) ─────────────────────────────────────────────
  {
    id: 'male-rex',
    label: 'Rex',
    seed: 'agent-rex',
    style: 'avataaars',
    extraParams: `top=${SHORT_HAIR_TOPS[0]}&accessoriesProbability=20`,
    category: 'male',
  },
  {
    id: 'male-blaze',
    label: 'Blaze',
    seed: 'agent-blaze',
    style: 'avataaars',
    extraParams: `top=${SHORT_HAIR_TOPS[1]}&accessoriesProbability=10`,
    category: 'male',
  },
  {
    id: 'male-knox',
    label: 'Knox',
    seed: 'agent-knox',
    style: 'avataaars',
    extraParams: `top=${SHORT_HAIR_TOPS[2]}&accessoriesProbability=15`,
    category: 'male',
  },
  {
    id: 'male-zero',
    label: 'Zero',
    seed: 'agent-zero',
    style: 'avataaars',
    extraParams: `top=${SHORT_HAIR_TOPS[3]}&accessoriesProbability=10`,
    category: 'male',
  },

  // ── Female agents (long hair) ────────────────────────────────────────────
  {
    id: 'female-nova',
    label: 'Nova',
    seed: 'agent-nova',
    style: 'avataaars',
    extraParams: `top=${LONG_HAIR_TOPS[0]}&accessoriesProbability=20`,
    category: 'female',
  },
  {
    id: 'female-cipher',
    label: 'Cipher',
    seed: 'agent-cipher',
    style: 'avataaars',
    extraParams: `top=${LONG_HAIR_TOPS[1]}&accessoriesProbability=10`,
    category: 'female',
  },
  {
    id: 'female-echo',
    label: 'Echo',
    seed: 'agent-echo',
    style: 'avataaars',
    extraParams: `top=${LONG_HAIR_TOPS[2]}&accessoriesProbability=15`,
    category: 'female',
  },
  {
    id: 'female-zara',
    label: 'Zara',
    seed: 'agent-zara',
    style: 'avataaars',
    extraParams: `top=${LONG_HAIR_TOPS[3]}&accessoriesProbability=10`,
    category: 'female',
  },

  // ── Cyber agents (robots — bottts style) ────────────────────────────────
  {
    id: 'cyber-nullbyte',
    label: 'Null Byte',
    seed: 'null-byte',
    style: 'bottts',
    extraParams: '',
    category: 'cyber',
  },
  {
    id: 'cyber-phantom',
    label: 'Phantom',
    seed: 'phantom-x',
    style: 'bottts',
    extraParams: '',
    category: 'cyber',
  },
];

// ---------------------------------------------------------------------------
// Helpers for the avatar picker UI
// ---------------------------------------------------------------------------

export const MALE_AVATARS   = PRESET_AVATARS.filter((a) => a.category === 'male');
export const FEMALE_AVATARS = PRESET_AVATARS.filter((a) => a.category === 'female');
export const CYBER_AVATARS  = PRESET_AVATARS.filter((a) => a.category === 'cyber');

/** Returns the preset matching stored DB values, or the first preset as fallback */
export function resolvePresetAvatar(
  avatarSeed: string | undefined,
  avatarStyle: string | undefined,
): PresetAvatar {
  return (
    PRESET_AVATARS.find(
      (a) => a.seed === avatarSeed && a.style === avatarStyle,
    ) ?? PRESET_AVATARS[0]
  );
}