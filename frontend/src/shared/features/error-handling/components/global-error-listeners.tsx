/**
 * Feature: Error Handling & Notifications
 * شنونده‌های سراسری خطا — مهار خطاهای غیرمنتظره که از هیچ لایه‌ای مدیریت نشده‌اند:
 *  - unhandledrejection: Promise های ردشده بدون catch
 *  - error: خطاهای اسکریپت/منابع
 * خطاهای ApiError از این مسیر عبور داده نمی‌شوند چون خود لایه API آن‌ها را
 * مدیریت و اعلان می‌کند (جلوگیری از toast تکراری).
 */
'use client';

import { useEffect, useRef } from 'react';
import { ApiError } from '@/features/api-client';
import { notify } from '../lib/notify';

export function GlobalErrorListeners(): null {
  const lastNotified = useRef(0);

  useEffect(() => {
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      // خطاهای API قبلاً در لایه مربوطه اعلان شده‌اند
      if (ApiError.isInstance(event.reason)) return;

      // محدود کردن نرخ (حداکثر یکی در هر ۵ ثانیه)
      const now = Date.now();
      if (now - lastNotified.current < 5000) return;
      lastNotified.current = now;

      const message =
        event.reason instanceof Error ? event.reason.message : 'یک Promise بدون مدیریت رد (reject) شد.';
      notify.error(`خطای غیرمنتظره: ${message}`, {
        id: 'unhandled-rejection',
        duration: 6000,
      });
    };

    const onError = (event: ErrorEvent) => {
      if (ApiError.isInstance(event.error)) return;
      // خطاهای بارگذاری منابع (img/script) پیام مخصوص دارند
      if (event.target && event.target !== window && 'src' in (event.target as HTMLElement)) {
        return;
      }
      const now = Date.now();
      if (now - lastNotified.current < 5000) return;
      lastNotified.current = now;
      notify.error(`خطای اسکریپت: ${event.message ?? 'نامشخص'}`, {
        id: 'script-error',
        duration: 6000,
      });
    };

    window.addEventListener('unhandledrejection', onUnhandledRejection);
    window.addEventListener('error', onError);
    return () => {
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
      window.removeEventListener('error', onError);
    };
  }, []);

  return null;
}
