/**
 * Feature: API Client × TanStack Query
 * هوک `useApiRequest` — اجرای imperative درخواست‌های موردی (بدون cache TanStack)
 * مناسب فرم‌ها، آپلود، لاگین و هر جایی که پاسخ فوری لازم است نه کش.
 *
 * قابلیت‌ها:
 *  - مدیریت لودینگ per-key + سراسری (از Zustand store)
 *  - toast خطا به‌صورت پیش‌فرض فعال (notifyOnError: true)
 *  - toast موفقیت اختیاری
 *  - نگهداری آخرین داده/خطا در state محلی
 */
'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { apiRequest } from '../lib/http-client';
import { ApiError } from '../lib/api-error';
import { defaultLoadingKey, useLoadingStore } from '../lib/loading-store';
import type { ApiRequestOptions, ApiResponse } from '../lib/types';

export interface UseApiRequestOptions<TData> {
  /** آپشن‌های درخواست — ثابت یا تابع از آرگومان run */
  request: ApiRequestOptions | ((args?: unknown) => ApiRequestOptions);
  /** toast خطا (پیش‌فرض true) */
  notifyOnError?: boolean;
  /** toast موفقیت (پیش‌فرض false) */
  notifyOnSuccess?: boolean;
  /** پیام موفقیت */
  successMessage?: string;
  /** override کلید لودینگ */
  loadingKey?: string | false;
  /** کال‌بک موفقیت */
  onSuccess?: (data: TData, response: ApiResponse<TData>) => void;
  /** کال‌بک خطا */
  onError?: (error: ApiError) => void;
}

export interface UseApiRequestResult<TData> {
  /** اجرای درخواست — اگر request تابع باشد، args به آن پاس می‌شود؛ در غیر این‌صورت args به‌عنوان body */
  run: (args?: unknown) => Promise<ApiResponse<TData> | null>;
  /** آیا این درخواست در جریان است؟ */
  isLoading: boolean;
  /** کلید لودینگ این هوک */
  loadingKey: string | null;
  /** آخرین داده موفق */
  data: TData | null;
  /** آخرین خطا */
  error: ApiError | null;
  /** پاک‌سازی state خطا/داده */
  reset: () => void;
}

/**
 * مثال:
 *   const { run, isLoading, error } = useApiRequest<LoginResponse>({
 *     request: (input) => ({ url: '/api/auth/login', method: 'POST', body: input }),
 *     onSuccess: (data) => login(data.accessToken),
 *   });
 *   await run({ username, password });
 */
export function useApiRequest<TData = unknown>(options: UseApiRequestOptions<TData>): UseApiRequestResult<TData> {
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [localPending, setLocalPending] = useState(false);

  // نگهداری آپشن‌ها در ref برای پایدار ماندن run
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const defaultKey = useMemo(() => {
    const opts = optionsRef.current;
    if (opts.loadingKey === false) return null;
    if (opts.loadingKey) return opts.loadingKey;
    if (typeof opts.request !== 'function') {
      return defaultLoadingKey(opts.request.method ?? 'GET', opts.request.url);
    }
    return null;
  }, [options.loadingKey, options.request]);

  const isLoading = useLoadingStore((state) =>
    defaultKey ? (state.keys[defaultKey] ?? 0) > 0 : false,
  );

  const run = useCallback(
    async (args?: unknown): Promise<ApiResponse<TData> | null> => {
      const opts = optionsRef.current;

      // ساخت آپشن‌های نهایی درخواست
      let request: ApiRequestOptions;
      if (typeof opts.request === 'function') {
        request = opts.request(args);
        // اگر request تابع خودش body ست نکرده باشد، آرگومان run به‌عنوان body می‌رود
        if (request.body === undefined && args !== undefined && (request.method ?? 'GET') !== 'GET') {
          request = { ...request, body: args };
        }
      } else {
        request = { ...opts.request };
        if (args !== undefined && (request.method ?? 'GET') !== 'GET') {
          request.body = args;
        }
      }

      const finalKey = opts.loadingKey === false ? null : opts.loadingKey || defaultKey;

      setData(null);
      setError(null);
      setLocalPending(true);

      try {
        const response = await apiRequest<TData>({
          ...request,
          notifyOnError: opts.notifyOnError ?? true,
          notifyOnSuccess: opts.notifyOnSuccess ?? false,
          successMessage: opts.successMessage,
        });

        setData(response.data);
        opts.onSuccess?.(response.data, response);
        return response;
      } catch (e) {
        const apiError = ApiError.isInstance(e)
          ? e
          : ApiError.normalize(e, { url: request.url, method: request.method });
        setError(apiError);
        opts.onError?.(apiError);
        return null;
      } finally {
        setLocalPending(false);
      }
    },
    [defaultKey],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    run,
    isLoading: isLoading || localPending,
    loadingKey: defaultKey,
    data,
    error,
    reset,
  };
}
