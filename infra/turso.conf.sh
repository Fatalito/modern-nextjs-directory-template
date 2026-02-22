# DB infrastructure definitions
# Sourced by all scripts/infra/*.sh scripts.
# Edit here to change the DB name or region across all scripts.
# No secrets — credentials come from the authenticated CLI session.

# Override via env var to target a different environment:
#   TURSO_DB_NAME=modern-directory-staging npm run infra:setup
export DB_NAME="${TURSO_DB_NAME:-modern-directory}"

# Primary location (run `turso db locations` for the full list)
export REGION="${TURSO_REGION:-aws-eu-west-1}"
