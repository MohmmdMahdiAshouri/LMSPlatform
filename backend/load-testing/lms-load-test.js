import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom Metrics for deep observability
const loginSuccessRate = new Rate('login_success_rate');
const registerSuccessRate = new Rate('register_success_rate');
const loginDuration = new Trend('login_duration_ms');

// Configuration
const BASE_URL = __ENV.TARGET_URL || 'http://localhost:8080';
const TOTAL_SEEDED_USERS = 50000;

export const options = {
  scenarios: {
    // Realistic production load simulation:
    // Starts slow, ramps up to stress traffic, sustains, and cools down.
    production_simulation: {
      executor: 'ramping-arrival-rate',
      startRate: 50,                // 50 requests/sec initial
      timeUnit: '1s',
      preAllocatedVUs: 200,         // warm pool of virtual users
      maxVUs: 2000,                 // scale up to 2000 concurrent VUs if needed
      stages: [
        { target: 200, duration: '1m' },   // Stage 1: Warmup to 200 RPS
        { target: 500, duration: '2m' },   // Stage 2: Normal traffic (500 RPS)
        { target: 1200, duration: '5m' },  // Stage 3: Peak traffic (1200 RPS)
        { target: 1200, duration: '5m' },  // Stage 4: Sustained heavy load
        { target: 100, duration: '1m' },   // Stage 5: Ramp-down
      ],
    },
  },
  thresholds: {
    // Production Quality Gates (SLA)
    http_req_failed: ['rate<0.02'],              // Failure rate should remain < 2%
    http_req_duration: ['p(95)<800', 'p(99)<1500'], // 95% of requests under 800ms
    login_success_rate: ['rate>0.98'],          // 98%+ of logins must succeed
  },
};

export default function () {
  // Realistic user action probability distribution:
  // - 70% read/navigation traffic (/health)
  // - 20% login with one of the 50,000 real seeded accounts
  // - 10% new user registrations (write-heavy with outbox)
  const roll = Math.random();

  if (roll < 0.70) {
    // ----------------------------------------------------
    // Scenario A: Read / Navigational request (70%)
    // ----------------------------------------------------
    const res = http.get(`${BASE_URL}/health`, {
      tags: { name: 'HealthCheck' },
    });

    check(res, {
      'health status is 200': (r) => r.status === 200,
    });
  } 
  else if (roll < 0.90) {
    // ----------------------------------------------------
    // Scenario B: User Login (20%)
    // Tests: SQL Index lookup, BCrypt Hash verification (CPU intensive),
    // Session entity generation, and RefreshToken cookie assignment.
    // ----------------------------------------------------
    const randomUserNumber = Math.floor(Math.random() * TOTAL_SEEDED_USERS) + 1;
    const payload = JSON.stringify({
      identifier: `user_${randomUserNumber}`,
      password: 'Password123!',
    });

    const params = {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'Auth_Login' },
    };

    const start = Date.now();
    const res = http.post(`${BASE_URL}/api/authentication/login`, payload, params);
    loginDuration.add(Date.now() - start);

    const isSuccess = res.status === 200;
    loginSuccessRate.add(isSuccess);

    check(res, {
      'login status 200': (r) => r.status === 200,
      'has access token': (r) => {
        try {
          const body = r.json();
          return body && body.data && body.data.accessToken !== undefined;
        } catch (_) {
          return false;
        }
      },
    });
  } 
  else {
    // ----------------------------------------------------
    // Scenario C: User Registration (10%)
    // Tests: DB uniqueness checks, BCrypt generation, Verification Token,
    // and Outbox Message transactional insert.
    // ----------------------------------------------------
    const uniqueSuffix = `${__VU}_${__ITER}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const payload = JSON.stringify({
      email: `load_${uniqueSuffix}@lms.local`,
      username: `k6_${uniqueSuffix}`.substring(0, 45),
      password: 'Password123!',
    });

    const params = {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'Auth_Register' },
    };

    const res = http.post(`${BASE_URL}/api/authentication/register`, payload, params);
    const isSuccess = res.status === 201;
    registerSuccessRate.add(isSuccess);

    check(res, {
      'register status 201': (r) => r.status === 201,
    });
  }

  // Think time: brief random pause between requests per user
  sleep(Math.random() * 0.5 + 0.1);
}

