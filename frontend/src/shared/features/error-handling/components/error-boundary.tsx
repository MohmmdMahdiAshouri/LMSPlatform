/**
 * Feature: Error Handling & Notifications
 * ErrorBoundary — مرز خطای React برای مهار خطاهای رندر
 * با UI فارسی، دکمه «تلاش مجدد» و گزارش اختیاری به سرویس بیرونی
 */
'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  /** حالت فشرده برای مهار خطا در بخش کوچک صفحه */
  compact?: boolean;
  /** عنوان سفارشی */
  title?: string;
  /** توضیح سفارشی */
  description?: string;
}

/**
 * UI استاندارد نمایش خطا — در ErrorBoundary و error.tsx استفاده می‌شود
 */
export function ErrorFallback({ error, resetErrorBoundary, compact = false, title, description }: ErrorFallbackProps) {
  const isDev = process.env.NODE_ENV !== 'production';

  return (
    <div
      role="alert"
      className={`flex w-full flex-col items-center justify-center gap-4 rounded-xl border border-rose-200 bg-rose-50/60 p-6 text-center ${
        compact ? 'min-h-[240px]' : 'min-h-[420px]'
      }`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
        <AlertTriangle className="h-7 w-7 text-rose-600" aria-hidden />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-lg font-bold text-slate-900">{title ?? 'مشکلی در نمایش این بخش پیش آمد'}</h2>
        <p className="max-w-md text-sm leading-6 text-slate-600">
          {description ?? 'خطایی غیرمنتظره رخ داد. می‌توانید این بخش را دوباره بارگذاری کنید یا به صفحه اصلی برگردید.'}
        </p>
      </div>

      {isDev && (
        <pre
          dir="ltr"
          className="max-h-28 max-w-full overflow-auto rounded-lg bg-slate-900/90 p-3 text-left text-[11px] leading-4 text-rose-200"
        >
          {error.name}: {error.message}
        </pre>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={resetErrorBoundary} size="sm" className="gap-1.5 bg-rose-600 hover:bg-rose-700">
          <RotateCcw className="h-4 w-4" aria-hidden />
          تلاش مجدد
        </Button>
        {!compact && (
          <Button onClick={() => (window.location.href = '/')} size="sm" variant="outline" className="gap-1.5">
            <Home className="h-4 w-4" aria-hidden />
            صفحه اصلی
          </Button>
        )}
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
  /** رندر سفارشی جایگزین */
  fallback?: (props: ErrorFallbackProps) => ReactNode;
  /** گزارش خطا به سرویس بیرونی (Sentry و...) */
  onError?: (error: Error, info: ErrorInfo) => void;
  /** عنوان سفارشی fallback */
  title?: string;
  /** توضیح سفارشی fallback */
  description?: string;
  /** کلید برای reset از بیرون */
  resetKeys?: unknown[];
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * مرز خطای کلاسیک React — خطاهای رندر/لایف‌سایکل زیرمجموعه را مهار می‌کند
 * و به‌جای سفید شدن کل صفحه، fallback فارسی نمایش می‌دهد.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // اگر resetKeys تغییر کرد، خطا پاک شود
    if (this.state.error && prevProps.resetKeys && this.props.resetKeys) {
      const changed = this.props.resetKeys.some((key, index) => key !== prevProps.resetKeys?.[index]);
      if (changed) this.setState({ error: null });
    }
  }

  resetErrorBoundary = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (error) {
      const fallbackProps: ErrorFallbackProps = {
        error,
        resetErrorBoundary: this.resetErrorBoundary,
        title: this.props.title,
        description: this.props.description,
      };
      if (this.props.fallback) return this.props.fallback(fallbackProps);
      return <ErrorFallback {...fallbackProps} />;
    }
    return this.props.children;
  }
}

/** نمونه کامپوننت برای دمو — همیشه هنگام رندر خطا پرتاب می‌کند */
export function CrashingComponent({ shouldCrash }: { shouldCrash: boolean }): ReactNode {
  if (shouldCrash) {
    throw new Error('خطای رندر شبیه‌سازی‌شده برای دموی ErrorBoundary!');
  }
  return (
    <div className="flex items-center gap-2 text-sm text-emerald-700">
      <Bug className="h-4 w-4" aria-hidden />
      این کامپوننت سالم است — هیچ خطایی وجود ندارد
    </div>
  );
}
