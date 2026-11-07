#!/usr/bin/env bash
set -e

# ==============================================================================
# LMS Platform - Production Load Test Runner
# Pins k6 to CPU cores 10-15 to ensure ZERO CPU contention with API / DB / Redis
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_FILE="${SCRIPT_DIR}/lms-load-test.js"
TARGET_URL="${TARGET_URL:-http://localhost:8080}"
K6_CPUS="10-15"

echo "=========================================================="
echo " Starting LMS Production Load Test"
echo " Target URL     : ${TARGET_URL}"
echo " CPU Isolation  : Pinned to Cores ${K6_CPUS}"
echo " API & DB Cores : SQLServer (0-3), API (4-7), Redis/Other (8-9)"
echo "=========================================================="

# Check if target API is reachable
echo ">> Checking API health at ${TARGET_URL}/health..."
if ! curl -sf "${TARGET_URL}/health" > /dev/null; then
    echo "ERROR: Cannot reach ${TARGET_URL}/health. Make sure 'docker compose up -d' is running."
    exit 1
fi
echo ">> API is healthy! Ready to start load test."

# Run via Docker (ensures no local k6 installation needed, and enforces --cpuset-cpus)
echo ">> Launching k6 in isolated container..."
docker run --rm -i \
    --name lms-k6-runner \
    --network="host" \
    --cpuset-cpus="${K6_CPUS}" \
    -e TARGET_URL="${TARGET_URL}" \
    -v "${TEST_FILE}:/scripts/test.js:ro" \
    grafana/k6:latest run /scripts/test.js "$@"

