#!/usr/bin/env bash
# Dump the production Turso DB, scrub PII, and load into local SQLite.
# Uses @libsql/client (already a project dependency) — no sqlite3 CLI needed.
#
# What gets sanitized:
#   users: email → user-<id>@example.com, name → User <id>, password_hash → placeholder
#
# Usage: npm run db:debug:start

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

LOCAL_DB="sqlite.db"

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

# ── Dump prod ──────────────────────────────────────────────────────────────────
DUMP_FILE="$(mktemp /tmp/prod-dump.XXXXXX.sql)"
trap 'rm -f "$DUMP_FILE"' EXIT

echo -e "$INFO Dumping $DB_NAME..."
turso db shell "$DB_NAME" ".dump" > "$DUMP_FILE"

if [ ! -s "$DUMP_FILE" ]; then
  echo -e "$ERROR Dump is empty — check that $DB_NAME exists and is reachable." >&2
  exit 1
fi

# ── Backup existing local DB ───────────────────────────────────────────────────
if [ -f "$LOCAL_DB" ]; then
  echo -e "$WARN Overwriting $LOCAL_DB — backup saved to ${LOCAL_DB}.bak"
  cp "$LOCAL_DB" "${LOCAL_DB}.bak"
fi
rm -f "$LOCAL_DB"

# ── Load dump + sanitize via @libsql/client ────────────────────────────────────
echo -e "$INFO Loading dump and sanitizing PII..."

DUMP_FILE="$DUMP_FILE" node --input-type=module << 'NODESCRIPT'
import { createClient } from '@libsql/client';
import { readFileSync } from 'node:fs';

const db = createClient({ url: 'file:./sqlite.db' });

await db.executeMultiple(readFileSync(process.env.DUMP_FILE, 'utf8'));

await db.executeMultiple(`
  UPDATE users SET
    email         = 'user-' || substr(id, 1, 8) || '@example.com',
    name          = 'User ' || substr(id, 1, 8),
    password_hash = 'debug-hash-not-valid';
`);

const { rows: uRows } = await db.execute('SELECT COUNT(*) AS count FROM users');
const { rows: bRows } = await db.execute('SELECT COUNT(*) AS count FROM businesses');
console.log(`users=${uRows[0].count} businesses=${bRows[0].count}`);
NODESCRIPT

echo -e "$SUCCESS Local SQLite seeded and sanitized."
echo "  DATABASE_URL=file:./sqlite.db — no .env change needed."
echo ""
echo -e "$WARN Do not commit $LOCAL_DB — it is gitignored."
