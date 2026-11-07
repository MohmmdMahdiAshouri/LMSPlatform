import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Extreme Stress Test Metrics
const failedRequests = new Rate('extreme_failed_rate');
const loginDuration = new Trend('extreme_login_duration_ms');
const registerDuration = new Trend('extreme_register_duration_ms');
const readDuration = new Trend('extreme_read_duration_ms');

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:8080';
const TOTAL_SEEDED_USERS = 50000;

export const options = {
  scenarios: {
    // Brutal Spike & Extreme Hammering Scenario:
    // Jump straight to 300 VUs in 5 seconds and maintain heavy pressure.
    extreme_spike: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '5s', target: 300 },   // Brutal ramp-up: 0 to 300 VUs in 5 seconds
        { duration: '25s', target: 300 },  // Sustained extreme pressure (300 VUs)
        { duration: '5s', target: 0 },     // Ramp-down
      ],
      gracefulRampDown: '5s',
    },
  },
  thresholds: {
    // In extreme stress testing, we observe how many errors occur and where it breaks.
    extreme_failed_rate: ['rate<0.10'], // We allow up to 10% errors under extreme stress
  },
};

export default function () {
  const roll = Math.random();

  if (roll < 0.40) {
    // -----------------------------------------------------------------
    // Scenario A: Rapid Read (40%) - Hammering Kestrel pipeline
    // -----------------------------------------------------------------
    const start = Date.now();
    const res = http.get(`${BASE_URL}/health`, {
      tags: { name: 'HealthCheck_Stress' },
    });
    readDuration.add(Date.now() - start);

    const isOk = res.status === 200;
    failedRequests.add(!isOk);
    check(res, { 'health ok': (r) => r.status === 200 });
  } 
  else if (roll < 0.70) {
    // -----------------------------------------------------------------
    // Scenario B: Heavy Login (30%) - CPU bound + SQL read lookup
    // -----------------------------------------------------------------
    const randomUserNumber = Math.floor(Math.random() * TOTAL_SEEDED_USERS) + 1;
    const payload = JSON.stringify({
      identifier: `user_${randomUserNumber}`,
      password: 'Password123!',
    });

    const params = {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'Login_Stress' },
      timeout: '30s',
    };

    const start = Date.now();
    const res = http.post(`${BASE_URL}/api/authentication/login`, payload, params);
    loginDuration.add(Date.now() - start);

    const isOk = res.status === 200;
    failedRequests.add(!isOk);
    check(res, { 'login ok': (r) => r.status === 200 });
  } 
  else {
    // -----------------------------------------------------------------
    // Scenario C: Concurrent Writes (30%) - Heavy DB transactions,
    // table locks, session creation, Outbox messages insertion!
    // -----------------------------------------------------------------
    const uniqueId = `${__VU}_${__ITER}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const payload = JSON.stringify({
      email: `stress_${uniqueId}@lms.local`,
      username: `st_${uniqueId}`.substring(0, 45),
      password: 'Password123!',
    });

    const params = {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'Register_Stress' },
      timeout: '30s',
    };

    const start = Date.now();
    const res = http.post(`${BASE_URL}/api/authentication/register`, payload, params);
    registerDuration.add(Date.now() - start);

    const isOk = res.status === 201;
    failedRequests.add(!isOk);
    check(res, { 'register ok': (r) => r.status === 201 });
  }

  // Very aggressive pacing: minimal sleep (0 - 20ms) to maximize pressure
  sleep(Math.random() * 0.02);
}
