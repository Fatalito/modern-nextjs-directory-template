#!/usr/bin/env bash
# Decrypt a pre-migration database snapshot downloaded from GitHub Actions artifacts.
#
# Usage:
#   npm run db:decrypt-snapshot -- <path/to/db-snapshot-<sha>.sql.enc>
#
# Requires DB_SNAPSHOT_PASSPHRASE in your .env (set automatically by infra:setup).
# The decrypted SQL is written to restore.sql in the current directory.
#
# To replay the snapshot against a local or remote database:
#   turso db shell <your-db-name> < restore.sql

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/infra/lib/utils.sh"

if [ "${1:-}" = "" ]; then
  echo "Usage: npm run db:decrypt-snapshot -- <path/to/db-snapshot-<sha>.sql.enc>" >&2
  exit 1
fi

ENCRYPTED_FILE="$1"

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

DB_SNAPSHOT_PASSPHRASE="$PASSPHRASE" \
  openssl enc -d -aes-256-cbc -pbkdf2 \
    -in "$ENCRYPTED_FILE" \
    -out "$OUTPUT_FILE" \
    -pass env:DB_SNAPSHOT_PASSPHRASE

echo "Decrypted to $OUTPUT_FILE"
echo "To replay: turso db shell <your-db-name> < $OUTPUT_FILE"
