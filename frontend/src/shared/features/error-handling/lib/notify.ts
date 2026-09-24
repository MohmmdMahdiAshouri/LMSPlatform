/**
 * Feature: Error Handling & Notifications
 * سرویس مرکزی نوتیفیکیشن — پوشش کامل react-hot-toast با:
 *  - استایل RTL و فارسی
 *  - انواع: success / error / warning / info / loading / promise
 *  - toast غنی برای ApiError با دکمه «تلاش مجدد» و dedup خودکار
 *  - ثبت خودکار در تاریخچه (Zustand store)
 */
'use client';

import type { ReactNode } from 'react';
import toast, { type ToastOptions } from 'react-hot-toast';
// import مستقیم از فایل api-error (نه از index) برای شکستن چرخه وابستگی
import { ApiError, apiErrorToastId } from '@/features/api-client/lib/api-error';
import { useNotificationHistoryStore } from './notification-history-store';

/** گزینه‌های نوتیفیکیشن در این اپلیکیشن */
export interface NotifyOptions extends ToastOptions {
  /** ثبت در تاریخچه (پیش‌فرض true) */
  history?: boolean;
  /** کد خطا برای تاریخچه */
  errorCode?: string;
  status?: number;
}

/** سرویس نوتیفیکیشن — تنها نقطه ورود نمایش اعلان در کل اپلیکیشن */
export const notify = {
  /** اعلان موفقیت */
  success(message: string, options?: NotifyOptions): string {
    if (options?.history !== false) {
      useNotificationHistoryStore.getState().push({ type: 'success', title: message });
    }
    return toast.success(message, options);
  },

  /** اعلان خطا */
  error(message: string, options?: NotifyOptions): string {
    if (options?.history !== false) {
      useNotificationHistoryStore.getState().push({
        type: 'error',
        title: message,
        errorCode: options?.errorCode,
        status: options?.status,
      });
    }
    return toast.error(message, options);
  },

  /** اعلان هشدار */
  warning(message: string, options?: NotifyOptions): string {
    if (options?.history !== false) {
      useNotificationHistoryStore.getState().push({ type: 'warning', title: message });
    }
    return toast(message, {
      icon: '⚠️',
      ...options,
    });
  },

  /** اعلان اطلاع‌رسانی */
  info(message: string, options?: NotifyOptions): string {
    if (options?.history !== false) {
      useNotificationHistoryStore.getState().push({ type: 'info', title: message });
    }
    return toast(message, {
      icon: 'ℹ️',
      ...options,
    });
  },

  /** اعلان معمولی با محتوای دلخواه */
  custom(content: ReactNode, options?: NotifyOptions): string {
    if (options?.history !== false) {
      useNotificationHistoryStore.getState().push({ type: 'custom', title: 'اعلان سفارشی' });
    }
    return toast(content as never, options);
  },

  /** اعلان لودینگ — شناسه را برای dismiss برگردانده می‌شود */
  loading(message: string, options?: NotifyOptions): string {
    return toast.loading(message, options);
  },

  /** بستن اعلان — با شناسه یا همه */
  dismiss(toastId?: string): void {
    toast.dismiss(toastId);
  },

  /** اعلان مبتنی بر Promise — لودینگ → موفقیت/خطا */
  promise<T>(
    promise: Promise<T>,
    messages: { loading: string; success: string | ((data: T) => string); error: string | ((err: unknown) => string) },
    options?: NotifyOptions,
  ): Promise<T> {
    if (options?.history !== false) {
      useNotificationHistoryStore.getState().push({ type: 'loading', title: messages.loading });
    }
    return toast.promise(promise, messages, options).then((result) => {
      if (options?.history !== false) {
        useNotificationHistoryStore.getState().push({
          type: 'success',
          title: typeof messages.success === 'function' ? messages.success(result) : messages.success,
        });
      }
      return result;
    });
  },

  /**
   * toast غنی برای خطای API:
   *  - عنوان + پیام فارسی از نگاشت کد خطا
   *  - badge وضعیت HTTP و کد خطا
   *  - دکمه «تلاش مجدد» اختیاری
   *  - dedup: toastهای تکراری با همان خطا جایگزین می‌شوند نه انباشته
   */
  apiError(error: ApiError, options?: NotifyOptions & { onRetry?: () => void }): string {
    void import('./api-error-toast').then(({ renderApiErrorToast }) => {
      toast(renderApiErrorToast(error, options?.onRetry), {
        id: apiErrorToastId(error),
        duration: error.isRetryable ? 6000 : 5000,
        ...options,
      });
    });
    useNotificationHistoryStore.getState().push({
      type: 'error',
      title: error.title,
      message: error.userMessage,
      errorCode: error.code,
      status: error.status,
    });
    return apiErrorToastId(error);
  },
};
