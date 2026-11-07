-- ==============================================================================
-- LMS Platform - Load Testing Seed Script
-- Generates 50,000 realistic users, 25,000 sessions, and 25,000 refresh tokens.
-- All users have password: Password123!
-- ==============================================================================

USE [lms];
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET NOCOUNT ON;

DECLARE @passwordHash NVARCHAR(255) = '$2a$12$kMNFO3GOOZkTX9IXVWniHOZier4ow74slzjpXxkHKbUYbCTGi07YG';
DECLARE @now DATETIMEOFFSET = SYSDATETIMEOFFSET();
DECLARE @expires DATETIMEOFFSET = DATEADD(DAY, 30, @now);

PRINT '>> [1/3] Seeding 50,000 users...';

;WITH N10(n) AS (
    SELECT 1 FROM (VALUES (0),(1),(2),(3),(4),(5),(6),(7),(8),(9)) v(n)
),
Numbers(n) AS (
    SELECT TOP (50000) 
        ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) 
    FROM N10 a, N10 b, N10 c, N10 d, N10 e
)
INSERT INTO dbo.users (
    id,
    email,
    username,
    password_hash,
    google_id,
    avatar_url,
    email_verified_at,
    status,
    failed_login_attempts,
    locked_until,
    last_login_at,
    created_at,
    updated_at
)
SELECT
    NEWID() AS id,
    CONCAT(N'user_', n.n, N'@lms.local') AS email,
    CONCAT(N'user_', n.n) AS username,
    @passwordHash AS password_hash,
    NULL AS google_id,
    NULL AS avatar_url,
    @now AS email_verified_at,
    1 AS status, -- 1 = Active
    0 AS failed_login_attempts,
    NULL AS locked_until,
    NULL AS last_login_at,
    @now AS created_at,
    @now AS updated_at
FROM Numbers n
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.users u WHERE u.username = CONCAT(N'user_', n.n)
);

PRINT '>> [2/3] Seeding 25,000 active sessions and tokens...';

CREATE TABLE #TempSessions (
    session_id UNIQUEIDENTIFIER PRIMARY KEY,
    user_id UNIQUEIDENTIFIER,
    token_hash NVARCHAR(128)
);

INSERT INTO #TempSessions (session_id, user_id, token_hash)
SELECT TOP (25000)
    NEWID() AS session_id,
    u.id AS user_id,
    CONVERT(NVARCHAR(128), HASHBYTES('SHA2_256', CAST(NEWID() AS VARCHAR(36))), 2) AS token_hash
FROM dbo.users u
WHERE u.username LIKE 'user_%'
  AND NOT EXISTS (SELECT 1 FROM dbo.sessions s WHERE s.user_id = u.id)
ORDER BY u.created_at;

INSERT INTO dbo.sessions (
    id, user_id, status, device_type, browser, operating_system, ip_address, user_agent,
    last_activity_at, expires_at, revoked_at, created_at, updated_at
)
SELECT
    t.session_id,
    t.user_id,
    1 AS status, -- Active
    1 AS device_type, -- Desktop
    N'Chrome' AS browser,
    N'Linux' AS operating_system,
    N'127.0.0.1' AS ip_address,
    N'Mozilla/5.0 (k6 load test)' AS user_agent,
    @now, @expires, NULL, @now, @now
FROM #TempSessions t;

INSERT INTO dbo.refresh_tokens (
    id, session_id, token_hash, expires_at, revoked_at, created_at
)
SELECT
    NEWID() AS id,
    t.session_id,
    t.token_hash,
    @expires, NULL, @now
FROM #TempSessions t;

DROP TABLE #TempSessions;

PRINT '>> [3/3] Done. Verification:';
SELECT 
    (SELECT COUNT(*) FROM dbo.users) AS TotalUsers,
    (SELECT COUNT(*) FROM dbo.sessions) AS TotalSessions,
    (SELECT COUNT(*) FROM dbo.refresh_tokens) AS TotalRefreshTokens;
GO

