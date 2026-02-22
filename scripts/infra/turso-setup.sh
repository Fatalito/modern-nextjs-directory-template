#!/usr/bin/env bash
# Provision the Turso database and print credentials for Vercel + GitHub Secrets.
# Run once per environment. Safe to re-run — DB creation is idempotent.
#
# Prerequisites:
#   turso CLI installed  →  curl -sSfL https://get.tur.so/install.sh | bash
#   turso auth login

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../infra/turso.conf.sh
source "$SCRIPT_DIR/../../infra/turso.conf.sh"

INFO="\033[34mINFO:\033[0m"
ERROR="\033[31mERROR:\033[0m"
SUCCESS="\033[32mSUCCESS:\033[0m"

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

# ── Create database ───────────────────────────────────────────────────────────
if turso db show "$DB_NAME" &>/dev/null; then
  echo -e "$INFO Database '$DB_NAME' already exists — skipping creation."
else
  echo -e "$INFO Creating database '$DB_NAME' in $REGION..."
  turso db create "$DB_NAME" --location "$REGION"
  echo -e "$SUCCESS Database created."
fi

# ── Retrieve URL ──────────────────────────────────────────────────────────────
echo -e "$INFO Retrieving database URL..."
DB_URL="$(turso db show "$DB_NAME" --url)"

# ── Create auth token ─────────────────────────────────────────────────────────
echo -e "$INFO Creating auth token..."
DB_TOKEN="$(turso db tokens create "$DB_NAME" --expiration none)"

# ── Output ────────────────────────────────────────────────────────────────────
echo ""
echo -e "$SUCCESS Database provisioned: $DB_NAME"
echo ""
echo "1. Add to .env:"
echo ""
echo "   DATABASE_URL=$DB_URL"
echo "   DATABASE_AUTH_TOKEN=$DB_TOKEN"
echo ""
echo "2. Push the schema and seed:"
echo ""
echo "   npm run db:push"
echo "   npm run db:seed"
echo ""
echo "3. Add the same values to Vercel (Environment Variables) and GitHub (Secrets)."
echo ""
echo -e "\033[33mWARNING:\033[0m Store the token securely — it will not be shown again."
