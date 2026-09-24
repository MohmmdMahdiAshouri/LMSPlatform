/**
 * Feature: API Client
 * Zustand store مدیریت لودینگ سراسری و per-key
 * هر درخواست با کلید خودش ثبت می‌شود و کامپوننت‌ها می‌توانند به آن گوش دهند.
 */
'use client';
import { create } from 'zustand';

interface LoadingState {
  /** تعداد درخواست‌های در جریان به‌ازای هر کلید (shadcn-style counter) */
  keys: Record<string, number>;
  /** شمارنده کل درخواست‌های در جریان (برای نوار پیشرفت سراسری) */
  globalCount: number;
  begin: (key: string) => void;
  end: (key: string) => void;
  reset: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  keys: {},
  globalCount: 0,
  begin: (key) =>
    set((state) => ({
      keys: { ...state.keys, [key]: (state.keys[key] ?? 0) + 1 },
      globalCount: state.globalCount + 1,
    })),
  end: (key) =>
    set((state) => {
      const current = state.keys[key] ?? 0;
      const nextKeys = { ...state.keys };
      if (current <= 1) delete nextKeys[key];
      else nextKeys[key] = current - 1;
      return { keys: nextKeys, globalCount: Math.max(0, state.globalCount - 1) };
    }),
  reset: () => set({ keys: {}, globalCount: 0 }),
}));

/** آیا کلید مشخص‌شده (یا کل سیستم) در حال لودینگ است؟ — مصرف داخل هوک‌ها */
export function isLoadingKey(key: string | undefined | false): boolean {
  if (!key) return false;
  return (useLoadingStore.getState().keys[key] ?? 0) > 0;
}

/** کلید پیش‌فرض لودینگ بر اساس متد و آدرس */
export function defaultLoadingKey(method: string, url: string): string {
  return `${method} ${url}`;
}
