#!/usr/bin/env bash
# Destroy the Turso database. IRREVERSIBLE — all data will be lost.
# Requires typing the database name to confirm.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../infra/turso.conf.sh
source "$SCRIPT_DIR/../../infra/turso.conf.sh"

INFO="\033[34mINFO:\033[0m"
ERROR="\033[31mERROR:\033[0m"
SUCCESS="\033[32mSUCCESS:\033[0m"
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

# ── Confirmation ──────────────────────────────────────────────────────────────
echo -e "$WARN This will permanently destroy '$DB_NAME' and all its data."
echo ""
printf "Type the database name to confirm: "
read -r CONFIRM

if [[ "$CONFIRM" != "$DB_NAME" ]]; then
  echo -e "$ERROR Confirmation did not match. Aborting."
  exit 1
fi

# ── Destroy ───────────────────────────────────────────────────────────────────
echo -e "$INFO Destroying database '$DB_NAME'..."
turso db destroy "$DB_NAME" --yes

echo ""
echo -e "$SUCCESS Database '$DB_NAME' destroyed."
echo -e "$INFO Remember to remove DATABASE_URL and DATABASE_AUTH_TOKEN from Vercel and GitHub Secrets."
