import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AxiosError } from 'axios';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
        const backendMessage = error.response?.data.message;
        if (backendMessage && typeof backendMessage === 'string') {
            return backendMessage;
        }

        if (!error.response) {
            return 'ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید.';
        }

        return 'خطایی رخ داده است. لطفا دوباره تلاش کنید.';
    }

    return 'خطایی رخ داده است. لطفا دوباره تلاش کنید.';
}