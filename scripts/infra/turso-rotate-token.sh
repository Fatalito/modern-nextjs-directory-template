#!/usr/bin/env bash
# Rotate the Turso auth token for the production database.
# Turso tokens are additive — the old token remains valid until explicitly revoked.
# This script creates a new token, updates .env, and re-syncs DATABASE_AUTH_TOKEN
# to GitHub Secrets so the next deploy pushes it to Vercel automatically.
# After confirming the new token works, revoke the old one via the Turso dashboard.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../infra/turso.conf.sh
source "$SCRIPT_DIR/../../infra/turso.conf.sh"

INFO="\033[34mINFO:\033[0m"
SUCCESS="\033[32mSUCCESS:\033[0m"
ERROR="\033[31mERROR:\033[0m"
WARN="\033[33mWARNING:\033[0m"

# ── Prerequisites ─────────────────────────────────────────────────────────────
if ! command -v turso &>/dev/null; then
  echo -e "$ERROR turso CLI not found."
  echo "  Install: curl -sSfL https://get.tur.so/install.sh | bash"
  exit 1
fi

if turso auth token 2>&1 | grep -qi "not logged in"; then
  echo -e "$ERROR Not logged in. Run: turso auth login"
  exit 1
fi

# ── Create new token ──────────────────────────────────────────────────────────
echo -e "$INFO Creating new auth token for '$DB_NAME'..."
NEW_TOKEN="$(turso db tokens create "$DB_NAME" --expiration none)"
echo -e "$SUCCESS New token created."

# ── Update .env ───────────────────────────────────────────────────────────────
if [ -f ".env" ]; then
  if grep -q "^DATABASE_AUTH_TOKEN=" ".env" 2>/dev/null; then
    tmp=$(mktemp)
    sed "s|^DATABASE_AUTH_TOKEN=.*|DATABASE_AUTH_TOKEN=${NEW_TOKEN}|" ".env" > "$tmp" && mv "$tmp" ".env"
  else
    echo "DATABASE_AUTH_TOKEN=${NEW_TOKEN}" >> ".env"
  fi
  echo -e "$INFO .env updated."
fi

# ── Push to GitHub Secrets ────────────────────────────────────────────────────
if command -v gh &>/dev/null && gh auth status &>/dev/null 2>&1; then
  echo -e "$INFO Pushing DATABASE_AUTH_TOKEN to GitHub Secrets..."
  gh secret set "DATABASE_AUTH_TOKEN" --body "$NEW_TOKEN"
  echo -e "$SUCCESS GitHub secret updated. The next deploy will push it to Vercel automatically."
else
  echo -e "$WARN gh CLI not found or not authenticated — update GitHub Secrets manually:"
  echo ""
  echo "  DATABASE_AUTH_TOKEN=$NEW_TOKEN"
  echo ""
fi

# ── Output ────────────────────────────────────────────────────────────────────
echo ""
echo -e "$WARN Store the token securely — it will not be shown again."
echo ""
echo "After confirming the new token works, revoke the old one at:"
echo "  https://app.turso.tech/databases/$DB_NAME/tokens"
echo ""
