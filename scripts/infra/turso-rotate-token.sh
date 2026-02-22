#!/usr/bin/env bash
# Create a new Turso auth token and print it for updating Vercel + GitHub Secrets.
# Turso tokens are additive — the old token remains valid until explicitly revoked.
# After updating secrets, revoke the old token via the Turso dashboard.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../infra/turso.conf.sh
source "$SCRIPT_DIR/../../infra/turso.conf.sh"

INFO="\033[34mINFO:\033[0m"
SUCCESS="\033[32mSUCCESS:\033[0m"
ERROR="\033[31mERROR:\033[0m"

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

# ── Output ────────────────────────────────────────────────────────────────────
echo ""
echo -e "$SUCCESS New token created."
echo ""
echo "Update the following in Vercel (Environment Variables) and GitHub (Secrets):"
echo ""
echo "  DATABASE_AUTH_TOKEN=$NEW_TOKEN"
echo ""
echo "After updating secrets, revoke the old token at:"
echo "  https://turso.tech/app/databases/$DB_NAME/tokens"
echo ""
echo -e "\033[33mWARNING:\033[0m Store the token securely — it will not be shown again."
