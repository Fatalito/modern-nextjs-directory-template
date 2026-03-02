#!/usr/bin/env bash
# Destroy the debug fork DB and restore .env to local SQLite.
#
# Usage: npm run db:debug:remote:stop

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/infra/lib/utils.sh
source "$SCRIPT_DIR/lib/utils.sh"

INFO="\033[34mINFO:\033[0m"
SUCCESS="\033[32mSUCCESS:\033[0m"
ERROR="\033[31mERROR:\033[0m"
WARN="\033[33mWARNING:\033[0m"

# ── Pre-flight ─────────────────────────────────────────────────────────────────
if ! command -v turso &>/dev/null; then
  echo -e "$ERROR turso CLI not found." >&2
  exit 1
fi

TURSO_API_TOKEN="$(get_env_var TURSO_API_TOKEN)"
if [ -z "$TURSO_API_TOKEN" ]; then
  echo -e "$ERROR TURSO_API_TOKEN is not set in .env" >&2
  exit 1
fi
export TURSO_API_TOKEN

DEBUG_DB_NAME="$(get_env_var DEBUG_DB_NAME)"
if [ -z "$DEBUG_DB_NAME" ]; then
  echo -e "$ERROR DEBUG_DB_NAME not found in .env — was db:debug:remote:start run?" >&2
  exit 1
fi

# ── Destroy fork ───────────────────────────────────────────────────────────────
echo -e "$INFO Destroying debug DB: $DEBUG_DB_NAME..."
if turso db show "$DEBUG_DB_NAME" &>/dev/null; then
  turso db destroy "$DEBUG_DB_NAME" --yes
  echo -e "$SUCCESS Destroyed $DEBUG_DB_NAME."
else
  echo -e "$WARN $DEBUG_DB_NAME not found in Turso — may already be destroyed."
fi

# ── Restore .env ───────────────────────────────────────────────────────────────
update_env_var "DATABASE_URL" "file:./sqlite.db"
remove_env_var "DATABASE_AUTH_TOKEN"
remove_env_var "DEBUG_DB_NAME"

echo -e "$SUCCESS .env restored to local SQLite (DATABASE_URL=file:./sqlite.db)."
