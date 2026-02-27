# shellcheck shell=bash
# DB infrastructure definitions
# Sourced by all scripts/infra/*.sh scripts.
# Edit here to change the DB name or region across all scripts.
# No secrets — credentials come from the authenticated CLI session.

# Base name (no environment suffix). Override via TURSO_DB_NAME env var.
export DB_BASE_NAME="${TURSO_DB_NAME:-modern-directory}"

# Production DB: base name + -prod suffix.
# All other scripts (teardown, rotate-token) target this by default.
export DB_NAME="${DB_BASE_NAME}-prod"

# Primary location (run `turso db locations` for the full list)
export REGION="${TURSO_REGION:-aws-eu-west-1}"
