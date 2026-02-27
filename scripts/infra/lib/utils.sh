#!/usr/bin/env bash
# shellcheck shell=bash
# Shared utility functions sourced by all scripts/infra/*.sh scripts.

# Read a key's value from .env (returns empty string if missing or unset).
get_env_var() {
  grep -m1 -E "^${1}=" .env 2>/dev/null | cut -d'=' -f2- || true
}

# Upsert a key=value line in .env, preserving all other content.
update_env_var() {
  local key="$1" value="$2" file=".env"
  if grep -q "^${key}=" "$file" 2>/dev/null; then
    local tmp escaped_value; tmp=$(mktemp)
    escaped_value="${value//\\/\\\\}"
    escaped_value="${escaped_value//&/\\&}"
    sed "s|^${key}=.*|${key}=${escaped_value}|" "$file" > "$tmp" && mv "$tmp" "$file"
  else
    echo "${key}=${value}" >> "$file"
  fi
}
