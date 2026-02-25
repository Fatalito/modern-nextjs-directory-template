#!/usr/bin/env bash
# Provision the Turso database and write credentials to .env.
# Run once per environment. Safe to re-run — DB creation is idempotent.
#
# Usage:
#   bash turso-setup.sh               # create / ensure modern-directory-prod
#   bash turso-setup.sh --suffix pr-1 # fork prod → modern-directory-pr-1 (CI)
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

# ── Arguments ─────────────────────────────────────────────────────────────────
SUFFIX=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --suffix) SUFFIX="$2"; shift 2 ;;
    *) echo -e "$ERROR Unknown argument: $1"; exit 1 ;;
  esac
done

# Derive target DB and mode
if [ -n "$SUFFIX" ]; then
  TARGET_DB="${DB_BASE_NAME}-${SUFFIX}"
  SOURCE_DB="$DB_NAME"  # fork from prod
  TOKEN_EXPIRY="7d"     # short-lived for CI / ephemeral environments
else
  TARGET_DB="$DB_NAME"  # prod
  SOURCE_DB=""
  TOKEN_EXPIRY="none"   # non-expiring for production
fi

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
if turso db show "$TARGET_DB" &>/dev/null; then
  echo -e "$INFO Database '$TARGET_DB' already exists — skipping creation."
elif [ -n "$SOURCE_DB" ]; then
  echo -e "$INFO Forking '$SOURCE_DB' → '$TARGET_DB' in $REGION..."
  turso db create "$TARGET_DB" --from-db "$SOURCE_DB" --location "$REGION"
  echo -e "$SUCCESS Database forked."
else
  echo -e "$INFO Creating database '$TARGET_DB' in $REGION..."
  turso db create "$TARGET_DB" --location "$REGION"
  echo -e "$SUCCESS Database created."
fi

# ── Retrieve URL ──────────────────────────────────────────────────────────────
echo -e "$INFO Retrieving database URL..."
DB_URL="$(turso db show "$TARGET_DB" --url)"

# ── Create auth token ─────────────────────────────────────────────────────────
echo -e "$INFO Creating auth token (expiry: $TOKEN_EXPIRY)..."
DB_TOKEN="$(turso db tokens create "$TARGET_DB" --expiration "$TOKEN_EXPIRY")"

# ── Write to .env ─────────────────────────────────────────────────────────────
update_env_var() {
  local key="$1" value="$2" file=".env"
  if grep -q "^${key}=" "$file" 2>/dev/null; then
    local tmp; tmp=$(mktemp)
    sed "s|^${key}=.*|${key}=${value}|" "$file" > "$tmp" && mv "$tmp" "$file"
  else
    echo "${key}=${value}" >> "$file"
  fi
}

if [ -n "${GITHUB_ENV:-}" ]; then
  # Running in GitHub Actions — write to GITHUB_ENV for downstream steps
  echo "DATABASE_URL=$DB_URL" >> "$GITHUB_ENV"
  echo "DATABASE_AUTH_TOKEN=$DB_TOKEN" >> "$GITHUB_ENV"
  echo -e "$SUCCESS Credentials written to \$GITHUB_ENV."
elif [ -f ".env" ]; then
  update_env_var "DATABASE_URL"        "$DB_URL"
  update_env_var "DATABASE_AUTH_TOKEN" "$DB_TOKEN"
  echo -e "$SUCCESS .env updated with new credentials."
else
  echo -e "$INFO No .env file found — copy the values manually:"
  echo ""
  echo "   DATABASE_URL=$DB_URL"
  echo "   DATABASE_AUTH_TOKEN=$DB_TOKEN"
fi

# ── Output ────────────────────────────────────────────────────────────────────
echo ""
echo -e "$SUCCESS Database provisioned: $TARGET_DB"
echo ""
echo "Next steps:"
echo ""
echo "  npm run db:push"
echo "  npm run db:seed"
echo "  npm run infra:sync:github   # push DATABASE_URL + DATABASE_AUTH_TOKEN to GitHub"
echo ""
echo -e "\033[33mWARNING:\033[0m The token has been written to .env — do not commit it."
