/**
 * Feature: API Client
 * ترنسپورت CSR — axios با interceptorهای احراز هویت و ردیابی
 * فقط سمت کلاینت (مرورگر) استفاده می‌شود.
 */
'use client';

import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { getApiConfig } from './config';
import { ApiError } from './api-error';
import { buildUrl, serializeParams, shortId } from './utils';
import { getAccessToken } from './auth-store';
import type { ApiRequestOptions, HttpMethod } from './types';
import type { TransportResult } from './fetch-client';

/** نمونه axios مخصوص لایه API */
export const apiAxios: AxiosInstance = axios.create({
  // baseUrl خالی به این معناست که URLهای نسبتی به همان origin ارسال می‌شوند
  headers: { Accept: 'application/json' },
});

/* ------------------- Request Interceptor ------------------- */
/**
 * - الصاق هدر Authorization (Bearer) از Zustand auth store یا توکن صریح
 * - الصاق X-Request-Id برای ردیابی
 * - زمان شروع درخواست را ذخیره می‌کند
 */
apiAxios.interceptors.request.use((request: InternalAxiosRequestConfig & { meta?: Record<string, unknown> }) => {
  const config = getApiConfig();
  const requestId = shortId();

  request.headers.set('X-Request-Id', requestId);

  // احراز هویت — الصاق توکن از Zustand store (اگر هدر Authorization تنظیم نشده باشد)
  const token =
    (request.headers.get('Authorization') as string | undefined) ??
    (request.headers.get('authorization') as string | undefined);
  if (!token) {
    const accessToken = getAccessToken();
    if (accessToken) request.headers.set('Authorization', `Bearer ${accessToken}`);
  }

  // هدرهای پیش‌فرض سراسری
  for (const [key, value] of Object.entries(config.defaultHeaders)) {
    if (!request.headers.has(key)) request.headers.set(key, value);
  }

  (request as InternalAxiosRequestConfig & { meta?: Record<string, unknown> }).meta = {
    requestId,
    startedAt: Date.now(),
  };

  return request;
});

/* ------------------- Response Interceptor ------------------- */
/**
 * خطاهای axios را به ApiError نرمالایز می‌کند تا همه لایه‌های بالاتر
 * فقط با یک نوع خطای استاندارد کار کنند.
 */
apiAxios.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    throw error; // نرمالایز نهایی در http-client انجام می‌شود تا زمینه درخواست کامل باشد
  },
);

/** تبدیل هدرهای axios به آبجکت ساده */
function headersToObject(headers: unknown): Record<string, string> {
  const result: Record<string, string> = {};
  if (headers && typeof headers === 'object') {
    for (const [key, value] of Object.entries(headers as Record<string, unknown>)) {
      if (value !== undefined && value !== null) result[key] = Array.isArray(value) ? value.join(', ') : String(value);
    }
  }
  return result;
}

/**
 * اجرای درخواست با axios — مناسب Client Components.
 * timeout، پارامترها، بدنه و signal از آپشن‌های استاندارد لایه می‌آیند.
 */
export async function axiosTransport<T>(options: ApiRequestOptions<T>): Promise<TransportResult<T>> {
  const config = getApiConfig();
  const method: HttpMethod = options.method ?? 'GET';
  const requestId = shortId();
  const startedAt = Date.now();

  const url = buildUrl(options.url, options.baseUrl || config.baseUrl, undefined);

  try {
    const response = await apiAxios.request<T>({
      url,
      method,
      params: options.params,
      data: options.body !== undefined && method !== 'GET' ? options.body : undefined,
      timeout: options.timeout ?? config.timeout,
      signal: options.signal,
      withCredentials: options.withCredentials,
      headers: buildAxiosHeaders(options, requestId),
      paramsSerializer: {
        serialize: (params: Record<string, unknown>) => serializeParams(params) ?? '',
      },
      // نکته مهم: هرگز undefined صریح نفرستید — validateStatus پیش‌فرض axios را خنثی می‌کند!
      ...(options.validateStatus ? { validateStatus: options.validateStatus } : {}),
    });

    // بررسی دفاعی وضعیت — حتی اگر axios به هر دلیل رد نکرده باشد
    const statusOk =
      options.validateStatus === null
        ? true
        : options.validateStatus
          ? options.validateStatus(response.status)
          : response.status >= 200 && response.status < 300;

    if (!statusOk) {
      throw new ApiError(`HTTP_${response.status}` as const, {
        url,
        method,
        requestId,
        mode: 'csr',
        status: response.status,
        statusText: response.statusText,
        headers: headersToObject(response.headers),
        data: response.data as unknown,
      });
    }

    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: headersToObject(response.headers),
      duration: Date.now() - startedAt,
      requestId,
    };
  } catch (error) {
    if (ApiError.isInstance(error)) throw error;

    const axiosError = error as AxiosError;

    // خطای HTTP با پاسخ سرور
    if (axiosError.response) {
      const { status, statusText } = axiosError.response;
      const data = axiosError.response.data as unknown;
      throw new ApiError(`HTTP_${status}` as const, {
        url,
        method,
        requestId,
        mode: 'csr',
        status,
        statusText,
        headers: headersToObject(axiosError.response.headers),
        data,
      });
    }

    // خطاهای ترنسپورت (شبکه/تایم‌اوت/لغو)
    throw ApiError.normalize(error, { url, method, requestId, mode: 'csr' });
  }
}

/** ساخت هدرهای اولیه axios از آپشن‌ها (احراز هویت و بدنه) */
function buildAxiosHeaders(options: ApiRequestOptions, requestId: string): Record<string, string> {
  const headers: Record<string, string> = { 'X-Request-Id': requestId, ...options.headers };

  const hasBody = options.body !== undefined && (options.method ?? 'GET') !== 'GET';
  if (hasBody && !headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  return headers;
}
