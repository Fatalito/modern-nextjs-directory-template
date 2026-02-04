#!/bin/bash
set -e
set -o pipefail

if [ "$CI" != "true" ]; then
  echo "🚀 Running performance check locally..."
fi

echo "Cleaning old test results..."
rm -rf test-results/
mkdir -p test-results

if [ "$CI" == "true" ]; then
  echo "Checking server status on port 3000..."
  if ! curl -s --head  --request GET http://localhost:3000 | grep "200 OK" > /dev/null; then
    echo "Error: Next.js server is not running on port 3000."
    exit 1
  fi
fi

echo "Warming up routes..."
curl -s -o /dev/null http://localhost:3000/

echo "Running E2E tests and capturing metrics..."
npx playwright test -g '@perf' --repeat-each=3 --workers=1 2>&1 | tee playwright-output.txt
