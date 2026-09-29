export const API_CONFIG = {
    CLIENT_BASE_URL: process.env.NEXT_PUBLIC_API_URL ?? '',
    SERVER_BASE_URL: process.env.API_URL ?? '',
    REFRESH_TOKEN_COOKIE: 'refreshToken' as const,
    ACCESS_TOKEN_LIFETIME_MS: 15 * 60 * 1000,
    REFRESH_TOKEN_LIFETIME_MS: 15 * 24 * 60 * 60 * 1000
} as const;
