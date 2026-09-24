/**
 * Feature: API Client (لایه یکپارچه درخواست‌های HTTP)
 * انواع و قراردادهای مشترک کلاینت fetch (SSR) و axios (CSR)
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiMode = 'ssr' | 'csr' | 'auto';

/** کد یکتای هر خطا — یا خطای ترنسپورت یا خطای HTTP */
export type ApiErrorCode =
  | 'ERR_OFFLINE'
  | 'ERR_NETWORK'
  | 'ERR_TIMEOUT'
  | 'ERR_ABORTED'
  | 'ERR_UNKNOWN'
  | `HTTP_${number}`;

export interface ApiErrorBody {
  /** پیام فارسی/انگلیسی که سرور برمی‌گرداند (اختیاری) */
  message?: string;
  /** فیلدهای خطای اعتبارسنجی از سرور */
  errors?: Record<string, string[] | string>;
  [key: string]: unknown;
}

/**
 * گزینه‌های کامل هر درخواست — تمام متدها از این نوع استفاده می‌کنند.
 * با دادن آدرس API و آپشن‌ها، کلاینت مناسب (fetch برای SSR / axios برای CSR)
 * انتخاب و درخواست اجرا می‌شود.
 */
export interface ApiRequestOptions<TBody = unknown> {
  /** آدرس API — می‌تواند نسبتی (بدون baseUrl) یا مطلق باشد */
  url: string;
  /** متد درخواست — پیش‌فرض GET */
  method?: HttpMethod;
  /**
   * محل اجرای درخواست:
   *  - 'ssr'  → اجرا روی سرور با fetch بومی (پیش‌فرض وقتی window وجود ندارد)
   *  - 'csr'  → اجرا روی کلاینت با axios
   *  - 'auto' → تشخیص خودکار بر اساس وجود window
   */
  mode?: ApiMode;
  /** آدرس پایه؛ اگر URL نسبتی باشد به ابتدای آن اضافه می‌شود */
  baseUrl?: string;
  /** پارامترهای کوئری (?key=value) */
  params?: Record<string, unknown>;
  /** بدنه درخواست (برای POST/PUT/PATCH/DELETE) به‌صورت JSON */
  body?: TBody;
  /** هدرهای اضافی */
  headers?: Record<string, string>;
  /** مهلت پاسخ به میلی‌ثانیه — پیش‌فرض از apiConfig */
  timeout?: number;
  /** تعداد تلاش مجدد در سطح ترنسپورت (پیش‌فرض ۰) — فقط برای خطاهای قابل‌تلاش */
  retries?: number;
  /** تأخیر پایه بین تلاش‌ها به میلی‌ثانیه — پیش‌فرض ۶۰۰ */
  retryDelay?: number;
  /** ضریب رشد تأخیر (exponential backoff) — پیش‌فرض ۲ */
  retryBackoff?: number;
  /** AbortSignal برای لغو درخواست */
  signal?: AbortSignal;
  /** الصاق هدر Authorization (پیش‌فرض true در CSR) */
  auth?: boolean;
  /** توکن صریح — جایگزین توکن store (برای SSR یا سناریوهای خاص) */
  token?: string | null;
  /** ارسال کوکی‌های بین‌دامنه‌ای در axios */
  withCredentials?: boolean;
  /** گزینه‌های مخصوص fetch (کش، revalidate و...) */
  fetchOptions?: {
    cache?: RequestCache;
    next?: { revalidate?: number | false; tags?: string[] };
    credentials?: RequestCredentials;
  };
  /**
   * کلید ردیابی لودینگ در Zustand store.
   * پیش‌فرض: `${method} ${url}` — با false ردیابی غیرفعال می‌شود.
   */
  loadingKey?: string | false;
  /** نمایش خودکار toast برای خطای این درخواست (پیش‌فرض false — مدیریت مرکزی با QueryCache) */
  notifyOnError?: boolean;
  /** نمایش خودکار toast موفقیت (پیش‌فرض false) */
  notifyOnSuccess?: boolean;
  /** پیام سفارشی موفقیت */
  successMessage?: string;
  /** تابع تعیین موفقیت کد وضعیت — null یعنی هیچ خطایی پرتاب نشود */
  validateStatus?: ((status: number) => boolean) | null;
  /** برچسب متادیتا برای لاگ شبکه */
  label?: string;
}

/** پاسخ استاندارد لایه API — همه چیزهایی که مصرف‌کننده لازم دارد */
export interface ApiResponse<T = unknown> {
  /** داده parse‌شده از بدنه پاسخ */
  data: T;
  /** کد وضعیت HTTP */
  status: number;
  statusText: string;
  /** هدرهای پاسخ به‌صورت آبجکت ساده */
  headers: Record<string, string>;
  /** مدت‌زمان کل درخواست به میلی‌ثانیه */
  duration: number;
  /** نحوه اجرا: fetch روی سرور یا axios روی کلاینت */
  mode: 'ssr' | 'csr';
  /** شناسه یکتای درخواست (برای لاگ و دیباگ) */
  requestId: string;
}
