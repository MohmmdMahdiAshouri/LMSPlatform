/**
 * Feature: API Client
 * کلاس خطای یکپارچه + نگاشت کد خطا به پیام کاربرپسند فارسی
 */
import type { ApiErrorBody, ApiErrorCode, ApiRequestOptions, HttpMethod } from './types';

export interface ApiErrorMeta {
  /** عنوان کوتاه فارسی برای نمایش در toast/رابط کاربری */
  title: string;
  /** توضیح فارسی برای کاربر نهایی */
  message: string;
  /** آیا این خطا قابل تلاش مجدد است؟ */
  retryable: boolean;
}

/** نگاشت پیش‌فرض کد خطا → متادیتای فارسی */
const ERROR_META: Record<string, ApiErrorMeta> = {
  ERR_OFFLINE: {
    title: 'قطع اتصال اینترنت',
    message: 'شما آفلاین هستید؛ پس از برقراری مجدد اتصال، درخواست تکرار می‌شود.',
    retryable: true,
  },
  ERR_NETWORK: {
    title: 'خطای شبکه',
    message: 'ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید.',
    retryable: true,
  },
  ERR_TIMEOUT: {
    title: 'انقضای مهلت پاسخ',
    message: 'سرور در زمان تعیین‌شده پاسخ نداد. لطفاً دوباره تلاش کنید.',
    retryable: true,
  },
  ERR_ABORTED: {
    title: 'درخواست لغو شد',
    message: 'این درخواست قبل از تکمیل لغو شد.',
    retryable: false,
  },
  ERR_UNKNOWN: {
    title: 'خطای ناشناخته',
    message: 'یک خطای غیرمنتظره رخ داد. جزئیات در کنسول مرورگر موجود است.',
    retryable: false,
  },
  HTTP_400: {
    title: 'درخواست نامعتبر',
    message: 'اطلاعات ارسالی ناقص یا نامعتبر است.',
    retryable: false,
  },
  HTTP_401: {
    title: 'احراز هویت لازم است',
    message: 'نشست شما منقضی شده یا توکن معتبر نیست؛ لطفاً دوباره وارد شوید.',
    retryable: false,
  },
  HTTP_403: {
    title: 'دسترسی غیرمجاز',
    message: 'شما اجازه دسترسی به این منبع را ندارید.',
    retryable: false,
  },
  HTTP_404: {
    title: 'یافت نشد',
    message: 'منبع درخواستی روی سرور وجود ندارد.',
    retryable: false,
  },
  HTTP_405: {
    title: 'متد پشتیبانی نمی‌شود',
    message: 'این متد برای آدرس درخواستی مجاز نیست.',
    retryable: false,
  },
  HTTP_408: {
    title: 'انقضای مهلت سرور',
    message: 'سرور در زمان مجاز پاسخ نداد. دوباره تلاش کنید.',
    retryable: true,
  },
  HTTP_409: {
    title: 'تضاد در داده‌ها',
    message: 'این داده قبلاً تغییر کرده یا نسخه تکراری آن وجود دارد.',
    retryable: false,
  },
  HTTP_422: {
    title: 'داده نامعتبر',
    message: 'سرور داده‌های ارسالی را نپذیرفت؛ فیلدها را بررسی کنید.',
    retryable: false,
  },
  HTTP_429: {
    title: 'درخواست بیش از حد مجاز',
    message: 'تعداد درخواست‌ها زیاد است؛ چند لحظه بعد دوباره تلاش کنید.',
    retryable: true,
  },
  HTTP_500: {
    title: 'خطای داخلی سرور',
    message: 'مشکلی در سرور پیش آمد؛ لطفاً بعداً دوباره تلاش کنید.',
    retryable: true,
  },
  HTTP_502: {
    title: 'خطای دروازه',
    message: 'سرور میانی پاسخ نامعتبری دریافت کرد.',
    retryable: true,
  },
  HTTP_503: {
    title: 'سرویس در دسترس نیست',
    message: 'سرور موقتاً از دسترس خارج است؛ کمی بعد تلاش کنید.',
    retryable: true,
  },
  HTTP_504: {
    title: 'انقضای مهلت دروازه',
    message: 'پاسخ سرور دیرتر از حد مجاز رسید.',
    retryable: true,
  },
};

export function errorMetaFor(code: ApiErrorCode): ApiErrorMeta {
  if (ERROR_META[code]) return ERROR_META[code];
  if (code.startsWith('HTTP_')) {
    const status = Number(code.replace('HTTP_', ''));
    if (status >= 500) {
      return { title: `خطای سرور (${status})`, message: 'خطایی در سمت سرور رخ داد؛ بعداً دوباره تلاش کنید.', retryable: true };
    }
    return { title: `خطای درخواست (${status})`, message: 'درخواست شما با خطا مواجه شد.', retryable: false };
  }
  return ERROR_META.ERR_UNKNOWN;
}

/** زمینه اجرای درخواست که هنگام ساخت ApiError ضمیمه می‌شود */
export interface ApiErrorContext {
  url: string;
  method?: HttpMethod;
  requestId?: string;
  mode?: 'ssr' | 'csr';
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  data?: unknown;
}

/**
 * کلاس خطای استاندارد کل اپلیکیشن.
 * هم خطاهای ترنسپورت (شبکه/تایم‌اوت/لغو) و هم خطاهای HTTP را یکدست می‌کند.
 */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status?: number;
  readonly statusText?: string;
  /** بدنه پاسخ خطا (parse شده) در صورت وجود */
  readonly data?: unknown;
  readonly headers?: Record<string, string>;
  readonly url: string;
  readonly method: HttpMethod;
  readonly requestId: string;
  readonly mode: 'ssr' | 'csr';
  readonly timestamp: number;
  /** پیام ارسال‌شده از سمت سرور (اگر ارائه شده باشد) */
  readonly serverMessage?: string;

  constructor(code: ApiErrorCode, context: ApiErrorContext, cause?: unknown) {
    const meta = errorMetaFor(code);
    const serverMessage =
      typeof (context.data as ApiErrorBody | undefined)?.message === 'string' &&
      (context.data as ApiErrorBody).message!.trim().length > 0
        ? (context.data as ApiErrorBody).message!.trim()
        : undefined;

    super(serverMessage ?? meta.message, cause !== undefined ? { cause } : undefined);

    this.name = code === 'ERR_ABORTED' ? 'AbortError' : 'ApiError';
    this.code = code;
    this.status = context.status;
    this.statusText = context.statusText;
    this.data = context.data;
    this.headers = context.headers;
    this.url = context.url;
    this.method = context.method ?? 'GET';
    this.requestId = context.requestId ?? '-';
    this.mode = context.mode ?? 'csr';
    this.timestamp = Date.now();
    this.serverMessage = serverMessage;
    this.isRetryable = meta.retryable;
  }

  /** آیا این خطا قابل تلاش مجدد است (شبکه/تایم‌اوت/5xx/429) */
  readonly isRetryable: boolean;

  /** عنوان کوتاه فارسی */
  get title(): string {
    return errorMetaFor(this.code).title;
  }

  /** پیام کاربرپسند فارسی */
  get userMessage(): string {
    return this.message;
  }

  /** متادیتای نگاشت‌شده */
  get meta(): ApiErrorMeta {
    return errorMetaFor(this.code);
  }

  static isInstance(value: unknown): value is ApiError {
    return value instanceof ApiError;
  }

  /**
   * هر مقدار پرتاب‌شده (خطای fetch، axios، AbortError، هر Exception دیگری)
   * را به ApiError استاندارد تبدیل می‌کند.
   */
  static normalize(value: unknown, context: ApiErrorContext): ApiError {
    if (ApiError.isInstance(value)) return value;

    // خطاهای axios: نمونه Error با ویژگی‌های اضافه
    const err = value as (Error & { code?: string; response?: unknown }) | undefined;

    if (err instanceof Error || (err && typeof err === 'object' && 'message' in err)) {
      // AbortError از fetch یا axios
      if (err.name === 'AbortError' || err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        return new ApiError('ERR_ABORTED', context, value);
      }
      if (err.code === 'ECONNABORTED') {
        return new ApiError('ERR_TIMEOUT', context, value);
      }
      if (err.code === 'ERR_NETWORK' || err.message === 'Failed to fetch' || err.message === 'Network Error' || err.message === 'Load failed') {
        return new ApiError('ERR_NETWORK', context, value);
      }
      // خطای عمومی دیگر
      return new ApiError('ERR_UNKNOWN', context, value);
    }

    return new ApiError('ERR_UNKNOWN', context, value);
  }
}

/** کلید یکتا برای deduplicate کردن toast خطاها */
export function apiErrorToastId(error: ApiError): string {
  return `api-error-${error.code}-${error.method}-${error.url}`.replace(/[^a-zA-Z0-9-_]/g, '_');
}
