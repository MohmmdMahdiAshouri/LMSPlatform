# Domain: Identity : Authentication

> **Status:** Updated to reflect the current implementation (post-implementation and post-refactoring).
> **Baseline:** Original Authentication domain/design document.
> **Verification basis:** Current source code, current Prisma schema, current project architecture, and the original design document.
> Rules and use cases below are annotated with their implementation status. For the full list of differences, see the final section **Changes from Original Design**.

---

## Business Requirements

- **Account Registration:** Registration with Email & Password, or Google account
- **Login:** Login with Email or Username and Password, & Google account
- **Session Management:** Create session, Refresh Token, Logout on one device or all devices, View active devices
- **Email Verification:** Send confirmation email, Confirm email, Resend confirmation link
- **Password Management:** Forgot Password, Send recovery link, Change password
- **Security:** Rate limiting, Audit log — *(Not implemented in the current codebase — see Changes from Original Design)*

---

## Actors

- **Guest**
- **Authenticated User**
- **OAuth Provider** (Google)
- **Email Service** (SMTP via BullMQ)

---

## Use Cases

### UC-01 Register with Email — ✅ Implemented

- **Goal:** Create a user account using email and password.
- **Primary Actor:** Guest
- **Preconditions:**
  - The email must not have been registered previously
  - The username must not have been used previously
- **Trigger:** User submits the registration form.
- **Main flow:**
  1. Send Registration form
  2. Verify Data (DTO validation + VO validation)
  3. Check email unique (if not, send error message)
  4. Check username unique (if not, send error message)
  5. Hash password (bcrypt, 12 rounds)
  6. Create User
  7. Create email Verification Token (15-minute expiration)
  8. Register an Outbox message for the async verification email (retry handled by the outbox processor and BullMQ)
  9. Create a Session + Refresh Token + Access Token
  10. Return success result (accessToken + HttpOnly refresh-token cookie)
- **Exceptions:** Validation failed, password policy failed, email/username already exists, concurrent registration (P2002 mapped to a proper 422 error)
- **Related Domain Events:** `VerificationTokenEvent` (via Outbox) → verification email

### UC-02 Login with Email — ✅ Implemented

- **Goal:** User logs in using email (or username) and password; a new Session is created.
- **Primary Actor:** Guest
- **Preconditions:**
  - User must have an account
  - User account has not been deleted or deactivated
  - User's email must be verified *(enforced since the refactoring)*
- **Trigger:** User submits the login form.
- **Main flow:**
  1. User enters their email/username and password
  2. Find user with the login identifier (emails are normalized: trimmed + lowercased)
  3. Compare entered password with the stored hash
  4. Check email verification (unverified → `EmailNotVerifiedException`)
  5. Check the account is not banned/inactive
  6. Check the account is not locked
  7. Create new Session (or reuse the active session for the same device and rotate its token)
  8. Create new access token
  9. Create new refresh token; connect refresh token to session
  10. Send access token in the body and refresh token as an HttpOnly cookie
- **Exceptions:**
  - Unknown user / wrong password / locked / inactive → **unified `401 INVALID_CREDENTIALS`** (anti user-enumeration; specific reason only in logs)
  - Email not verified → `422 EMAIL_NOT_VERIFIED`
  - Google-only account → `401 PASSWORD_LOGIN_NOT_AVAILABLE`

### UC-03 Login with Google — ✅ Implemented

- **Goal:** User logs into the system using a Google account.
- **Primary Actor:** Guest
- **Preconditions:** Google authentication succeeds.
- **Trigger:** User clicks "Continue with Google".
- **Main flow:**
  1. Redirect user to Google
  2. User authenticates with Google
  3. Receive Google user information
  4. Check if the Google email is verified in Google
  5. Check if the user already exists (by `googleId`); if not, check email conflict with a password account
  6. If the user does not exist, create a new user (with a generated unique username)
  7. Create new Session, access token, refresh token
  8. Redirect to the frontend with the access token in the **URL fragment** (`#accessToken=...`) and the refresh token as an HttpOnly cookie
- **Exceptions:** Google authentication failed; Google email not verified; an account with the same email already exists without Google (`ACCOUNT_EXISTS_WITHOUT_GOOGLE`)

### UC-04 Verify Email — ✅ Implemented

- **Goal:** Verify the user's email address.
- **Primary Actor:** Guest
- **Preconditions:** User has a valid verification token; email is not verified.
- **Trigger:** User submits the verification token.
- **Main flow:**
  1. Receive verification token
  2. Hash the token (SHA-256) and look it up
  3. Validate the token (`use()` — throws if not usable)
  4. Find the related user
  5. Mark email as verified (`verifyEmail()`)
  6. Invalidate the verification token (`usedAt` set)
  7. Return success result
- **Exceptions:** Token not found / expired / already used / revoked → `422 NOT_USABLE_VERIFICATION_TOKEN`

### UC-05 Resend Verification Email — ✅ Implemented (authenticated)

- **Goal:** Send a new email verification link.
- **Primary Actor:** Authenticated User *(changed from Guest — the current endpoint requires a Bearer access token and identifies the user from it)*
- **Preconditions:** User account exists; email is not verified.
- **Trigger:** User requests a new verification email.
- **Main flow:**
  1. Find user (from the access token)
  2. Check the email is not already verified
  3. Enforce a 2-minute cooldown since the last token
  4. Revoke the previous verification token
  5. Generate a new verification token
  6. Register an Outbox message for the verification email
  7. Return success result
- **Exceptions:** User not found (404), email already verified (422), resend too soon (422)

### UC-06 Forgot Password — ✅ Implemented (anti-enumeration)

- **Goal:** Generate a password reset request.
- **Primary Actor:** Guest
- **Preconditions:** None (the response is identical whether the email exists or not).
- **Trigger:** User submits the forgot-password form.
- **Main flow:**
  1. User enters email
  2. Find user — if not found, **still return success (200)** and only log the event
  3. Enforce the 2-minute cooldown (silently, to avoid enumeration)
  4. Revoke the previous password reset token
  5. Generate a password reset token
  6. Register an Outbox message for the password reset email (same transaction)
  7. Return success result
- **Exceptions:** None surfaced (anti user-enumeration). Validation errors → 400.

### UC-07 Reset Password — ✅ Implemented

- **Goal:** Reset the user's password.
- **Primary Actor:** Guest
- **Preconditions:** User has a valid reset token.
- **Trigger:** User submits a new password.
- **Main flow:**
  1. Hash the reset token and look it up
  2. Validate the reset token (`use()` + `revoke()`)
  3. Validate the new password
  4. Check the new password is not the same as the current one
  5. Hash the new password
  6. Update the password
  7. Revoke the reset token
  8. Logout all Sessions (`revokeAllSessions`)
  9. Return success result
- **Exceptions:** Invalid/expired/used token (422), password policy failed (422), password same as old (422)

### UC-08 Refresh Access Token — ✅ Implemented

- **Goal:** Generate a new access token.
- **Primary Actor:** Authenticated User
- **Preconditions:** Refresh token is valid; Session is active.
- **Trigger:** Access token expires.
- **Main flow:**
  1. Receive refresh token (from HttpOnly cookie)
  2. Hash it and validate (`isValid()`)
  3. Validate Session (`canRefresh()`)
  4. Generate a new access token
  5. **Rotate the refresh token** (in-place update of the same row's hash) and touch the session
  6. Return the access token and set the new refresh-token cookie
- **Exceptions:** Missing cookie (401), invalid/expired refresh token (422), session revoked/expired (422)

### UC-09 Logout Current Session — ✅ Implemented

- **Goal:** Logout from the current device.
- **Primary Actor:** Authenticated User
- **Main flow:**
  1. Identify the current Session (from the access token)
  2. Revoke the refresh token
  3. Close the Session
  4. Clear the refresh-token cookie
  5. Return success result
- **Exceptions:** Session not found / revoked (422)

### UC-10 Logout All Sessions — ✅ Implemented

- **Goal:** Logout from all devices.
- **Primary Actor:** Authenticated User
- **Main flow:**
  1. Find all active Sessions
  2. Revoke all refresh tokens
  3. Close all Sessions
  4. Clear the refresh-token cookie
  5. Return success result

### UC-11 View Active Sessions — ✅ Implemented

- **Goal:** View all active login Sessions.
- **Primary Actor:** Authenticated User
- **Main flow:**
  1. Find all active Sessions
  2. Return the Session list (id, deviceType, browser, os, lastActivityAt, expiresAt)
- **Note:** The response does **not** include a `current` flag (the original design showed one).

### UC-12 Revoke Specific Session — ✅ Implemented

- **Goal:** Logout a specific device.
- **Primary Actor:** Authenticated User
- **Preconditions:** Selected Session exists **and belongs to the current user**.
- **Main flow:**
  1. Find the selected Session
  2. Verify ownership
  3. Revoke the refresh token
  4. Close the Session
  5. Return success result
- **Exceptions:** Session not found, already revoked, or owned by another user (422)

### UC-13 Change Password — ✅ Implemented

- **Goal:** Change the account password.
- **Primary Actor:** Authenticated User
- **Preconditions:** User is logged in; current password is correct.
- **Trigger:** User submits the change-password form.
- **Main flow:**
  1. Verify current password
  2. Validate new password
  3. Check the new password is not the same as the current one
  4. Hash the new password
  5. Update the password
  6. Revoke all other Sessions (the current Session remains active)
  7. Return success result
- **Exceptions:** Current password incorrect (422), password policy failed (422), password same as old (422), Google-only account (401)

### UC-14 Get Current User — ✅ Implemented *(added in the current implementation)*

- **Goal:** Return the authenticated user's profile data.
- **Primary Actor:** Authenticated User
- **Main flow:**
  1. Find user by id (from the access token)
  2. Return `{ id, email, username, status, emailVerified, avatarUrl }`

---

## Business Rules

> **Legend:** ✅ Implemented · ⚠️ Partially implemented / behavior differs · ❌ Not implemented · 🔵 No longer applicable / superseded.

### Registration

| ID | Rule | Status |
|---|---|---|
| BR-01 | Each email address must belong to only one account. | ✅ (`email @unique`) |
| BR-02 | Each username must be unique across the platform. | ✅ (`username @unique`) |
| BR-03 | A user cannot register while already authenticated. | ❌ The register endpoint is public and does not check the caller's session. |
| BR-04 | Password must satisfy the platform password policy. | ✅ (8–64 chars, upper/lower/digit/special — `Password` VO) |
| BR-05 | Password must never be stored in plain text. | ✅ (bcrypt, 12 rounds) |
| BR-06 | A newly registered account must remain unverified until email verification is completed. | ✅ (`emailVerifiedAt = null` on register) |
| BR-07 | A verification token must be generated for every new registration. | ✅ |
| BR-08 | A verification token must have an expiration time. | ✅ (15 minutes) |
| BR-09 | Only one active email verification token may exist per user. | ✅ (previous token revoked before issuing a new one) |
| BR-10 | A verification email must be sent after successful registration. | ✅ (via Outbox → BullMQ) |
| BR-11 | If email delivery fails, the system must retry sending the verification email. | ✅ (BullMQ attempts: 3, exponential backoff; outbox retries) |
| BR-12 | A registration request must fail if the email already exists. | ✅ |
| BR-13 | A registration request must fail if the username already exists. | ✅ |
| BR-14 | The system must create the user account only after all validation rules succeed. | ✅ (transactional; P2002 race handled → 422) |

### Login

| ID | Rule | Status |
|---|---|---|
| BR-15 | A user must have a registered account before logging in. | ✅ |
| BR-16 | Only active accounts are allowed to log in. | ✅ (`isActive()`) |
| BR-17 | A banned or suspended account must not be allowed to log in. | ✅ (status check) |
| BR-18 | The provided password must match the stored password credential. | ✅ (bcrypt compare) |
| BR-19 | A successful login must create a new Session. | ⚠️ A new Session is created **unless** an active session already exists for the same user/device — then that session's token is rotated. |
| BR-20 | Each Session must have its own unique identifier. | ✅ |
| BR-21 | Each Session must be associated with exactly one user. | ✅ |
| BR-22 | A Refresh Token must belong to exactly one Session. | ✅ (`sessionId @unique`) |
| BR-23 | A Refresh Token must have an expiration time. | ✅ (15 days) |
| BR-24 | An Access Token must have an expiration time. | ✅ (15 minutes, JWT) |
| BR-25 | Every successful login must generate a new Access Token. | ✅ |
| BR-26 | Every successful login must generate a new Refresh Token. | ✅ (or rotate the existing one) |
| BR-27 | Every successful login must be recorded in the audit log. | ❌ No audit log exists. |
| BR-28 | Every failed login attempt must be recorded. | ✅ (stored on the User; reason logged server-side) |
| BR-29 | The number of consecutive failed login attempts must be tracked. | ✅ (`failedLoginAttempts`) |
| BR-30 | An account must be temporarily locked after exceeding the maximum allowed failed login attempts. | ✅ (5 attempts → locked 30 minutes) |
| BR-31 | A locked account must not be allowed to log in until the lock duration expires. | ✅ |
| BR-32 | A successful login must reset the failed login attempts counter. | ✅ (`recordSuccessfulLogin`) |
| BR-33 | A login request must fail if the supplied credentials are invalid. | ✅ (unified 401 — see Security) |

### Email Verification

| ID | Rule | Status |
|---|---|---|
| BR-34 | Every newly registered account must have an unverified email status. | ✅ |
| BR-35 | A verification token must be generated for every email verification request. | ✅ |
| BR-36 | A verification token must belong to exactly one user. | ✅ |
| BR-37 | A verification token must have an expiration time. | ✅ (15 minutes) |
| BR-38 | Only one active verification token may exist per user. | ✅ |
| BR-39 | A verification token may be used only once. | ✅ (`usedAt`, single-use) |
| BR-40 | An expired verification token must not be accepted. | ✅ |
| BR-41 | An invalid verification token must not be accepted. | ✅ |
| BR-42 | A verified email must not require verification again. | ✅ (`verifyEmail()` no-ops if already verified) |
| BR-43 | A user with a verified email must not receive another verification email. | ✅ (`EmailAlreadyVerifiedException`) |
| BR-44 | When a new verification token is issued, all previous active verification tokens must be revoked. | ✅ |
| BR-45 | A successful email verification must mark the user's email as verified. | ✅ |
| BR-46 | A successful email verification must invalidate the verification token. | ✅ (`usedAt` set) |
| BR-47 | Every successful email verification must be recorded in the audit log. | ❌ No audit log exists. |

### Forgot Password

| ID | Rule | Status |
|---|---|---|
| BR-48 | Only registered users may request a password reset. | ⚠️ The flow is implemented for registered users, but the response is identical for unknown emails (anti-enumeration). |
| BR-49 | A password reset token must be generated for each password reset request. | ✅ |
| BR-50 | A password reset token must belong to exactly one user. | ✅ |
| BR-51 | A password reset token must have an expiration time. | ✅ (15 minutes) |
| BR-52 | Only one active password reset token may exist per user. | ✅ |
| BR-53 | A password reset email must be sent after a successful password reset request. | ✅ (via Outbox → BullMQ) |
| BR-54 | When a new password reset token is issued, all previous active password reset tokens must be revoked. | ✅ |
| BR-55 | A password reset request must be recorded in the audit log. | ❌ No audit log exists. |
| BR-56 | The system must not reveal whether an email address exists when processing a password reset request. | ✅ (always returns 200; unknown email only logged) |

### Reset Password

| ID | Rule | Status |
|---|---|---|
| BR-57 | A password may be reset only with a valid password reset token. | ✅ |
| BR-58 | An expired password reset token must not be accepted. | ✅ |
| BR-59 | An invalid password reset token must not be accepted. | ✅ |
| BR-60 | A password reset token may be used only once. | ✅ (`usedAt` + `revokedAt`) |
| BR-61 | The new password must satisfy the platform password policy. | ✅ |
| BR-62 | The new password must not be the same as the current password. | ✅ |
| BR-63 | The new password must never be stored in plain text. | ✅ (bcrypt) |
| BR-64 | A successful password reset must invalidate the password reset token. | ✅ |
| BR-65 | A successful password reset must revoke all active Sessions. | ✅ |
| BR-66 | A successful password reset must revoke all active Refresh Tokens. | ✅ (revoked with their sessions) |
| BR-67 | A successful password reset must be recorded in the audit log. | ❌ No audit log exists. |
| BR-68 | The user must be required to authenticate again after a successful password reset. | ✅ (all sessions revoked → new login required) |

### Refresh Token

| ID | Rule | Status |
|---|---|---|
| BR-69 | A Refresh Token must be issued only after successful authentication. | ✅ |
| BR-70 | Each Refresh Token must be unique. | ⚠️ Unique per session (`sessionId @unique`); in-place rotation replaces the hash rather than creating a new row. |
| BR-71 | Each Refresh Token must belong to exactly one Session. | ✅ |
| BR-72 | A Refresh Token must have an expiration time. | ✅ (15 days) |
| BR-73 | An expired Refresh Token must not be accepted. | ✅ |
| BR-74 | A revoked Refresh Token must not be accepted. | ✅ |
| BR-75 | A Refresh Token may be used only while its associated Session is active. | ✅ (`session.canRefresh()`) |
| BR-76 | A successful token refresh must issue a new Access Token. | ✅ |
| BR-77 | The system may rotate the Refresh Token after a successful refresh. | ✅ |
| BR-78 | If Refresh Token Rotation is enabled, the previous Refresh Token must be revoked immediately after a successful refresh. | ⚠️ Rotation is **in-place**: the same row's `tokenHash` is overwritten, so the previous hash is immediately unusable. |
| BR-79 | Attempting to reuse a revoked Refresh Token must be considered a security event. | ❌ No reuse detection — replaying an old token simply fails token lookup. |
| BR-80 | A revoked or expired Session must invalidate its associated Refresh Token. | ✅ |

### Session Management

| ID | Rule | Status |
|---|---|---|
| BR-81 | Each successful login must create a new Session. | ⚠️ New session created unless an active session for the same user/device exists (then it is reused and its token rotated). |
| BR-82 | Each Session must have a unique identifier. | ✅ |
| BR-83 | Each Session must belong to exactly one user. | ✅ |
| BR-84 | A user may have multiple active Sessions simultaneously. | ✅ |
| BR-85 | Each Session must have an expiration time. | ✅ (15 days, absolute) |
| BR-86 | An expired Session must not be considered active. | ✅ |
| BR-87 | Revoking a Session must revoke its associated Refresh Token. | ✅ (`revokeSessionAndToken`) |
| BR-88 | Logging out from the current device must revoke only the current Session. | ✅ |
| BR-89 | Logging out from all devices must revoke all active Sessions of the user. | ✅ |
| BR-90 | A user may revoke any of their active Sessions except those that no longer exist. | ✅ (ownership enforced) |
| BR-91 | Every Session creation must be recorded in the audit log. | ❌ No audit log exists. |
| BR-92 | Every Session revocation must be recorded in the audit log. | ❌ No audit log exists. |
| BR-93 | Session metadata (device, browser, IP address, last activity) should be stored for security purposes. | ✅ (`deviceType`, `browser`, `operatingSystem`, `ipAddress`, `userAgent`, `lastActivityAt`) |

### Change Password

| ID | Rule | Status |
|---|---|---|
| BR-94 | Only an authenticated user may change their password. | ✅ (Bearer required) |
| BR-95 | The current password must be verified before changing the password. | ✅ |
| BR-96 | The new password must satisfy the platform password policy. | ✅ |
| BR-97 | The new password must not be the same as the current password. | ✅ |
| BR-98 | The new password must never be stored in plain text. | ✅ (bcrypt) |
| BR-99 | A successful password change must revoke all other active Sessions. | ✅ |
| BR-100 | The current Session may remain active after a successful password change. | ✅ |
| BR-101 | A successful password change must revoke all Refresh Tokens associated with revoked Sessions. | ✅ |
| BR-102 | A successful password change must be recorded in the audit log. | ❌ No audit log exists. |

### Security

| ID | Rule | Status |
|---|---|---|
| BR-103 | Every authentication-related action must be recorded in the audit log. | ❌ No audit log exists. |
| BR-104 | Authentication endpoints must be protected against brute-force attacks. | ❌ No rate limiting (planned but not implemented). |
| BR-105 | The system must temporarily lock an account after exceeding the maximum allowed failed login attempts. | ✅ (5 attempts) |
| BR-106 | A locked account must automatically become available after the configured lock duration expires. | ✅ (30 minutes; lock is time-based) |
| BR-107 | Security-sensitive tokens must be generated using cryptographically secure random values. | ✅ (`randomBytes(32)`) |
| BR-108 | Sensitive credentials and tokens must never be stored or transmitted in plain text. | ✅ (bcrypt for passwords; SHA-256 for tokens; HttpOnly cookie) |
| BR-109 | Authentication-related tokens must be invalidated after expiration or revocation. | ✅ |
| BR-110 | Security-related events should be available for monitoring and auditing. | ⚠️ Operational logging exists; no structured audit log. |

---

## Domain Model

### User Entity

- **Purpose:** Represents a person who owns an account and can authenticate to access the platform.
- **Aggregate:** User (Aggregate Root)
- **Attributes:** `id`, `email`, `username`, `passwordHash`, `googleId`, `avatarUrl`, `emailVerifiedAt`, `status`, `failedLoginAttempts`, `lockedUntil`, `lastLoginAt`, `createdAt`, `updatedAt`
- **Behaviors (current):** `register()`, `registerWithGoogle()`, `verifyEmail()`, `changePassword()`, `recordSuccessfulLogin()`, `recordFailedLogin()`, `lock()`, `unlock()`, `suspend()`, `activate()`, `ban()`, `markAsDeleted()`, `isLocked()`, `isEmailVerified()`, `isActive()`, `hasPassword()`
  - *Original behaviors `login()`, `resetPassword()`, `resetFailedLoginAttempts()`, `lockAccount()`, `canLogin()` are not present as methods; their behavior is covered by the handlers and the remaining methods above.*
- **Business Rules:** BR-01…BR-14, BR-16…BR-33, BR-94…BR-102 (see tables above)
- **Relationships:**
  - One User can own many Sessions.
  - One User can have one active Verification Token.
  - One User can have one active Password Reset Token.

### Session Entity

- **Purpose:** Represents a single authenticated login session created after a successful authentication. It tracks a user's active device, manages session lifecycle, and serves as the owner of the associated Refresh Token.
- **Aggregate:** Session (Aggregate Root)
- **Attributes:** `id`, `userId`, `status (ACTIVE, REVOKED, EXPIRED)`, `deviceType (DESKTOP, MOBILE, TABLET, UNKNOWN)`, `browser`, `operatingSystem`, `ipAddress`, `userAgent`, `lastActivityAt`, `expiresAt`, `revokedAt`, `createdAt`, `updatedAt`
  - *The original `deviceName` attribute is not present; device info is stored via `deviceType`, `browser`, and `operatingSystem`.*
- **Behaviors:** `create()`, `revoke()`, `expire()`, `refreshActivity()`, `isActive()`, `isExpired()`, `isRevoked()`, `canRefresh()`
- **Business Rules:** BR-19–BR-23, BR-69–BR-75, BR-80–BR-93 (see tables above)
- **Relationships:**
  - Each Session belongs to exactly one User.
  - Each Session owns exactly one active Refresh Token.

### VerificationToken Entity

- **Purpose:** Represents a one-time token used to verify a user's email address after registration or when requesting email verification again.
- **Aggregate:** User Aggregate
- **Attributes:** `id`, `userId`, `tokenHash`, `expiresAt`, `usedAt`, `revokedAt`, `createdAt`
- **Behaviors:** `create()`, `revoke()`, `use()`, `isExpired()`, `isRevoked()`, `isUsed()`, `isUsable()`
  - *Original `markAsUsed()` / `isValid()` are named `use()` / `isUsable()` in the current code.*
- **Business Rules:** BR-07–BR-09, BR-34–BR-46 (see tables above)
- **Relationships:**
  - Each VerificationToken belongs to exactly one User.
  - A User may have only one active VerificationToken.

### PasswordResetToken Entity

- **Purpose:** Represents a one-time token used to securely reset a user's password.
- **Aggregate:** User Aggregate
- **Attributes:** `id`, `userId`, `tokenHash`, `expiresAt`, `usedAt`, `revokedAt`, `createdAt`
- **Behaviors:** `create()`, `revoke()`, `use()`, `isExpired()`, `isRevoked()`, `isUsed()`, `isUsable()`
- **Business Rules:** BR-49–BR-54, BR-57–BR-64 (see tables above)
- **Relationships:**
  - Each PasswordResetToken belongs to exactly one User.
  - A User may have only one active PasswordResetToken.

### RefreshToken Entity

- **Purpose:** Represents a long-lived credential used to obtain new Access Tokens while the associated Session remains active.
- **Aggregate:** Session Aggregate
- **Attributes:** `id`, `sessionId`, `tokenHash`, `expiresAt`, `revokedAt`, `createdAt`
- **Behaviors:** `create()`, `revoke()`, `rotate(hash)`, `isExpired()`, `isRevoked()`, `isValid()`
- **Business Rules:** BR-22–BR-23, BR-69–BR-80 (see tables above)
- **Relationships:**
  - Each RefreshToken belongs to exactly one Session.
  - Each Session owns exactly one active RefreshToken.

---

## Domain Events

> **Important:** The original design listed events `DE-01`…`DE-14` (`UserRegistered`, `EmailVerificationRequested`, `EmailVerified`, `UserLoggedIn`, `LoginFailed`, `AccountLocked`, `SessionRevoked`, `AllSessionsRevoked`, `RefreshTokenRotated`, `PasswordResetRequested`, `PasswordResetCompleted`, `PasswordChanged`, `UserLoggedOut`, `SecurityEventDetected`).
> **In the current implementation only two events exist**, and they are published through the **Outbox Pattern** (never synchronously inside the request):

### DE-A: VerificationTokenEvent — ✅ Implemented

- **Description:** Request to send a verification email.
- **Triggered By:** Registration (UC-01) and Resend Verification Email (UC-05).
- **Published By:** `VerificationTokenService` (via `OutboxMessage` stored in the same transaction).
- **Consumed By:** `VerificationTokenEventHandler` → `EmailProducer` (abstract port) → `BullMQEmailProducer` (infrastructure) → `VerificationEmailWorker` (authentication infrastructure) → `EmailSender` (shared) → SMTP.
- **Payload:** `userId`, `email`, `username`, `verificationToken` (plain token, delivered only to the user's email).

### DE-B: PasswordResetTokenEvent — ✅ Implemented

- **Description:** Request to send a password reset email.
- **Triggered By:** Forgot Password (UC-06).
- **Published By:** `ForgotPasswordHandler` (via `OutboxMessage` stored in the same transaction).
- **Consumed By:** `PasswordResetTokenEventHandler` → `EmailProducer` (abstract port) → `BullMQEmailProducer` (infrastructure) → `PasswordResetEmailWorker` (authentication infrastructure) → `EmailSender` (shared) → SMTP.
- **Payload:** `email`, `passwordResetToken` (plain token, delivered only to the user's email).

### Outbox behavior

- `OutboxProcessorService` polls every 5 seconds (batch of 20), reconstructs the event from the stored payload via an injected event-factory map (`OUTBOX_EVENT_FACTORIES` registered by the Authentication module), publishes it on the `EventBus`, and marks the message processed.
- Unknown event type → message discarded with a warning.
- Failed processing → `attempts` incremented; after 5 attempts the message is discarded.

---

## Domain Modules

### Auth

- Register
- Login
- Refresh Token
- Google Login

### Session

- Session
- Logout (current / all / specific)
- Active Devices

### Verification

- Verify Email
- Resend Email

### Password

- Forgot Password
- Reset Password
- Change Password

### User

- Get Current User *(added in the current implementation)*

---

## Architecture

### Prisma schema (multi-file)

```
prisma/
├── schema.prisma            # generator + datasource only
├── outbox-message.prisma    # OutboxMessage model (shared)
└── identity/
    └── authentication/
        ├── user.prisma
        ├── session.prisma
        ├── verification-token.prisma
        ├── password-reset-token.prisma
        └── refresh-token.prisma
```

### Authentication module layout (current)

```
src/modules/identity/authentication/
├── authentication.module.ts
├── domain/          # entities, value-objects, repository interfaces, enums, exceptions
├── application/     # commands, queries, handlers, services, factories, ports, contracts,
│                    # events, event-handlers, config, DI tokens
├── infrastructure/  # prisma repositories, cached repositories, mappers, security (JWT/bcrypt/tokens/clock/Google),
│   └── email/       # Authentication-specific email infrastructure:
│       ├── email.producer.ts          # BullMQEmailProducer (implements EmailProducer port)
│       ├── email.module.ts            # AuthenticationEmailModule (DI wiring)
│       ├── jobs/                      # send-email.jobs.ts (job constants & interfaces)
│       ├── workers/                   # VerificationEmailWorker, PasswordResetEmailWorker
│       └── templates/                 # VerifyEmailTemplate, PasswordResetEmailTemplate
└── presentation/    # controllers, DTOs, guards, decorators, mappers, swagger
```

### Shared infrastructure used by Authentication

- `shared/prisma` — PrismaClient + PrismaPg adapter (global)
- `shared/redis` — ioredis client (global)
- `shared/queue` — BullMQ root + `email` queue registration
- `shared/email` — Generic SMTP sender (`EmailSender` abstraction + `SmtpEmailSender` implementation); authentication-specific email code (producer, workers, templates, jobs) lives under `authentication/infrastructure/email/`
- `shared/common` — Outbox entity/repository/processor, event-factory contract, response envelope types
- `shared/error-handling` — domain/application/infrastructure error base classes, common errors, global filter, validation pipe
- `shared/response-handling` — response interceptor and decorators

---

## ERD (database schema)

### users Table

- **Purpose:** Stores authentication-related information for platform users.
- **Columns:**

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| email | VARCHAR(255) | UNIQUE, indexed |
| username | VARCHAR(50) | UNIQUE, indexed |
| password_hash | VARCHAR(255) | Nullable (null for Google-only accounts) |
| google_id | VARCHAR(255) | UNIQUE, Nullable |
| avatar_url | VARCHAR(500) | Nullable |
| status | ENUM(ACTIVE, BANNED, SUSPENDED, DELETED) | default ACTIVE, indexed |
| email_verified_at | TIMESTAMPTZ | Nullable |
| failed_login_attempts | INTEGER | default 0 |
| locked_until | TIMESTAMPTZ | Nullable |
| last_login_at | TIMESTAMPTZ | Nullable |
| created_at / updated_at | TIMESTAMPTZ | — |

### sessions Table

- **Purpose:** Stores authenticated user sessions and device information.
- **Columns:**

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id, indexed, onDelete CASCADE |
| status | ENUM(ACTIVE, REVOKED, EXPIRED) | default ACTIVE, indexed |
| device_type | ENUM(DESKTOP, MOBILE, TABLET, UNKNOWN) | default UNKNOWN |
| browser | VARCHAR(100) | — |
| operating_system | VARCHAR(100) | — |
| ip_address | INET | — |
| user_agent | TEXT | — |
| last_activity_at | TIMESTAMPTZ | — |
| expires_at | TIMESTAMPTZ | — |
| revoked_at | TIMESTAMPTZ | Nullable |
| created_at / updated_at | TIMESTAMPTZ | — |

### verification_tokens Table

- **Purpose:** Stores one-time email verification tokens.
- **Columns:**

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id, indexed, onDelete CASCADE |
| token_hash | VARCHAR(255) | **UNIQUE** |
| expires_at | TIMESTAMPTZ | — |
| used_at | TIMESTAMPTZ | Nullable |
| revoked_at | TIMESTAMPTZ | Nullable |
| created_at | TIMESTAMPTZ | — |

### password_reset_tokens Table

- **Purpose:** Stores one-time password reset tokens.
- **Columns:**

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id, indexed, onDelete CASCADE |
| token_hash | VARCHAR(255) | **UNIQUE** |
| expires_at | TIMESTAMPTZ | — |
| used_at | TIMESTAMPTZ | Nullable |
| revoked_at | TIMESTAMPTZ | Nullable |
| created_at | TIMESTAMPTZ | — |

### refresh_tokens Table

- **Purpose:** Stores Refresh Tokens associated with user sessions.
- **Columns:**

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| session_id | UUID | **UNIQUE**, FK → sessions.id, onDelete CASCADE |
| token_hash | VARCHAR(255) | — |
| expires_at | TIMESTAMPTZ | indexed |
| revoked_at | TIMESTAMPTZ | Nullable |
| created_at | TIMESTAMPTZ | — |

### outbox_messages Table *(added in the current implementation)*

- **Purpose:** Stores transactional outbox messages for async event publishing.
- **Columns:** `id`, `event_type`, `payload (JSON)`, `created_at`, `processed_at (Nullable, indexed)`, `attempts (default 0)`, `last_error (Nullable)`

---

## Endpoints

> All endpoints are served under the global prefix `api` (e.g. `/api/auth/...`).
> Success responses are wrapped in a standard envelope:
> `{ success, statusCode, message, data, error, correlationId, userIP, timestamp }`.

### Register

- **POST /api/auth/register** — Public
- **Request DTO:** `{ "email": "...", "username": "...", "password": "..." }`
- **Response:** `data: { accessToken }` + HttpOnly `refreshToken` cookie
- **Status codes:** 201 Created · 400 Bad Request (validation) · 422 (duplicate email/username, weak password)

### Login

- **POST /api/auth/login** — Public
- **Request DTO:** `{ "emailOrUsername": "...", "password": "..." }`
- **Response:** `data: { accessToken }` + HttpOnly `refreshToken` cookie
- **Status codes:** 200 Success · 400 Bad Request · 401 (invalid credentials, unified) · 422 (email not verified)

### Login with Google

- **GET /api/auth/google** — Public — redirects to Google consent screen
- **GET /api/auth/google/callback** — Public — redirects to frontend with `#accessToken=...` + sets refresh-token cookie
- **Status codes:** 302 Redirect · 401 (Google email not verified) · 422 (email exists without Google)

### Refresh Token

- **POST /api/auth/refresh-token** — Public (reads the `refreshToken` cookie)
- **Request DTO:** none
- **Response:** `data: { accessToken }` + new HttpOnly `refreshToken` cookie
- **Status codes:** 200 Success · 401 (cookie missing) · 422 (invalid/expired token, invalid session)

### Logout Current Device

- **DELETE /api/auth/logout** — Bearer
- **Response:** clears the refresh-token cookie
- **Status codes:** 200 Success · 401 Unauthorized · 422

### Logout All Devices

- **DELETE /api/auth/sessions** — Bearer
- **Response:** clears the refresh-token cookie
- **Status codes:** 200 Success · 401 Unauthorized

### Email Verification

- **POST /api/auth/verify-email** — Public
- **Request DTO:** `{ "verificationToken": "..." }`
- **Status codes:** 200 Success · 400 Bad Request · 422 (invalid/expired/used token)

### Email Verification Resend

- **POST /api/auth/resend-verification-token** — Bearer *(changed from the original design: authenticated, user derived from the token)*
- **Status codes:** 200 Success · 401 Unauthorized · 404 (user not found) · 422 (already verified / too soon)

### Password Recovery (Forgot)

- **POST /api/auth/forgot-password** — Public
- **Request DTO:** `{ "email": "..." }`
- **Response:** 200 always (anti user-enumeration)
- **Status codes:** 200 Success · 400 Bad Request (validation)

### Password Reset

- **POST /api/auth/reset-password** — Public
- **Request DTO:** `{ "token": "...", "password": "..." }`
- **Status codes:** 200 Success · 400 Bad Request · 422 (invalid token, same password)

### Password Change

- **PATCH /api/auth/change-password** — Bearer
- **Request DTO:** `{ "currentPassword": "...", "newPassword": "..." }`
- **Status codes:** 200 Success · 401 Unauthorized · 422 (wrong current password, same password, Google-only account)

### Sessions (View)

- **GET /api/auth/sessions** — Bearer
- **Response:** `data: [{ id, deviceType, browser, os, lastActivityAt, expiresAt }]`
- **Status codes:** 200 Success · 401 Unauthorized

### Sessions (Revoke Specific)

- **DELETE /api/auth/sessions/:sessionId`** — Bearer
- **Status codes:** 200 Success · 401 Unauthorized · 422 (not found / not owned / revoked)

### Get Current User

- **GET /api/auth/me`** — Bearer
- **Response:** `data: { id, email, username, status, emailVerified, avatarUrl }`
- **Status codes:** 200 Success · 401 Unauthorized · 404 (user not found)

---

## Changes from Original Design

The following differences exist between the original design document and the current implementation.

### Use Cases / Endpoints

| Item | Original Design | Current Implementation | Reason | Impact |
|---|---|---|---|---|
| Global API prefix | `/auth/...` | `/api/auth/...` | Global prefix `api` set in `main.ts` (Swagger excluded). | All routes moved under `/api`. |
| Refresh Token route | `POST /auth/refresh` | `POST /api/auth/refresh-token` | Naming decision during implementation. | Client must call the new route. |
| Logout route/method | `POST /auth/logout` | `DELETE /api/auth/logout` | Implementation choice; logout is a destructive operation. | Client must use DELETE. |
| Forgot password route | `POST /auth/password/forgot` | `POST /api/auth/forgot-password` | Naming decision. | Route changed. |
| Reset password route | `POST /auth/password/reset` | `POST /api/auth/reset-password` | Naming decision. | Route changed. |
| Change password route | `PATCH /auth/password` | `PATCH /api/auth/change-password` | Naming decision. | Route changed. |
| Resend verification route | `POST /auth/resend-verification` (Guest, body: email) | `POST /api/auth/resend-verification-token` (**Bearer**, user from token) | Security improvement — the resend action is now tied to the authenticated session. | Client must send the access token; no email body. |
| Get Current User | (not in original endpoint list) | `GET /api/auth/me` | Implemented use case. | New endpoint. |
| Google OAuth endpoints | (implied by UC-03, not listed) | `GET /api/auth/google`, `GET /api/auth/google/callback` | Implemented. | New endpoints; token delivered via **URL fragment** instead of a query string. |
| Register response | message only | `data: { accessToken }` + refresh-token cookie | Session is created at registration. | Client receives tokens immediately. |
| Login response | `{ user, accessToken, expiresIn }` | `data: { accessToken }` + cookie (no user object, no expiresIn) | Implementation decision; user data is fetched via `/me`. | Response shape differs. |
| View sessions response | includes `current: true` flag | no `current` flag | Not implemented. | Client cannot identify the current session from this list. |

### Business Rules

| Rule | Original Design | Current Implementation | Reason | Impact |
|---|---|---|---|---|
| BR-03 (register while authenticated) | Not allowed | Not enforced (public endpoint) | Simplification. | Any guest can register. |
| BR-19/BR-81 (new session per login) | New Session on every login | Reuses an active session for the same user+device and rotates its token | Avoids unbounded session growth per device. | One active session per device instead of many. |
| BR-27/47/55/67/91/92/102/103 (audit log) | Audit log required | **No audit log exists** | Not implemented. | Monitoring/auditing of auth events is missing. |
| BR-30/105/106 (account lock) | Lock after max failed attempts | Implemented: 5 attempts → 30-minute lock; unlock on successful login or time expiry | Consistent. | Implemented as designed (no admin unlock endpoint). |
| BR-56 (forgot-password enumeration) | Must not reveal email existence | Always returns 200; unknown email only logged | Security hardening added during refactoring. | Enumeration is prevented. |
| BR-78 (rotation revokes previous token) | Revoke previous token row | In-place rotation overwrites the hash on the same row | Consistent with `sessionId @unique`; avoids row growth. | Old hash immediately unusable. |
| BR-79 (reuse detection) | Reuse must be a security event | **Not implemented** — replaying an old token just fails lookup | Deferred (requires schema change). | Token-theft detection is weaker. |
| BR-104 (rate limiting) | Required | **Not implemented** | Deferred. | Brute-force protection relies on account locking only. |
| Login email-verification gate | (not explicit in original) | Unverified emails cannot log in (`EmailNotVerifiedException`) | Implemented during refactoring to align with the intended `canLogin()` design. | Stricter login behavior. |
| Login error unification | distinct errors | All failures → unified `401 INVALID_CREDENTIALS` | Anti user-enumeration hardening during refactoring. | Client sees one generic error. |

### Domain / Events

| Item | Original Design | Current Implementation | Reason | Impact |
|---|---|---|---|---|
| Domain events DE-01…DE-14 | Rich set (UserRegistered, EmailVerified, UserLoggedIn, …) | Only two events exist: `VerificationTokenEvent`, `PasswordResetTokenEvent` | The other events were never implemented; email flows use the outbox events. | No event-driven hooks exist for login/logout/password events. |
| Event publishing | Domain events | Events are stored in the **Outbox** table in the same transaction and published by a polling processor | Outbox Pattern to avoid the dual-write problem. | Async email delivery with retry. |
| `User.canLogin()` | Existed in design | Removed during refactoring; logic is enforced in `LoginHandler` (`isActive` + `isLocked` + `isEmailVerified`) | Dead code cleanup. | Same behavior, enforced at the application layer. |
| `Session.deviceName` | In design | Not present; replaced by `deviceType` + `browser` + `operatingSystem` | Schema decision during implementation. | Device info is stored differently. |
| `VerificationToken.isValid()` / `markAsUsed()` | Original naming | `isUsable()` / `use()` | Naming decision. | — |
| `RefreshToken` uniqueness | One token per session | `sessionId @unique` + in-place rotation | Consistent with rotation. | One row per session. |
| Email ownership | Authentication-specific emails in `shared/email` | Authentication owns email workers, templates, jobs, and producer; `shared/email` only provides generic `EmailSender` | Architecture separation: business-specific email code belongs to the owning module. | `authentication/infrastructure/email/` contains all auth email infrastructure; `shared/email/` is generic. |
| Application → Email dependency | Event handlers depend on concrete `EmailProducer` (BullMQ) | Event handlers depend on `EmailProducer` abstract port; `BullMQEmailProducer` implements it in infrastructure | Dependency inversion: Application never depends on concrete BullMQ/Redis implementations. | Cleaner architecture; Application layer is infrastructure-agnostic. |

### Database

| Item | Original Design | Current Implementation | Reason | Impact |
|---|---|---|---|---|
| `users.email` | VARCHAR(320) | VARCHAR(255) | Implementation decision. | Shorter max email length. |
| `users` indexes | email, status; locked_until indexed | email, username, status indexed (no locked_until index) | Implementation decision. | Slightly different index set. |
| `google_id`, `avatar_url` | (not in original) | Present on `users` | Required for Google OAuth. | New columns. |
| `verification_tokens.token_hash` | VARCHAR(255) | **UNIQUE** | Single-use enforcement at DB level. | Stronger integrity. |
| `password_reset_tokens.token_hash` | VARCHAR(255) | **UNIQUE** | Same as above. | Stronger integrity. |
| `refresh_tokens.session_id` | UNIQUE | UNIQUE (FK, onDelete CASCADE) | Consistent with rotation. | One token per session. |
| `outbox_messages` table | (not in original) | Present | Outbox Pattern. | New table. |

### Security

| Item | Original Design | Current Implementation | Reason | Impact |
|---|---|---|---|---|
| Refresh token cookie | HttpOnly | HttpOnly + Secure (non-dev) + SameSite=Strict, 15-day maxAge | Hardening. | Stronger cookie policy. |
| Token hashing | — | SHA-256 for refresh/verification/reset tokens | Hardening. | Tokens are never stored in plain text. |
| Google access token delivery | — | URL **fragment** (`#accessToken=...`) | Prevents leakage via Referer/history. | Frontend contract changed. |
| Locked error message | includes `lockedUntil` | `lockedUntil` removed from the public message (kept in metadata) | Information-disclosure hardening during refactoring. | Less detail exposed. |
| PII in logs | — | Removed metadata from the global error filter's warning logs | Hardening during refactoring. | Less PII in logs. |

### Not determined

- **Reason for several naming/route choices** (e.g. `/refresh-token` vs `/refresh`, `change-password` vs `/password`) **could not be determined from the available sources**; they are consistent implementation choices made during development.
- **Reason for the email column width (255 vs 320)** could not be determined from the available sources.
