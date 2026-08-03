export interface ApiError {
    code: string;
    details?: Array<{ field: string; message: string }>;
}
