#!/usr/bin/env bash
# List pre-migration DB snapshots stored as GitHub Actions artifacts.
# Snapshots are created automatically before each production deployment (30-day retention).
#
# To restore a snapshot to production, trigger the Rollback workflow:
#   GitHub → Actions → "Rollback Production" → Run workflow → paste snapshot name below.
#
# Usage: npm run db:snapshot:list

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/infra/lib/utils.sh
source "$SCRIPT_DIR/../infra/lib/utils.sh"

INFO="\033[34mINFO:\033[0m"
ERROR="\033[31mERROR:\033[0m"
WARN="\033[33mWARNING:\033[0m"

# ── Pre-flight ─────────────────────────────────────────────────────────────────
for cmd in gh node; do
  if ! command -v "$cmd" &>/dev/null; then
    echo -e "$ERROR '$cmd' not found." >&2
    exit 1
  fi
done

if ! gh auth status &>/dev/null 2>&1; then
  echo -e "$ERROR Not authenticated to GitHub CLI. Run: gh auth login" >&2
  exit 1
fi

# ── List snapshots ─────────────────────────────────────────────────────────────
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")
if [ -z "$REPO" ]; then
  echo -e "$ERROR Could not determine repository name." >&2
  exit 1
fi

echo -e "$INFO Fetching snapshots from $REPO..."

ARTIFACTS=$(gh api "repos/$REPO/actions/artifacts?per_page=100" \
  --jq '[.artifacts[] | select(.name | startswith("db-snapshot-")) | {id, name, created_at, size_in_bytes}] | sort_by(.created_at) | reverse')

ARTIFACT_COUNT=$(echo "$ARTIFACTS" | node -e "
  const a = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  process.stdout.write(String(a.length));
")

if [ "$ARTIFACT_COUNT" -eq 0 ]; then
  echo -e "$WARN No snapshots found. Snapshots are created before each production deployment (retained 30 days)." >&2
  exit 0
fi

echo ""
echo "  Available snapshots (newest first):"
echo ""

echo "$ARTIFACTS" | node -e "
  const artifacts = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  artifacts.forEach((a, i) => {
    const sha = a.name.replace('db-snapshot-', '').slice(0, 7);
    const date = new Date(a.created_at).toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
    const kb = Math.round(a.size_in_bytes / 1024);
    console.log(\`  [\${String(i + 1).padStart(2)}] \${date}  sha:\${sha}  (\${kb} KB)\`);
    console.log(\`       \${a.name}\`);
  });
"

echo ""
echo "  To restore: GitHub → Actions → 'Rollback Production' → Run workflow → paste snapshot name above."
echo ""
