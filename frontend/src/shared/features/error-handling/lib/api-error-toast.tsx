/**
 * Feature: Error Handling & Notifications
 * رندر غنی toast خطای API — عنوان، پیام فارسی، badge وضعیت، URL و دکمه «تلاش مجدد»
 */
'use client';

import type { ReactNode } from 'react';
import type { ApiError } from '@/features/api-client';

function statusBadgeColor(status?: number): string {
  if (!status) return 'bg-slate-100 text-slate-700 border-slate-200';
  if (status >= 500) return 'bg-rose-50 text-rose-700 border-rose-200';
  if (status >= 400) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-emerald-50 text-emerald-700 border-emerald-200';
}

/**
 * محتوای toast خطای API — با dir=rtl و پیام فارسی.
 * در notify.apiError استفاده می‌شود.
 */
export function renderApiErrorToast(error: ApiError, onRetry?: () => void): ReactNode {
  return (
    <div dir="rtl" className="flex max-w-sm flex-col gap-1.5 text-right" style={{ fontFamily: 'inherit' }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-rose-600">{error.title}</span>
        {error.status ? (
          <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${statusBadgeColor(error.status)}`}>
            HTTP {error.status}
          </span>
        ) : (
          <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
            {error.code}
          </span>
        )}
      </div>
      <p className="text-xs leading-5 text-slate-700">{error.userMessage}</p>
      <div className="flex items-center justify-between gap-2">
        <code dir="ltr" className="max-w-[210px] truncate rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
          {error.method} {error.url}
        </code>
        {onRetry && (
          <button
            type="button"
            onClick={() => onRetry()}
            className="rounded-md bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white transition-colors hover:bg-rose-700"
          >
            تلاش مجدد
          </button>
        )}
      </div>
    </div>
  );
}
