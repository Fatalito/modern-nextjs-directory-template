#!/usr/bin/env bash
# Decrypt a pre-migration database snapshot downloaded from GitHub Actions artifacts.
#
# Usage:
#   npm run db:decrypt-snapshot -- [--force] <path/to/db-snapshot-<sha>.sql.enc>
#
# Options:
#   --force   Overwrite restore.sql without prompting (also honoured via FORCE=1 env var)
#
# Requires DB_SNAPSHOT_PASSPHRASE in your .env (set automatically by infra:setup).
# The decrypted SQL is written to restore.sql in the current directory.
#
# To replay the snapshot against a local or remote database:
#   turso db shell <your-db-name> < restore.sql

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/infra/lib/utils.sh
source "$SCRIPT_DIR/infra/lib/utils.sh"

FORCE="${FORCE:-0}"

# Parse --force flag
POSITIONAL=()
for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
    *)       POSITIONAL+=("$arg") ;;
  esac
done

if [ "${#POSITIONAL[@]}" -eq 0 ]; then
  echo "Usage: npm run db:decrypt-snapshot -- [--force] <path/to/db-snapshot-<sha>.sql.enc>" >&2
  exit 1
fi

ENCRYPTED_FILE="${POSITIONAL[0]}"

if [ ! -f "$ENCRYPTED_FILE" ]; then
  echo "Error: file not found: $ENCRYPTED_FILE" >&2
  exit 1
fi

PASSPHRASE="$(get_env_var DB_SNAPSHOT_PASSPHRASE)"
if [ -z "$PASSPHRASE" ]; then
  echo "Error: DB_SNAPSHOT_PASSPHRASE is not set in .env" >&2
  echo "  Run: npm run infra:setup  (or copy from the GitHub Secret)" >&2
  exit 1
fi

OUTPUT_FILE="restore.sql"

if [ -f "$OUTPUT_FILE" ] && [ "$FORCE" != "1" ]; then
  if [ -t 0 ]; then
    read -r -p "$OUTPUT_FILE already exists. Overwrite? [y/N] " REPLY
    case "$REPLY" in
      [yY][eE][sS]|[yY]) ;;
      *) echo "Aborted." >&2; exit 1 ;;
    esac
  else
    echo "Error: $OUTPUT_FILE already exists. Re-run with --force to overwrite." >&2
    exit 1
  fi
fi

DB_SNAPSHOT_PASSPHRASE="$PASSPHRASE" \
  openssl enc -d -aes-256-cbc -pbkdf2 \
    -in "$ENCRYPTED_FILE" \
    -out "$OUTPUT_FILE" \
    -pass env:DB_SNAPSHOT_PASSPHRASE

echo "Decrypted to $OUTPUT_FILE"
echo "To replay: turso db shell <your-db-name> < $OUTPUT_FILE"
