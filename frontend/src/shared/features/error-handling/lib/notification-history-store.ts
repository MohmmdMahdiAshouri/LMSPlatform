/**
 * Feature: Error Handling & Notifications
 * Zustand store تاریخچه نوتیفیکیشن‌ها — پشتوانه پنل «تاریخچه اعلان‌ها» در دمو
 * react-hot-toast خودش state نمایش را مدیریت می‌کند؛ این store فقط برای تاریخچه/آمار است.
 */
'use client';

import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'custom';

export interface NotificationRecord {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  createdAt: number;
  /** کد خطا در صورت ارتباط با ApiError */
  errorCode?: string;
  status?: number;
}

interface NotificationHistoryState {
  records: NotificationRecord[];
  maxRecords: number;
  push: (record: Omit<NotificationRecord, 'id' | 'createdAt'>) => void;
  clear: () => void;
}

let seq = 0;

export const useNotificationHistoryStore = create<NotificationHistoryState>((set) => ({
  records: [],
  maxRecords: 30,
  push: (record) =>
    set((state) => ({
      records: [
        { ...record, id: `ntf-${++seq}`, createdAt: Date.now() },
        ...state.records,
      ].slice(0, state.maxRecords),
    })),
  clear: () => set({ records: [] }),
}));
