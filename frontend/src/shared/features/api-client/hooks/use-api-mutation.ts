/**
 * Feature: API Client × TanStack Query
 * هوک `useApiMutation` — متودهای تغییردهنده (POST/PUT/PATCH/DELETE) با:
 *  - ساخت آپشن‌های درخواست به‌صورت تابع از متغیرهای mutation
 *  - toast موفقیت خودکار (اختیاری) با پیام سفارشی فارسی
 *  - invalidation خودکار کوئری‌ها پس از موفقیت
 *  - خطای مرکزی از طریق MutationCache (toast خطا) — ApiError استاندارد
 */
'use client';

import { useMutation, useQueryClient, type UseMutationOptions, type UseMutationResult } from '@tanstack/react-query';
import { apiRequest } from '../lib/http-client';
import type { ApiError } from '../lib/api-error';
import type { ApiRequestOptions } from '../lib/types';
import { notify } from '@/features/error-handling/lib/notify';

export interface UseApiMutationOptions<TData, TVariables>
  extends Omit<UseMutationOptions<TData, ApiError, TVariables>, 'mutationFn'> {
  /** آپشن‌های درخواست — می‌تواند بر اساس متغیرها ساخته شود */
  request: ApiRequestOptions | ((variables: TVariables) => ApiRequestOptions);
  /** نمایش toast موفقیت (پیش‌فرض false) */
  notifyOnSuccess?: boolean;
  /** پیام موفقیت — ثابت یا تابع از داده و متغیرها */
  successMessage?: string | ((data: TData, variables: TVariables) => string);
  /** کلیدهای کوئری که پس از موفقیت invalidate می‌شوند */
  invalidateKeys?: readonly (readonly unknown[])[];
}

/**
 * هوک mutation برای POST/PUT/PATCH/DELETE.
 * مثال:
 *   const createPost = useApiMutation<Post, CreatePostInput>({
 *     request: (input) => ({ url: '/api/posts', method: 'POST', body: input }),
 *     invalidateKeys: [['posts']],
 *     notifyOnSuccess: true,
 *     successMessage: 'مطلب جدید ثبت شد',
 *   });
 *   createPost.mutate({ title: '...', body: '...' });
 */
export function useApiMutation<TData = unknown, TVariables = void>(
  options: UseApiMutationOptions<TData, TVariables>,
): UseMutationResult<TData, ApiError, TVariables> {
  const queryClient = useQueryClient();
  const { request, notifyOnSuccess, successMessage, invalidateKeys, meta, ...mutationOptions } = options;

  return useMutation<TData, ApiError, TVariables>({
    ...mutationOptions,
    mutationFn: async (variables: TVariables) => {
      const resolved: ApiRequestOptions = typeof request === 'function' ? request(variables) : request;
      const response = await apiRequest<TData>(resolved);
      return response.data;
    },
    onSuccess: async (data, variables, context, mutation) => {
      // invalidation خودکار کوئری‌های مرتبط
      if (invalidateKeys && invalidateKeys.length > 0) {
        await Promise.all(invalidateKeys.map((key) => queryClient.invalidateQueries({ queryKey: key })));
      }
      // toast موفقیت
      if (notifyOnSuccess) {
        const message =
          typeof successMessage === 'function' ? successMessage(data, variables) : successMessage ?? 'عملیات با موفقیت انجام شد';
        notify.success(message);
      }
      // زنجیر کردن onSuccess مصرف‌کننده
      await mutationOptions.onSuccess?.(data, variables, context, mutation);
    },
    meta: { silent: false, ...meta },
  });
}
