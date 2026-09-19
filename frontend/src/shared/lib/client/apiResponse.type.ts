export type ApiResponse<T = null> = {
    success: boolean;
    statusCode: number;
    message: string;
    data: T | null;
    error: { code: string } | null;
    timestamp: string;
    correlationId?: string;
    userIP?: string;
};
