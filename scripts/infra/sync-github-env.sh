#!/usr/bin/env bash
# Sync all CI-required vars from .env (and .vercel/) to GitHub Actions.
# GitHub is the single source of truth — deploy workflows push vars to Vercel
# at deploy time rather than storing them permanently in Vercel's dashboard.
#
# Secrets (masked in logs):
#   DATABASE_URL, DATABASE_AUTH_TOKEN       ← pushed to Vercel at deploy time by CI
#   TURSO_API_TOKEN                         ← for PR DB forking
#   VERCEL_TOKEN                            ← for deployments
#   VERCEL_AUTOMATION_BYPASS_SECRET         ← for bypassing Vercel protection in tests
#   VERCEL_ORG_ID, VERCEL_PROJECT_ID        ← extracted from .vercel/project.json
#
# Variables (visible in UI):
#   TURSO_DB_NAME, TURSO_REGION
#
# SONAR_TOKEN and SNYK_TOKEN are not included — set them manually
# in GitHub repository settings (Settings → Secrets and variables → Actions).
#
# Prerequisites: gh CLI installed + authenticated (gh auth login)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

INFO="\033[34mINFO:\033[0m"
SUCCESS="\033[32mSUCCESS:\033[0m"
ERROR="\033[31mERROR:\033[0m"
WARN="\033[33mWARNING:\033[0m"

if ! command -v gh &>/dev/null; then
  echo -e "$ERROR gh CLI not found."
  echo "  Install: https://cli.github.com"
  exit 1
fi
if ! gh auth status &>/dev/null 2>&1; then
  echo -e "$ERROR Not authenticated to GitHub CLI."
  echo "  Run: gh auth login"
  exit 1
fi
if [ ! -f ".env" ]; then
  echo -e "$ERROR .env file not found."
  exit 1
fi

# ── Helpers ────────────────────────────────────────────────────────────────────
# shellcheck source=lib/utils.sh
source "$SCRIPT_DIR/lib/utils.sh"

push_secret() {
  local name="$1" value="$2"
  if [ -z "$value" ]; then
    echo -e "$WARN  → $name not found in .env — skipping"
    return
  fi
  echo -e "$INFO  → $name [secret]"
  gh secret set "$name" --body "$value"
}

push_variable() {
  local name="$1" value="$2"
  if [ -z "$value" ]; then
    echo -e "$WARN  → $name not found in .env — skipping"
    return
  fi
  echo -e "$INFO  → $name [variable]"
  gh variable set "$name" --body "$value"
}

# ── Database credentials (pushed to Vercel at deploy time by CI) ───────────────
echo -e "$INFO Syncing database credentials..."
push_secret "DATABASE_URL"        "$(get_env_var DATABASE_URL)"
push_secret "DATABASE_AUTH_TOKEN" "$(get_env_var DATABASE_AUTH_TOKEN)"

# ── Turso / Vercel / CI tokens ─────────────────────────────────────────────────
echo -e "$INFO Syncing CI secrets..."
push_secret "TURSO_API_TOKEN"                 "$(get_env_var TURSO_API_TOKEN)"
push_secret "VERCEL_TOKEN"                    "$(get_env_var VERCEL_TOKEN)"
push_secret "VERCEL_AUTOMATION_BYPASS_SECRET" "$(get_env_var VERCEL_AUTOMATION_BYPASS_SECRET)"

# ── Config variables ───────────────────────────────────────────────────────────
echo -e "$INFO Syncing CI variables..."
push_variable "TURSO_DB_NAME" "$(get_env_var TURSO_DB_NAME)"
push_variable "TURSO_REGION"  "$(get_env_var TURSO_REGION)"

# ── Vercel project IDs (from .vercel/project.json) ────────────────────────────
if [ -f ".vercel/project.json" ]; then
  VERCEL_ORG_ID=$(node -e "process.stdout.write(require('./.vercel/project.json').orgId)")
  VERCEL_PROJECT_ID=$(node -e "process.stdout.write(require('./.vercel/project.json').projectId)")
  push_secret "VERCEL_ORG_ID"     "$VERCEL_ORG_ID"
  push_secret "VERCEL_PROJECT_ID" "$VERCEL_PROJECT_ID"
else
  echo -e "$WARN  No .vercel/project.json found — VERCEL_ORG_ID and VERCEL_PROJECT_ID not synced."
  echo "  Run: vercel link, then re-run: npm run infra:sync:github"
fi

echo ""
echo -e "$SUCCESS All CI vars synced to GitHub."
echo ""
echo -e "$WARN SONAR_TOKEN and SNYK_TOKEN must be set manually in GitHub repository settings."
echo ""
