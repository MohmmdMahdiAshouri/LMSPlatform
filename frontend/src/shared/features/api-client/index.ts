/**
 * Feature: API Client — نقطه خروج عمومی
 * مصرف‌کننده‌ها فقط از این فایل import کنند:
 *   import { apiRequest, useApiQuery, useApiMutation } from '@/features/api-client';
 */
export type {
  HttpMethod,
  ApiMode,
  ApiErrorCode,
  ApiRequestOptions,
  ApiResponse,
  ApiErrorBody,
} from './lib/types';

export { ApiError, errorMetaFor, apiErrorToastId, type ApiErrorMeta } from './lib/api-error';
export { configureApi, registerTokenRefresher, getApiConfig, type ApiClientConfig } from './lib/config';
export { apiRequest, type ApiRequestInternal } from './lib/http-client';
export { useAuthStore, getAccessToken, type AuthSession } from './lib/auth-store';
export { useLoadingStore, isLoadingKey, defaultLoadingKey } from './lib/loading-store';
export {
  useRequestLogStore,
  type RequestLogEntry,
  type RequestState,
  type RequestExecutionMode,
} from './lib/request-log-store';
export { useApiQuery, prefetchApiQuery, type UseApiQueryOptions } from './hooks/use-api-query';
export { useApiMutation, type UseApiMutationOptions } from './hooks/use-api-mutation';
export {
  useApiRequest,
  type UseApiRequestOptions,
  type UseApiRequestResult,
} from './hooks/use-api-request';
