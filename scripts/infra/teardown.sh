#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Full infrastructure teardown — destroys all cloud resources for this project.
#
# ⚠️  IRREVERSIBLE — all data will be permanently deleted.
#
# What this destroys:
#   1. Turso production database (all data lost)
#   2. Vercel project (all deployments and environment variables)
#   3. GitHub Actions secrets provisioned by infra:setup
#
# What requires manual cleanup afterwards:
#   SonarCloud → sonarcloud.io → Your projects → Delete project
#   Snyk       → app.snyk.io  → Settings       → Delete project
#
# Safe to re-run — already-deleted resources are skipped gracefully.
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

INFO="\033[34mINFO:\033[0m"
SUCCESS="\033[32mSUCCESS:\033[0m"
ERROR="\033[31mERROR:\033[0m"
WARN="\033[33mWARNING:\033[0m"
STEP="\033[1;36m──────────────────────────────────────────\033[0m"

# ── Helper ────────────────────────────────────────────────────────────────────
get_env_var() {
  grep -E "^${1}=" .env 2>/dev/null | head -1 | cut -d'=' -f2-
}

# ── 0. Confirmation gate ──────────────────────────────────────────────────────
echo -e "$STEP"
echo "  ⚠️   INFRASTRUCTURE TEARDOWN"
echo -e "$STEP"
echo ""
echo "  This will permanently destroy:"
echo "    • Turso production database (all data lost)"
echo "    • Vercel project (all deployments and env vars)"
echo "    • GitHub Actions secrets for this project"
echo ""

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")
CONFIRM_TARGET="${REPO:-$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" || echo "unknown")}"

echo "  Repository: $CONFIRM_TARGET"
echo ""
printf "  Type the repository name to confirm (%s): " "$CONFIRM_TARGET"
read -r CONFIRM
if [[ "$CONFIRM" != "$CONFIRM_TARGET" ]]; then
  echo -e "$ERROR Confirmation did not match. Aborting."
  exit 1
fi

echo ""
echo -e "$WARN Proceeding with teardown..."

# ── 1. Turso production database ──────────────────────────────────────────────
echo ""
echo -e "$STEP"
echo "  Step 1 of 3 — Destroy Turso database"
echo -e "$STEP"

if bash "$SCRIPT_DIR/turso-teardown.sh" --force; then
  echo -e "$SUCCESS Turso database destroyed."
else
  echo -e "$WARN Turso teardown failed or database already deleted — continuing."
fi

# ── 2. Vercel project ─────────────────────────────────────────────────────────
echo ""
echo -e "$STEP"
echo "  Step 2 of 3 — Remove Vercel project"
echo -e "$STEP"

if [ -f ".vercel/project.json" ]; then
  PROJECT_ID=$(node -e "process.stdout.write(require('./.vercel/project.json').projectId)")
  VERCEL_TOKEN="$(get_env_var VERCEL_TOKEN)"

  if [ -n "$VERCEL_TOKEN" ] && [ -n "$PROJECT_ID" ]; then
    RESULT=$(curl -s -o /dev/null -w "%{http_code}" \
      -X DELETE "https://api.vercel.com/v9/projects/$PROJECT_ID" \
      -H "Authorization: Bearer $VERCEL_TOKEN")
    if [ "$RESULT" = "200" ] || [ "$RESULT" = "204" ]; then
      echo -e "$SUCCESS Vercel project deleted."
    elif [ "$RESULT" = "404" ]; then
      echo -e "$INFO Vercel project already deleted — skipping."
    else
      echo -e "$WARN Could not delete Vercel project via API (HTTP $RESULT)."
      echo "  Delete manually: Vercel Dashboard → Project → Settings → Delete Project"
    fi
  else
    echo -e "$WARN VERCEL_TOKEN not set — skipping API call."
    echo "  Delete manually: Vercel Dashboard → Project → Settings → Delete Project"
  fi

  rm -rf .vercel
  echo -e "$INFO Removed .vercel/ directory."
else
  echo -e "$INFO No .vercel/project.json found — already removed or never linked."
fi

# ── 3. GitHub Actions secrets ─────────────────────────────────────────────────
echo ""
echo -e "$STEP"
echo "  Step 3 of 3 — Remove GitHub Actions secrets"
echo -e "$STEP"

if [ -n "$REPO" ]; then
  PROJECT_SECRETS=(
    DATABASE_URL
    DATABASE_AUTH_TOKEN
    TURSO_API_TOKEN
    VERCEL_TOKEN
    VERCEL_ORG_ID
    VERCEL_PROJECT_ID
    VERCEL_AUTOMATION_BYPASS_SECRET
  )

  for secret in "${PROJECT_SECRETS[@]}"; do
    if gh secret delete "$secret" --repo "$REPO" 2>/dev/null; then
      echo -e "$SUCCESS Deleted secret: $secret"
    else
      echo -e "$INFO Secret $secret not found — skipping."
    fi
  done

  # GitHub Variables (visible, not masked)
  PROJECT_VARS=(TURSO_DB_NAME TURSO_REGION)
  for var in "${PROJECT_VARS[@]}"; do
    if gh variable delete "$var" --repo "$REPO" 2>/dev/null; then
      echo -e "$SUCCESS Deleted variable: $var"
    else
      echo -e "$INFO Variable $var not found — skipping."
    fi
  done

  # SONAR_TOKEN and SNYK_TOKEN may be shared across projects — ask before deleting
  echo ""
  echo "  SONAR_TOKEN and SNYK_TOKEN may be reused across projects."
  read -r -p "  Delete SONAR_TOKEN from GitHub Secrets? (y/N): " del_sonar
  if [[ "$del_sonar" =~ ^[yY]$ ]]; then
    gh secret delete SONAR_TOKEN --repo "$REPO" 2>/dev/null \
      && echo -e "$SUCCESS Deleted SONAR_TOKEN." \
      || echo -e "$INFO SONAR_TOKEN not found."
  fi

  read -r -p "  Delete SNYK_TOKEN from GitHub Secrets? (y/N): " del_snyk
  if [[ "$del_snyk" =~ ^[yY]$ ]]; then
    gh secret delete SNYK_TOKEN --repo "$REPO" 2>/dev/null \
      && echo -e "$SUCCESS Deleted SNYK_TOKEN." \
      || echo -e "$INFO SNYK_TOKEN not found."
  fi
else
  echo -e "$WARN Could not determine repo — skipping GitHub secret cleanup."
  echo "  Delete manually: Settings → Secrets and variables → Actions"
fi

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "$STEP"
echo -e "  $SUCCESS Teardown complete."
echo -e "$STEP"
echo ""
echo "  Manual cleanup remaining:"
echo "    • SonarCloud: https://sonarcloud.io → Your projects → Delete project"
echo "    • Snyk:       https://app.snyk.io   → Settings       → Delete project"
echo ""
echo -e "$WARN Your local .env still contains credentials — delete or rotate them."
echo ""
