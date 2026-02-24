#!/bin/bash
set -e
set -o pipefail

echo "Running performance check against: ${BASE_URL:-http://localhost:3000}"

echo "Cleaning old test results..."
rm -rf test-results/
mkdir -p test-results

echo "Running E2E tests and capturing metrics..."
npx playwright test -g '@perf' --repeat-each=3 --workers=1
