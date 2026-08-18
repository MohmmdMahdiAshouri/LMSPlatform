import { ApiError } from './api-error';

export interface ApiResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data?: T | null;
    error?: ApiError | null;
    correlationId?: string;
    userIP?: string;
    timestamp: string;
}
