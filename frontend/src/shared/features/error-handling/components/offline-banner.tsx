/**
 * Feature: Error Handling & Notifications
 * بنر سراسری آفلاین + بازگردانی خودکار داده‌ها پس از اتصال مجدد
 */
'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { WifiOff } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOffline } from '../hooks/use-offline';
import { notify } from '../lib/notify';

/**
 * بنر شناور پایین صفحه هنگام قطع اینترنت.
 * پس از بازگشت اتصال:
 *  ۱) toast موفقیت نمایش داده می‌شود
 *  ۲) همه کوئری‌های TanStack invalidate می‌شوند تا داده‌ها تازه شوند
 */
export function OfflineBanner(): ReactNode {
  const { isOffline } = useOffline();
  const queryClient = useQueryClient();
  const wasOffline = useRef(false);

  useEffect(() => {
    if (isOffline) {
      wasOffline.current = true;
      notify.error('اتصال اینترنت قطع شد؛ تا برقراری مجدد اتصال صبر کنید.', { id: 'offline-banner' });
    } else if (wasOffline.current) {
      wasOffline.current = false;
      notify.success('اتصال اینترنت برقرار شد؛ داده‌ها به‌روزرسانی می‌شوند.', { id: 'online-banner' });
      // بازخوانی خودکار همه کوئری‌ها پس از اتصال مجدد
      void queryClient.invalidateQueries();
    }
  }, [isOffline, queryClient]);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          role="status"
          className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-4"
        >
          <div className="flex items-center gap-2.5 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 shadow-lg">
            <WifiOff className="h-4 w-4 text-amber-600" aria-hidden />
            <span className="text-sm font-medium text-amber-800">
              اتصال اینترنت برقرار نیست — پس از بازگشت اتصال، داده‌ها به‌روزرسانی می‌شوند
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
