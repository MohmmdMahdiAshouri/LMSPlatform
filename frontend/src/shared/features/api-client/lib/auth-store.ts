/**
 * Feature: API Client
 * Zustand store احراز هویت — نگهداری توکن‌ها با persist در localStorage
 * و در دسترس بودن برای interceptor های axios
 */
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  /** اطلاعات کاربر اختیاری (نام، ایمیل و...) */
  user?: Record<string, unknown> | null;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: Record<string, unknown> | null;
  /** آیا hydrate از storage انجام شده؟ (برای جلوگیری از فلاش UI) */
  _hydrated: boolean;
  setTokens: (session: AuthSession) => void;
  setAccessToken: (token: string) => void;
  setUser: (user: Record<string, unknown> | null) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      _hydrated: false,
      setTokens: ({ accessToken, refreshToken, user }) =>
        set((s) => ({
          accessToken,
          refreshToken: refreshToken ?? s.refreshToken,
          user: user ?? s.user,
        })),
      setAccessToken: (accessToken) => set({ accessToken }),
      setUser: (user) => set({ user }),
      clearSession: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: 'api-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state._hydrated = true;
      },
    },
  ),
);

/** خواندن توکن خارج از کامپوننت (برای interceptor ها) — فقط سمت کلاینت معنی دارد */
export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}
