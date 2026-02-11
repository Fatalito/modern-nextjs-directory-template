#!/bin/bash
set -e
set -o pipefail

if [ "$CI" != "true" ]; then
  echo "🚀 Running performance check locally..."
fi

echo "Cleaning old test results..."
rm -rf test-results/
mkdir -p test-results

echo "Running E2E tests and capturing metrics..."
npx playwright test -g '@perf' --repeat-each=3 --workers=1
