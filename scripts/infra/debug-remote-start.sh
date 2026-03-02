#!/usr/bin/env bash
# ⚠️  EXCEPTIONAL USE ONLY — forks production and exposes real PII.
# For everyday debugging use the sanitized local copy instead:
#   npm run db:debug:start
#
# Fork the production Turso DB and configure .env for local debugging.
# The fork is named: {dbBaseName}-{branchName}-debug
#
# Usage: npm run db:debug:remote:start
# Stop:  npm run db:debug:remote:stop

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/../../infra/turso.conf.sh"
# shellcheck source=scripts/infra/lib/utils.sh
source "$SCRIPT_DIR/lib/utils.sh"

INFO="\033[34mINFO:\033[0m"
SUCCESS="\033[32mSUCCESS:\033[0m"
ERROR="\033[31mERROR:\033[0m"
WARN="\033[33mWARNING:\033[0m"

# ── Pre-flight ─────────────────────────────────────────────────────────────────
if ! command -v turso &>/dev/null; then
  echo -e "$ERROR turso CLI not found." >&2
  echo "  Install: curl -sSfL https://get.tur.so/install.sh | bash" >&2
  exit 1
fi

TURSO_API_TOKEN="$(get_env_var TURSO_API_TOKEN)"
if [ -z "$TURSO_API_TOKEN" ]; then
  echo -e "$ERROR TURSO_API_TOKEN is not set in .env" >&2
  exit 1
fi
export TURSO_API_TOKEN

# Warn if already in a debug session
EXISTING_DEBUG="$(get_env_var DEBUG_DB_NAME)"
if [ -n "$EXISTING_DEBUG" ]; then
  echo -e "$WARN Already in a debug session: $EXISTING_DEBUG" >&2
  echo "  Run: npm run db:debug:remote:stop  before starting a new one." >&2
  exit 1
fi

# ── PII consent ────────────────────────────────────────────────────────────────
# This fork contains real production data including:
#   • users.email        — real user email addresses
#   • users.name         — real user names
#   • users.contacts[]   — real phone / social handles
#   • users.password_hash — bcrypt hashes (still sensitive)
#
# Use db:debug:start for a sanitized copy with no real PII.
echo ""
echo -e "$WARN This command forks PRODUCTION and gives your local machine access to real PII."
echo "       Real emails, names, contacts, and password hashes will be accessible."
echo "       Consider: npm run db:debug:start (sanitized, no PII)"
echo ""
printf "Type 'yes, I understand' to continue: "
read -r CONSENT
if [ "$CONSENT" != "yes, I understand" ]; then
  echo -e "$INFO Aborted." >&2
  exit 0
fi
echo ""

# ── Derive fork name ───────────────────────────────────────────────────────────
# Sanitize branch → lowercase alphanumeric + hyphens, max 20 chars
BRANCH=$(git rev-parse --abbrev-ref HEAD \
  | tr '[:upper:]' '[:lower:]' \
  | sed 's/[^a-z0-9]/-/g' \
  | sed 's/--*/-/g' \
  | sed 's/^-//;s/-$//' \
  | cut -c1-20)
SUFFIX="${BRANCH}-debug"
FORK_DB="${DB_BASE_NAME}-${SUFFIX}"

# ── GitHub approval gate ───────────────────────────────────────────────────────
# A Security Lead must approve in GitHub before the fork is created.
# This produces an immutable audit trail in GitHub Actions UI.
# Configure reviewers: Settings → Environments → pii-access → Required reviewers
if command -v gh &>/dev/null && gh auth status &>/dev/null 2>&1; then
  echo ""
  printf "Reason for this PII access (logged to GitHub): "
  read -r REASON
  if [ -z "$REASON" ]; then
    echo -e "$ERROR A reason is required for the audit trail." >&2
    exit 1
  fi

  GH_USER=$(gh api user --jq .login 2>/dev/null || echo "unknown")
  REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")

  if [ -n "$REPO" ]; then
    echo ""
    echo -e "$INFO Requesting approval from Security Lead..."
    gh workflow run debug-remote-authorise.yml \
      --field branch="$BRANCH" \
      --field requester="$GH_USER" \
      --field reason="$REASON"

    sleep 5  # Give GitHub time to register the run

    RUN_ID=$(gh run list \
      --workflow=debug-remote-authorise.yml \
      --limit=1 \
      --json databaseId \
      --jq '.[0].databaseId')

    echo -e "$INFO Waiting for approval (a Security Lead must approve in GitHub)..."
    echo "  Track: https://github.com/$REPO/actions/runs/$RUN_ID"

    if ! gh run watch "$RUN_ID" --exit-status; then
      echo -e "$ERROR Access denied or approval timed out — aborting fork." >&2
      exit 1
    fi
    echo -e "$SUCCESS Access approved. Proceeding with fork..."
  else
    echo -e "$WARN Could not determine repo — skipping GitHub approval gate." >&2
  fi
else
  echo -e "$WARN gh CLI not found or not authenticated — skipping GitHub approval gate." >&2
  echo "  Install gh CLI to enable the audit trail: https://cli.github.com" >&2
fi
echo ""

echo -e "$INFO Forking $DB_NAME → $FORK_DB..."
bash "$SCRIPT_DIR/turso-setup.sh" --suffix "$SUFFIX"

# Store fork name so debug:stop knows what to destroy
update_env_var "DEBUG_DB_NAME" "$FORK_DB"

echo ""
echo -e "$SUCCESS Debug fork ready: $FORK_DB"
echo "  .env updated: DATABASE_URL, DATABASE_AUTH_TOKEN, DEBUG_DB_NAME"
echo "  To stop: npm run db:debug:remote:stop"
