/**
 * Feature: API Client
 * ابزارهای مشترک بین دو ترنسپورت fetch و axios
 */
import { getApiConfig } from './config';
import type { ApiRequestOptions } from './types';
import { getAccessToken } from './auth-store';

/** ساخت شناسه کوتاه یکتا برای ردیابی درخواست */
export function shortId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** ساخت URL نهایی از baseUrl + url + query params */
export function buildUrl(url: string, baseUrl: string, queryString?: string): string {
  const base = baseUrl.replace(/\/+$/, '');
  const path = url.startsWith('/') || url.startsWith('http') ? url : `/${url}`;
  const full = url.startsWith('http') ? url : `${base}${path}`;
  if (!queryString) return full;
  return full.includes('?') ? `${full}&${queryString}` : `${full}?${queryString}`;
}

/** سریالایز پارامترهای کوئری (پشتیبانی از آرایه، null و undefined) */
export function serializeParams(params?: Record<string, unknown>): string | undefined {
  if (!params) return undefined;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null) search.append(key, String(item));
      }
    } else if (typeof value === 'object') {
      search.append(key, JSON.stringify(value));
    } else {
      search.append(key, String(value));
    }
  }
  const qs = search.toString();
  return qs.length > 0 ? qs : undefined;
}

/** ساخت هدرهای نهایی درخواست: پیش‌فرض‌ها + سفارشی + احراز هویت + requestId */
export function buildHeaders(
  options: ApiRequestOptions,
  meta: { requestId: string; isServer: boolean },
): Record<string, string> {
  const config = getApiConfig();
  const headers: Record<string, string> = {
    ...config.defaultHeaders,
    'X-Request-Id': meta.requestId,
    ...options.headers,
  };

  const hasBody = options.body !== undefined && (options.method ?? 'GET') !== 'GET';
  if (hasBody && !headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json';
  }

  // الصاق توکن: توکن صریح مقدم است؛ روی سرور store در دسترس نیست
  if (options.auth) {
    const token = options.token ?? (meta.isServer ? null : getAccessToken());
    if (token && !headers['Authorization'] && !headers['authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}
