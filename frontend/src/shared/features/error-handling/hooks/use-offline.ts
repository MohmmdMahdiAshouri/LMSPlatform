/**
 * Feature: Error Handling & Notifications
 * هوک تشخیص وضعیت آنلاین/آفلاین + پایش خودکار بازگشت اتصال
 */
'use client';

import { useEffect, useState } from 'react';

export interface UseOfflineResult {
  isOffline: boolean;
  isOnline: boolean;
}

/**
 * تشخیص آفلاین با رویدادهای online/offline مرورگر.
 * مقدار اولیه false است تا با SSR هم‌خوان بماند (جلوگیری از hydration mismatch)
 * و در اولین effect با وضعیت واقعی navigator هم‌گام می‌شود.
 */
export function useOffline(): UseOfflineResult {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // همگام‌سازی اولیه با وضعیت واقعی مرورگر (در microtask تا setState همگام در effect نباشد)
    const initialSync = setTimeout(() => setIsOffline(!navigator.onLine), 0);
    // هر رویداد مستقیماً state را عوض می‌کند (بدون اتکا به navigator.onLine)
    // چون در شبیه‌سازی، dispatch رویداد navigator.onLine را تغییر نمی‌دهد
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);

    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      clearTimeout(initialSync);
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  return { isOffline, isOnline: !isOffline };
}

/**
 * شبیه‌سازی رویداد آفلاین برای دمو — رویداد offline را دستی dispatch می‌کند.
 * (فقط برای نمایش UI؛ navigator.onLine واقعی تغییر نمی‌کند)
 */
export function simulateOffline(durationMs = 3000): void {
  window.dispatchEvent(new Event('offline'));
  window.setTimeout(() => {
    window.dispatchEvent(new Event('online'));
  }, durationMs);
}
