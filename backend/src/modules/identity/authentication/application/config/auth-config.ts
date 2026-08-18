export const AUTH_CONFIG = {
    // Session & refresh token lifetime
    SESSION_EXPIRES_IN_DAYS: 15,
    // Verification / password-reset token lifetime
    TOKEN_EXPIRES_IN_MINUTES: 15,
    // Access token lifetime (JWT)
    ACCESS_TOKEN_EXPIRES_IN_MINUTES: 15,
    // Cooldown before a verification/password-reset token can be resent
    RESEND_COOLDOWN_MS: 1000 * 60 * 2,
    // Cache TTL for user/session records in Redis
    CACHE_TTL_SECONDS: 60 * 15,
} as const;
