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
}

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  updateUser: (partial: Partial<User>) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      setUser: (user) => set({ user }),
      updateUser: (partial) => {
        const current = get().user;
        if (current) set({ user: { ...current, ...partial } });
      },
      clearUser: () => {
        set({ user: null });
      },
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);