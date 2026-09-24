/**
 * Feature: API Client
 * ترنسپورت SSR — fetch بومی (برای اجرا روی سرور / Server Components)
 */
import { getApiConfig } from './config';
import { ApiError } from './api-error';
import { buildUrl, buildHeaders, serializeParams, shortId } from './utils';
import type { ApiRequestOptions, HttpMethod } from './types';

export interface TransportResult<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  duration: number;
  requestId: string;
}

/** بررسی موفق بودن کد وضعیت — قابل بازنویسی با validateStatus */
function isOkStatus(options: ApiRequestOptions, status: number): boolean {
  if (options.validateStatus === null) return true;
  if (options.validateStatus) return options.validateStatus(status);
  return status >= 200 && status < 300;
}

/**
 * اجرای درخواست با fetch بومی — مناسب Server Components و Route Handlers.
 * timeout با AbortSignal و خطاها به ApiError نرمالایز می‌شوند.
 */
export async function fetchTransport<T>(options: ApiRequestOptions<T>): Promise<TransportResult<T>> {
  const config = getApiConfig();
  const method: HttpMethod = options.method ?? 'GET';
  const requestId = shortId();
  const startedAt = Date.now();

  const url = buildUrl(options.url, options.baseUrl || config.baseUrl, serializeParams(options.params));
  const headers = buildHeaders(options, { requestId });

  // ترکیب timeout و signal کاربر
  const timeout = options.timeout ?? config.timeout;
  const signals: AbortSignal[] = [];
  if (timeout > 0) signals.push(AbortSignal.timeout(timeout));
  if (options.signal) signals.push(options.signal);
  const signal = signals.length === 0 ? undefined : signals.length === 1 ? signals[0] : AbortSignal.any(signals);

  const init: RequestInit = {
    method,
    headers,
    signal,
    cache: options.fetchOptions?.cache,
    credentials: options.fetchOptions?.credentials,
    // در Next.js گزینه‌های کش سرور
    ...(options.fetchOptions?.next ? { next: options.fetchOptions.next } : {}),
  };

  if (options.body !== undefined && method !== 'GET') {
    init.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, init);

    // پارس امن بدنه — ممکن است خالی یا غیر JSON باشد
    const rawText = await response.text();
    let data: unknown = null;
    if (rawText.length > 0) {
      try {
        data = JSON.parse(rawText);
      } catch {
        data = rawText;
      }
    }

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    if (!isOkStatus(options, response.status)) {
      throw new ApiError(
        `HTTP_${response.status}` as const,
        {
          url,
          method,
          requestId,
          mode: 'ssr',
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          data,
        },
      );
    }

    return {
      data: data as T,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      duration: Date.now() - startedAt,
      requestId,
    };
  } catch (error) {
    if (ApiError.isInstance(error)) throw error;
    // خطاهای شبکه/تایم‌اوت fetch را نرمالایز کن
    throw ApiError.normalize(error, { url, method, requestId, mode: 'ssr' });
  }
}
