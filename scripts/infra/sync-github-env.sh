#!/usr/bin/env bash
# Push all vars from .env to GitHub Actions.
# *TOKEN vars → encrypted secrets (masked in logs)
# All others  → plaintext variables (readable in UI)
# Prerequisites: gh CLI installed + authenticated (gh auth login)

set -euo pipefail

INFO="\033[34mINFO:\033[0m"
SUCCESS="\033[32mSUCCESS:\033[0m"
ERROR="\033[31mERROR:\033[0m"

if ! command -v gh &>/dev/null; then
  echo -e "$ERROR gh CLI not found."
  echo "  Install: https://cli.github.com"
  exit 1
fi
if ! gh auth status &>/dev/null 2>&1; then
  echo -e "$ERROR Not authenticated to GitHub CLI."
  echo "  Run: gh auth login"
  exit 1
fi
if [ ! -f ".env" ]; then
  echo -e "$ERROR .env file not found."
  exit 1
fi

echo -e "$INFO Syncing .env → GitHub..."

while IFS= read -r line || [ -n "$line" ]; do
  [[ -z "$line" || "$line" == \#* ]] && continue
  name="${line%%=*}"
  value="${line#*=}"
  if [[ "$name" == *TOKEN* ]]; then
    echo -e "$INFO  → $name [secret]"
    gh secret set "$name" --body "$value"
  else
    echo -e "$INFO  → $name [variable]"
    gh variable set "$name" --body "$value"
  fi
done < .env

# ── Vercel project IDs (from .vercel/project.json) ────────────────────────────
if [ -f ".vercel/project.json" ]; then
  VERCEL_ORG_ID=$(node -e "process.stdout.write(require('./.vercel/project.json').orgId)")
  VERCEL_PROJECT_ID=$(node -e "process.stdout.write(require('./.vercel/project.json').projectId)")
  echo -e "$INFO  → VERCEL_ORG_ID [secret]"
  gh secret set "VERCEL_ORG_ID" --body "$VERCEL_ORG_ID"
  echo -e "$INFO  → VERCEL_PROJECT_ID [secret]"
  gh secret set "VERCEL_PROJECT_ID" --body "$VERCEL_PROJECT_ID"
fi

echo ""
echo -e "$SUCCESS All vars synced to GitHub (secrets for tokens, variables for the rest)."
