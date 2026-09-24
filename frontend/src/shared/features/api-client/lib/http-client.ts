/**
 * Feature: API Client
 * هسته یکپارچه لایه API — نقطه ورود اصلی `apiRequest`:
 *
 *  ۱) انتخاب ترنسپورت بر اساس mode:
 *     - ssr → fetch بومی (Server Components / Route Handlers)
 *     - csr → axios (Client Components)
 *     - auto → تشخیص خودکار با وجود window
 *  ۲) تلاش مجدد (retry) هوشمند با backoff برای خطاهای قابل‌تلاش
 *  ۳) مدیریت لودینگ سراسری و per-key با Zustand
 *  ۴) ثبت لاگ شبکه (پنل مانیتور)
 *  ۵) نرمالایز خطا به ApiError + نمایش toast اختیاری
 *  ۶) تمدید خودکار توکن هنگام ۴۰۱ و تلاش مجدد یک‌باره
 */
import { getApiConfig } from './config';
import { ApiError } from './api-error';
import { fetchTransport, type TransportResult } from './fetch-client';
import { axiosTransport } from './axios-client';
import { defaultLoadingKey, useLoadingStore } from './loading-store';
import { useRequestLogStore } from './request-log-store';
import { useAuthStore } from './auth-store';
// import مستقیم — بدون چرخه (notify فقط api-error را import می‌کند)
import { notify } from '@/features/error-handling/lib/notify';
import type { ApiMode, ApiRequestOptions, ApiResponse } from './types';

/** تشخیص نهایی نحوه اجرا */
function resolveMode(mode: ApiMode | undefined): 'ssr' | 'csr' {
  if (mode === 'ssr' || mode === 'csr') return mode;
  return typeof window === 'undefined' ? 'ssr' : 'csr';
}

/** آیا این خطا ارزش تلاش مجدد دارد؟ */
function isRetryWorthwhile(error: unknown): boolean {
  return ApiError.isInstance(error) && error.isRetryable;
}

/** تلاش مجدد با تأخیر نمایی (exponential backoff) */
async function delay(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) return;
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

/**
 * اجرای درخواست در ترنسپورت انتخابی با محافظ آفلاین.
 * روی کلاینت اگر مرورگر آفلاین باشد، درخواست اصلاً ارسال نمی‌شود.
 */
async function runTransport<T>(options: ApiRequestOptions<T>, mode: 'ssr' | 'csr'): Promise<TransportResult<T>> {
  if (typeof window !== 'undefined' && !navigator.onLine) {
    throw new ApiError('ERR_OFFLINE', {
      url: options.url,
      method: options.method ?? 'GET',
      mode,
    });
  }
  const transport = mode === 'ssr' ? fetchTransport : axiosTransport;
  return transport<T>(options);
}

/** متغیر قفل تمدید توکن — جلوگیری از refreshهای همزمان */
let refreshInFlight: Promise<string | null> | null = null;

/** تمدید توکن فقط یک‌بار حتی اگر چند درخواست همزمان ۴۰۱ بگیرند */
async function refreshAccessTokenOnce(): Promise<string | null> {
  const config = getApiConfig();
  if (!config.tokenRefresher) return null;
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = config
    .tokenRefresher()
    .catch(() => null)
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

/** ورودی داخلی اضافه برای جلوگیری از حلقه بی‌پایان refresh */
export interface ApiRequestInternal {
  _isAuthRetry?: boolean;
}

/**
 * تابع اصلی لایه API.
 * آدرس API و آپشن‌ها را می‌گیرد، درخواست را در SSR (fetch بومی) یا CSR (axios)
 * اجرا می‌کند، لودینگ و لاگ را مدیریت می‌کند و پاسخ استاندارد ApiResponse را برمی‌گرداند.
 */
export async function apiRequest<T = unknown>(
  options: ApiRequestOptions & ApiRequestInternal,
): Promise<ApiResponse<T>> {
  const config = getApiConfig();
  const mode = resolveMode(options.mode);
  const method = options.method ?? 'GET';
  const startedAt = Date.now();
  const loadingKey =
    options.loadingKey === false ? null : options.loadingKey || defaultLoadingKey(method, options.url);

  const logStore = useRequestLogStore.getState();
  const loadingStore = useLoadingStore.getState();
  const logId = logStore.start({
    method,
    url: options.url,
    mode,
    attempts: 1,
    label: options.label,
    startedAt,
  });

  if (loadingKey) loadingStore.begin(loadingKey);

  const maxAttempts = Math.max(1, Math.floor(options.retries ?? 0) + 1);

  try {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await runTransport<T>(options, mode);
        const duration = Date.now() - startedAt;

        logStore.succeed(logId, result.status, duration);

        const response: ApiResponse<T> = {
          data: result.data,
          status: result.status,
          statusText: result.statusText,
          headers: result.headers,
          duration,
          mode,
          requestId: result.requestId,
        };

        if (options.notifyOnSuccess) {
          notify.success(options.successMessage ?? 'عملیات با موفقیت انجام شد');
        }

        return response;
      } catch (error) {
        const apiError = ApiError.isInstance(error)
          ? error
          : ApiError.normalize(error, { url: options.url, method, mode });

        // ← ۴۰۱: تمدید توکن و تلاش مجدد یک‌باره (فقط CSR، بدون حلقه)
        if (apiError.status === 401 && !options._isAuthRetry && mode === 'csr') {
          const newToken = await refreshAccessTokenOnce();
          if (newToken) {
            return apiRequest<T>({ ...options, _isAuthRetry: true, token: newToken });
          }
          useAuthStore.getState().clearSession();
        }

        // خطای آخر یا غیرقابل تلاش → پرتاب
        if (attempt >= maxAttempts || !isRetryWorthwhile(apiError)) throw apiError;

        // تأخیر نمایی پیش از تلاش بعدی
        const backoff = options.retryDelay ?? config.retryDelay;
        const factor = options.retryBackoff ?? config.retryBackoff;
        await delay(backoff * Math.pow(factor, attempt - 1), options.signal);
      }
    }

    // مسیر غیرقابل‌دسترس — برای اطمینان تایپ‌ها
    throw new ApiError('ERR_UNKNOWN', { url: options.url, method, mode });
  } catch (error) {
    const apiError = ApiError.isInstance(error)
      ? error
      : ApiError.normalize(error, { url: options.url, method, mode });

    logStore.fail(logId, apiError.status ?? null, Date.now() - startedAt, apiError.code);

    if (options.notifyOnError) {
      notify.apiError(apiError);
    }

    throw apiError;
  } finally {
    if (loadingKey) useLoadingStore.getState().end(loadingKey);
  }
}
