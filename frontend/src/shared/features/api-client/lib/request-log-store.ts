/**
 * Feature: API Client
 * Zustand store «مانیتور شبکه» — لاگ زنده درخواست‌ها با حالت، وضعیت، مدت و نحوه اجرا (SSR/CSR)
 * این استور پایه پنل Network Monitor در صفحه دمو است.
 */
'use client';

import { create } from 'zustand';

export type RequestState = 'pending' | 'success' | 'error';
export type RequestExecutionMode = 'ssr' | 'csr';

export interface RequestLogEntry {
  id: string;
  method: string;
  url: string;
  mode: RequestExecutionMode;
  state: RequestState;
  status: number | null;
  /** مدت اجرا به میلی‌ثانیه (null تا پایان درخواست) */
  duration: number | null;
  startedAt: number;
  /** تعداد تلاش‌های انجام‌شده (شامل تلاش مجدد) */
  attempts: number;
  /** کد خطا در صورت شکست */
  errorCode?: string;
  label?: string;
}

interface RequestLogState {
  entries: RequestLogEntry[];
  maxEntries: number;
  /** ثبت شروع درخواست و برگرداندن شناسه لاگ */
  start: (init: Omit<RequestLogEntry, 'id' | 'state' | 'status' | 'duration'>) => string;
  /** ثبت پایان موفق */
  succeed: (id: string, status: number, duration: number) => void;
  /** ثبت پایان ناموفق */
  fail: (id: string, status: number | null, duration: number, errorCode?: string) => void;
  /** ثبت لاگ آماده (مثلاً درخواست SSR که سمت سرور اجرا شده و نتیجه‌اش hydrate شده) */
  seed: (entries: RequestLogEntry[]) => void;
  clear: () => void;
}

let counter = 0;

export const useRequestLogStore = create<RequestLogState>((set) => ({
  entries: [],
  maxEntries: 50,
  start: (init) => {
    const id = `req-${++counter}-${Date.now().toString(36)}`;
    set((state) => ({
      entries: [
        { ...init, id, state: 'pending' as const, status: null, duration: null },
        ...state.entries,
      ].slice(0, state.maxEntries),
    }));
    return id;
  },
  succeed: (id, status, duration) =>
    set((state) => ({
      entries: state.entries.map((e) =>
        e.id === id ? { ...e, state: 'success' as const, status, duration } : e,
      ),
    })),
  fail: (id, status, duration, errorCode) =>
    set((state) => ({
      entries: state.entries.map((e) =>
        e.id === id ? { ...e, state: 'error' as const, status, duration, errorCode } : e,
      ),
    })),
  seed: (seeded) => set((state) => ({ entries: [...seeded, ...state.entries].slice(0, state.maxEntries) })),
  clear: () => set({ entries: [] }),
}));
