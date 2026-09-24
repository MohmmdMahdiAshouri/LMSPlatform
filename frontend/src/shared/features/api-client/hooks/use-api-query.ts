/**
 * Feature: API Client × TanStack Query
 * هوک `useApiQuery` — کوئری سرور-استیت با اجرای درخواست از طریق لایه API
 *
 * مزیت نسبت به useQuery خام:
 *  - queryFn به‌صورت خودکار از آپشن‌های لایه API می‌سازد (SSR: fetch / CSR: axios)
 *  - خطاها به‌صورت ApiError استاندارد در دسترس هستند (با پیام فارسی)
 *  - signal لغو TanStack به ترنسپورت منتقل می‌شود (لغو واقعی درخواست)
 *  - meta.silent برای بی‌صدا کردن toast مرکزی خطاها
 */
'use client';

import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import { apiRequest } from '../lib/http-client';
import type { ApiError } from '../lib/api-error';
import type { ApiRequestOptions } from '../lib/types';

export interface UseApiQueryOptions<TData>
  extends Omit<UseQueryOptions<TData, ApiError, TData, readonly unknown[]>, 'queryFn'> {
  /** کلید کوئری — برای کش و invalidation */
  queryKey: readonly unknown[];
  /** آپشن‌های درخواست (آدرس، متد GET، پارامترها، mode و...) */
  request: ApiRequestOptions;
}

/**
 * هوک کوئری GET با TanStack Query.
 * مثال:
 *   const { data, isPending, isFetching, error } = useApiQuery<Post[]>({
 *     queryKey: ['posts', 'list', q],
 *     request: { url: '/api/posts', params: { q } },
 *   });
 */
export function useApiQuery<TData = unknown>(options: UseApiQueryOptions<TData>): UseQueryResult<TData, ApiError> {
  const { queryKey, request, meta, ...queryOptions } = options;

  return useQuery<TData, ApiError, TData, readonly unknown[]>({
    ...queryOptions,
    queryKey,
    queryFn: async ({ signal }) => {
      const response = await apiRequest<TData>({ ...request, signal });
      return response.data;
    },
    meta: { silent: false, ...meta },
  });
}

/**
 * پیش‌واکشی کوئری در Server Component برای الگوی SSR + Hydration.
 * در سرور به‌صورت خودکار fetch بومی اجرا می‌شود (mode auto → ssr).
 * مثال در page.tsx:
 *   await prefetchApiQuery(queryClient, { queryKey: ['posts'], request: { url: '/api/posts' } });
 */
export async function prefetchApiQuery<TData = unknown>(
  queryClient: { prefetchQuery: (options: { queryKey: readonly unknown[]; queryFn: () => Promise<TData> }) => Promise<void> },
  options: Pick<UseApiQueryOptions<TData>, 'queryKey' | 'request'>,
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: options.queryKey,
    queryFn: async () => {
      const response = await apiRequest<TData>({ ...options.request, mode: options.request.mode ?? 'ssr' });
      return response.data;
    },
  });
}
