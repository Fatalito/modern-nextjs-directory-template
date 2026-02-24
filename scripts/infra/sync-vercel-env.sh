#!/usr/bin/env bash
# Push vars from .env to selected Vercel environments.
# Prerequisites: vercel CLI installed + authenticated, .vercel/ folder present (vercel link)

set -euo pipefail

INFO="\033[34mINFO:\033[0m"
SUCCESS="\033[32mSUCCESS:\033[0m"
ERROR="\033[31mERROR:\033[0m"
WARN="\033[33mWARNING:\033[0m"

if ! command -v vercel &>/dev/null; then
  echo -e "$ERROR vercel CLI not found."
  echo "  Install: npm i -g vercel"
  exit 1
fi
if [ ! -d ".vercel" ]; then
  echo -e "$ERROR No .vercel/ folder found — project not linked."
  echo "  Run: vercel link"
  exit 1
fi
if [ ! -f ".env" ]; then
  echo -e "$ERROR .env file not found."
  exit 1
fi

# ── Environment selection ──────────────────────────────────────────────────────
echo ""
echo "Select environments to sync:"
echo ""

selected_envs=()

read -r -p "  development [Y/n]: " dev_choice
[[ "${dev_choice:-Y}" =~ ^[Yy]$ ]] && selected_envs+=("development")

read -r -p "  preview     [Y/n]: " prev_choice
[[ "${prev_choice:-Y}" =~ ^[Yy]$ ]] && selected_envs+=("preview")

read -r -p "  production  [y/N]: " prod_choice
if [[ "${prod_choice:-N}" =~ ^[Yy]$ ]]; then
  echo ""
  echo -e "$WARN This will overwrite production environment variables."
  read -r -p "  Type \"production\" to confirm: " confirm
  if [ "$confirm" = "production" ]; then
    selected_envs+=("production")
  else
    echo -e "$INFO Skipping production."
  fi
fi

if [ ${#selected_envs[@]} -eq 0 ]; then
  echo ""
  echo -e "$INFO No environments selected. Exiting."
  exit 0
fi

echo ""
echo -e "$INFO Syncing to: ${selected_envs[*]}"
echo ""

# ── Sync vars ─────────────────────────────────────────────────────────────────
while IFS= read -r line || [ -n "$line" ]; do
  [[ -z "$line" || "$line" == \#* ]] && continue
  name="${line%%=*}"
  value="${line#*=}"
  # Skip CI-only Vercel deployment vars
  [[ "$name" == VERCEL_* ]] && continue
  for env_name in "${selected_envs[@]}"; do
    echo -e "$INFO  → $name [$env_name]"
    flags="--force"
    [[ "$env_name" = "production" && ( "$name" == *SECRET* || "$name" == *TOKEN* ) ]] && flags="$flags --sensitive"
    printf '%s' "$value" | vercel env add "$name" "$env_name" $flags >/dev/null 2>&1 \
      || echo -e "$WARN     Failed to set $name in $env_name (skipping)"
  done
done < .env

echo ""
echo -e "$SUCCESS Vars synced to: ${selected_envs[*]}."
