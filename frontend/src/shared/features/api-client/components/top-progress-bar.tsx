/**
 * Feature: API Client
 * نوار پیشرفت سراسری — با هر درخواست در جریان (globalCount > 0) نمایش داده می‌شود
 */
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useLoadingStore } from '../lib/loading-store';

/** نوار باریک بالای صفحه که هنگام فعالیت هر درخواستی نمایان می‌شود */
export function TopProgressBar() {
  const globalCount = useLoadingStore((state) => state.globalCount);
  const active = globalCount > 0;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center" aria-live="polite">
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-0 h-[3px] w-full overflow-hidden bg-emerald-100/60"
          >
            <motion.div
              className="h-full w-1/3 rounded-r-full bg-emerald-500"
              animate={{ x: ['-100%', '400%'] }}
              transition={{ repeat: Infinity, ease: 'easeInOut', duration: 1.1 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
