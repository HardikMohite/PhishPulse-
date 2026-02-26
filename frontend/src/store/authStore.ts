import { create } from "zustand";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "employee" | "admin" | "developer";
  level: number;
  xp: number;
  coins: number;
  streak: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
}));