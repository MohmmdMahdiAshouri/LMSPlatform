/**
 * Feature: API Client
 * پیکربندی سراسری لایه API — قابلیت تنظیم از خارج (مثلاً در Providers)
 */

export interface ApiClientConfig {
  /** آدرس پایه همه درخواست‌ها (روی سرور باید مطلق باشد) */
  baseUrl: string;
  /** مهلت پیش‌فرض پاسخ به میلی‌ثانیه */
  timeout: number;
  /** تأخیر پایه تلاش مجدد */
  retryDelay: number;
  /** ضریب backoff تلاش مجدد */
  retryBackoff: number;
  /**
   * تابع تمدید توکن — هنگام دریافت ۴۰۱ صدا زده می‌شود.
   * اگر توکن جدید برگرداند، درخواست یک‌بار دیگر تلاش می‌شود.
   */
  tokenRefresher?: (() => Promise<string | null>) | null;
  /** هدرهای پیش‌فرض همه درخواست‌ها */
  defaultHeaders: Record<string, string>;
}

const config: ApiClientConfig = {
  baseUrl: '',
  timeout: 15_000,
  retryDelay: 600,
  retryBackoff: 2,
  tokenRefresher: null,
  defaultHeaders: {
    Accept: 'application/json',
  },
};

/** تغییر پیکربندی سراسری (partial merge) */
export function configureApi(patch: Partial<ApiClientConfig>): void {
  Object.assign(config, patch);
}

/** خواندن پیکربندی فعلی (فقط برای مصرف داخلی) */
export function getApiConfig(): Readonly<ApiClientConfig> {
  return config;
}

/** ثبت تابع تمدید توکن — معمولاً یک‌بار در Providers صدا زده می‌شود */
export function registerTokenRefresher(refresher: () => Promise<string | null>): void {
  config.tokenRefresher = refresher;
}
