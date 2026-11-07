# LMS Platform Development Invariants

## 1. Educational Architectural Guidance
- Always explain the **Mental Models**, **Architectural Trade-offs (The "Why")**, and **.NET framework internals** before writing or executing code changes.
- Relate patterns to industry standards and compare with other ecosystems (e.g., NestJS vs. .NET) when requested.

## 2. Authentication Domain Constraints
- **Refresh Tokens:** Use static refresh tokens for the active session. Do NOT enforce Refresh Token Rotation (RTR) until explicitly instructed.
- **Email Verification Gate:** Do not block users from logging in or refreshing tokens if their email is unverified (`EmailVerifiedAt == null`).
