import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;   // backend returns UUID string
  name: string;
  email: string;
  phone: string;
  role: string;
  level: number;
  xp: number;
  streak: number;
  coins: number;
  is_verified: boolean;
  created_at?: string;
  /** Client-side health (0–100). Not stored in DB; persisted locally. */
  health?: number;
}

export const MAX_HP = 100;
export const HEALTH_PENALTY = 20;

interface AuthState {
  user: User | null;
  /** Current player health (0–100). Persisted across sessions. */
  health: number;
  loading: boolean;
  setUser: (user: User | null) => void;
  updateUser: (partial: Partial<User>) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  /** Deduct HP for a wrong answer. Clamps to 0. Returns the new HP value. */
  deductHealth: (amount?: number) => number;
  /** Restore HP (e.g. after a completed level or shop item). Clamps to MAX_HP. */
  restoreHealth: (amount: number) => void;
  /** Hard-set HP — used when entering a fresh level (reset to 100). */
  setHealth: (hp: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      health: MAX_HP,
      loading: false,
      setUser: (user) => {
        if (user && user.health !== undefined) {
          // Backend or persisted user carries a health value — honour it
          set({ user, health: Math.min(MAX_HP, Math.max(0, user.health)) });
        } else {
          set({ user });
        }
      },
      updateUser: (partial) => {
        const current = get().user;
        if (!current) return;
        const next = { ...current, ...partial };
        // If caller is patching health on the user object, mirror it to the top-level health field
        if (partial.health !== undefined) {
          set({ user: next, health: Math.min(MAX_HP, Math.max(0, partial.health)) });
        } else {
          set({ user: next });
        }
      },
      clearUser: () => set({ user: null, health: MAX_HP }),
      setLoading: (loading) => set({ loading }),
      deductHealth: (amount = HEALTH_PENALTY) => {
        const next = Math.max(0, get().health - amount);
        const user = get().user;
        set({ health: next, user: user ? { ...user, health: next } : user });
        return next;
      },
      restoreHealth: (amount) => {
        const next = Math.min(MAX_HP, get().health + amount);
        const user = get().user;
        set({ health: next, user: user ? { ...user, health: next } : user });
      },
      setHealth: (hp) => {
        const next = Math.min(MAX_HP, Math.max(0, hp));
        const user = get().user;
        set({ health: next, user: user ? { ...user, health: next } : user });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, health: state.health }),
    }
  )
);