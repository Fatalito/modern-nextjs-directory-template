#!/usr/bin/env bash
# Destroy a Turso database. IRREVERSIBLE — all data will be lost.
#
# Usage:
#   bash turso-teardown.sh               # destroy modern-directory-prod (interactive)
#   bash turso-teardown.sh --suffix pr-1 # destroy modern-directory-pr-1 (interactive)
#   bash turso-teardown.sh --suffix pr-1 --force  # skip confirmation (CI use)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/../../infra/turso.conf.sh"

INFO="\033[34mINFO:\033[0m"
ERROR="\033[31mERROR:\033[0m"
SUCCESS="\033[32mSUCCESS:\033[0m"
WARN="\033[33mWARNING:\033[0m"

# ── Arguments ─────────────────────────────────────────────────────────────────
SUFFIX=""
FORCE=false
while [[ $# -gt 0 ]]; do
  case "$1" in
    --suffix) SUFFIX="$2"; shift 2 ;;
    --force)  FORCE=true; shift ;;
    *) echo -e "$ERROR Unknown argument: $1"; exit 1 ;;
  esac
done

TARGET_DB="${SUFFIX:+${DB_BASE_NAME}-${SUFFIX}}"
TARGET_DB="${TARGET_DB:-$DB_NAME}"

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
if [ "$FORCE" = false ]; then
  echo -e "$WARN This will permanently destroy '$TARGET_DB' and all its data."
  echo ""
  printf "Type the database name to confirm: "
  read -r CONFIRM
  if [[ "$CONFIRM" != "$TARGET_DB" ]]; then
    echo -e "$ERROR Confirmation did not match. Aborting."
    exit 1
  fi
fi

# ── Destroy ───────────────────────────────────────────────────────────────────
echo -e "$INFO Destroying database '$TARGET_DB'..."
turso db destroy "$TARGET_DB" --yes

echo ""
echo -e "$SUCCESS Database '$TARGET_DB' destroyed."
if [ -z "$SUFFIX" ]; then
  echo -e "$INFO Remember to remove DATABASE_URL and DATABASE_AUTH_TOKEN from Vercel and GitHub Secrets."
fi
