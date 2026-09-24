/**
 * Feature: Error Handling & Notifications
 * کانفیگ سراسری react-hot-toast — RTL، فونت فارسی، هماهنگ با تم روشن/تاریک
 */
'use client';

import { Toaster as HotToaster } from 'react-hot-toast';
import { useTheme } from 'next-themes';

/**
 * نمایش‌دهنده سراسری toastها — یک‌بار در RootLayout قرار می‌گیرد.
 * position سمت پایین-چپ برای چیدمان RTL طبیعی‌تر است.
 */
export function AppToaster() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <HotToaster
      position="bottom-left"
      gutter={10}
      toastOptions={{
        duration: 4000,
        style: {
          direction: 'rtl',
          textAlign: 'right',
          fontFamily: 'Vazirmatn, Tahoma, Arial, sans-serif',
          background: isDark ? '#1e293b' : '#ffffff',
          color: isDark ? '#f1f5f9' : '#0f172a',
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          borderRadius: '12px',
          boxShadow: '0 10px 30px -12px rgb(0 0 0 / 0.25)',
          fontSize: '13px',
          maxWidth: '420px',
        },
        success: { iconTheme: { primary: '#059669', secondary: '#ffffff' }, duration: 3500 },
        error: { iconTheme: { primary: '#e11d48', secondary: '#ffffff' }, duration: 5000 },
      }}
    />
  );
}
