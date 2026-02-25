#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# First-time production setup — "Project-in-a-Box"
#
# Provisions the Turso production database, links the project to Vercel,
# disables Vercel's GitHub auto-deploy (deploy.yml handles deployments),
# syncs all CI secrets to GitHub Actions, and opens a feature/initial-setup
# PR. CI must pass and you must merge the PR to trigger the first production
# deployment — this is intentional to enforce best practices from day one.
#
# Safe to re-run — every step is idempotent.
#
# Prerequisites (install before running):
#   Turso CLI  →  curl -sSfL https://get.tur.so/install.sh | bash
#   Vercel CLI →  npm i -g vercel
#   GitHub CLI →  brew install gh   (or https://cli.github.com)
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

INFO="\033[34mINFO:\033[0m"
SUCCESS="\033[32mSUCCESS:\033[0m"
ERROR="\033[31mERROR:\033[0m"
WARN="\033[33mWARNING:\033[0m"
STEP="\033[1;36m──────────────────────────────────────────\033[0m"

# ── 0. Prerequisites ──────────────────────────────────────────────────────────
echo -e "$STEP"
echo "  Checking prerequisites..."
echo -e "$STEP"

missing=0
for cmd in turso vercel gh git node openssl; do
  if ! command -v "$cmd" &>/dev/null; then
    echo -e "$ERROR '$cmd' not found."
    missing=1
  fi
done

if [ "$missing" -eq 1 ]; then
  echo ""
  echo "Install missing tools:"
  echo "  Turso  → curl -sSfL https://get.tur.so/install.sh | bash"
  echo "  Vercel → npm i -g vercel"
  echo "  GitHub → https://cli.github.com"
  exit 1
fi

if [ ! -f ".env" ]; then
  echo -e "$ERROR .env file not found. Run: cp .env.example .env"
  exit 1
fi

echo -e "$SUCCESS All prerequisites found."

# ── Helpers ───────────────────────────────────────────────────────────────────
get_env_var() {
  grep -E "^${1}=" .env 2>/dev/null | head -1 | cut -d'=' -f2-
}

update_env_var() {
  local key="$1" value="$2" file=".env"
  if grep -q "^${key}=" "$file" 2>/dev/null; then
    local tmp; tmp=$(mktemp)
    sed "s|^${key}=.*|${key}=${value}|" "$file" > "$tmp" && mv "$tmp" "$file"
  else
    echo "${key}=${value}" >> "$file"
  fi
}

# open_browser <url> — cross-platform browser launcher
open_browser() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$1"
  elif command -v xdg-open &>/dev/null; then
    xdg-open "$1" 2>/dev/null || true
  fi
}

# collect_token <VAR_NAME> <url> <hint>
# Skips if already set in .env OR already present in GitHub Secrets.
# Otherwise opens browser, prompts for hidden input, saves to .env and syncs.
collect_token() {
  local name="$1" url="$2" hint="$3"
  local current; current="$(get_env_var "$name")"
  if [ -n "$current" ]; then
    echo -e "$INFO $name already set — skipping."
    return 0
  fi
  # Fallback: check GitHub Secrets (e.g. after teardown/recreate or lost .env)
  if [ -n "${REPO:-}" ] && gh secret list --repo "$REPO" --json name -q '.[].name' 2>/dev/null | grep -qx "$name"; then
    echo -e "$INFO $name already in GitHub Secrets — skipping."
    return 0
  fi
  echo ""
  echo -e "$INFO $hint"
  echo "  Opening $url ..."
  open_browser "$url"
  echo ""
  read -r -s -p "  Paste your $name (hidden — press Enter to skip): " token_value
  echo ""
  if [ -z "$token_value" ]; then
    echo -e "$WARN $name skipped — add it later and re-run: npm run infra:sync:github"
    return 0
  fi
  update_env_var "$name" "$token_value"
  gh secret set "$name" --body "$token_value"
  echo -e "$SUCCESS $name saved to .env and synced to GitHub Secrets."
}

# ── 1. Authenticate ───────────────────────────────────────────────────────────
echo ""
echo -e "$STEP"
echo "  Step 1 of 7 — Authenticate"
echo -e "$STEP"

if turso auth token 2>&1 | grep -qi "not logged in"; then
  echo -e "$INFO Logging in to Turso..."
  turso auth login
fi
echo -e "$SUCCESS Turso: authenticated."

if ! vercel whoami &>/dev/null 2>&1; then
  echo -e "$INFO Logging in to Vercel..."
  vercel login
fi
echo -e "$SUCCESS Vercel: authenticated ($(vercel whoami 2>/dev/null || echo 'ok'))."

if ! gh auth status &>/dev/null 2>&1; then
  echo -e "$INFO Logging in to GitHub CLI..."
  gh auth login
fi
echo -e "$SUCCESS GitHub: authenticated."

# Determine repo name early — used by collect_token for GitHub Secrets checks
DEFAULT_BRANCH=$(gh repo view --json defaultBranchRef -q .defaultBranchRef.name 2>/dev/null || echo "main")
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")

# Collect all required API tokens interactively (skipped if already in .env or GitHub Secrets)
collect_token "VERCEL_TOKEN" \
  "https://vercel.com/account/settings/tokens" \
  "Vercel deploy token — required for CI deployments and preview environments. Generate at vercel.com → Account Settings → Tokens."

collect_token "TURSO_API_TOKEN" \
  "https://app.turso.tech/settings/api-tokens" \
  "Turso API token — required by CI to fork the database per PR. Generate at app.turso.tech → Settings → API Tokens."

# ── 2. Provision Turso production database ────────────────────────────────────
echo ""
echo -e "$STEP"
echo "  Step 2 of 7 — Provision Turso database"
echo -e "$STEP"

# shellcheck source=../../infra/turso.conf.sh
source "$SCRIPT_DIR/../../infra/turso.conf.sh"

echo ""
echo "  Free-plan regions: aws-eu-west-1 (default), aws-us-east-1, aws-us-west-2, aws-ap-northeast-1"
echo "  (run 'turso db locations' for the full list)"
read -r -p "  Database name [$DB_BASE_NAME]: " DB_NAME_INPUT
read -r -p "  Region        [$REGION]: " REGION_INPUT

if [ -n "$DB_NAME_INPUT" ] && [ "$DB_NAME_INPUT" != "$DB_BASE_NAME" ]; then
  update_env_var "TURSO_DB_NAME" "$DB_NAME_INPUT"
  export TURSO_DB_NAME="$DB_NAME_INPUT"
  echo -e "$INFO Using database name: $DB_NAME_INPUT"
fi

if [ -n "$REGION_INPUT" ] && [ "$REGION_INPUT" != "$REGION" ]; then
  update_env_var "TURSO_REGION" "$REGION_INPUT"
  export TURSO_REGION="$REGION_INPUT"
  echo -e "$INFO Using region: $REGION_INPUT"
fi

bash "$SCRIPT_DIR/turso-setup.sh"

echo ""
echo -e "$INFO Applying schema and seeding the production database..."
npm run db:push
npm run db:seed
echo -e "$SUCCESS Production database initialized."

# ── 3. Link Vercel project ────────────────────────────────────────────────────
echo ""
echo -e "$STEP"
echo "  Step 3 of 7 — Link Vercel project"
echo -e "$STEP"

if [ -f ".vercel/project.json" ]; then
  VERCEL_PROJECT_ID=$(node -e "process.stdout.write(require('./.vercel/project.json').projectId)")
  echo -e "$INFO Project already linked (id: $VERCEL_PROJECT_ID) — skipping."
else
  echo ""
  read -r -p "  Vercel project name [$DB_BASE_NAME]: " PROJECT_NAME
  PROJECT_NAME="${PROJECT_NAME:-$DB_BASE_NAME}"

  vercel link --yes --project "$PROJECT_NAME"
  VERCEL_PROJECT_ID=$(node -e "process.stdout.write(require('./.vercel/project.json').projectId)")
fi

echo -e "$SUCCESS Vercel project linked."

# ── 4. Disable Vercel GitHub auto-deploy ─────────────────────────────────────
echo ""
echo -e "$STEP"
echo "  Step 4 of 7 — Disable Vercel auto-deploy"
echo -e "$STEP"
# vercel.json already carries "ignoreCommand": "exit 1" as a code-level safety
# net. We also set it via the API for immediate effect (before the code is
# deployed for the first time).

VERCEL_TOKEN="$(get_env_var VERCEL_TOKEN)"

if [ -n "$VERCEL_TOKEN" ] && [ -n "${VERCEL_PROJECT_ID:-}" ]; then
  RESULT=$(curl -s -o /dev/null -w "%{http_code}" \
    -X PATCH "https://api.vercel.com/v9/projects/$VERCEL_PROJECT_ID" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"commandForIgnoringBuildStep": "exit 1"}')
  if [ "$RESULT" = "200" ]; then
    echo -e "$SUCCESS Vercel auto-deploy disabled via API."
  else
    echo -e "$WARN API returned HTTP $RESULT — vercel.json ignoreCommand still active."
  fi
else
  echo -e "$WARN VERCEL_TOKEN not set — skipping API call. vercel.json ignoreCommand still active."
fi

# ── 5. Deployment protection bypass secret ────────────────────────────────────
echo ""
echo -e "$STEP"
echo "  Step 5 of 7 — Deployment protection bypass"
echo -e "$STEP"

BYPASS="$(get_env_var VERCEL_AUTOMATION_BYPASS_SECRET)"

if [ -z "$BYPASS" ]; then
  BYPASS=$(openssl rand -hex 32)
  update_env_var "VERCEL_AUTOMATION_BYPASS_SECRET" "$BYPASS"
  echo -e "$INFO Generated VERCEL_AUTOMATION_BYPASS_SECRET and saved to .env."
else
  echo -e "$INFO VERCEL_AUTOMATION_BYPASS_SECRET already set — reusing."
fi

if [ -n "$VERCEL_TOKEN" ] && [ -n "${VERCEL_PROJECT_ID:-}" ]; then
  RESULT=$(curl -s -o /dev/null -w "%{http_code}" \
    -X PATCH "https://api.vercel.com/v9/projects/$VERCEL_PROJECT_ID" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"protection\": {\"deploymentType\": \"preview_deployments_only\", \"bypassSecret\": \"$BYPASS\"}}")
  if [ "$RESULT" = "200" ]; then
    echo -e "$SUCCESS Deployment protection enabled with bypass secret."
  else
    echo -e "$WARN Could not configure protection via API (HTTP $RESULT)."
    echo "  Enable manually: Vercel Dashboard → Project → Settings → Deployment Protection"
    echo "  Use the value of VERCEL_AUTOMATION_BYPASS_SECRET from your .env as the bypass secret."
  fi
fi

# ── 6. Configure GitHub repository ────────────────────────────────────────────
echo ""
echo -e "$STEP"
echo "  Step 6 of 7 — Configure GitHub repository"
echo -e "$STEP"

if [ -n "$REPO" ]; then
  # Branch protection — require CI to pass before merging
  TMPJSON=$(mktemp)
  cat > "$TMPJSON" << 'BPEOF'
{
  "required_status_checks": {
    "strict": false,
    "contexts": ["Verify & Build"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null
}
BPEOF
  if gh api "repos/$REPO/branches/$DEFAULT_BRANCH/protection" \
       --method PUT --input "$TMPJSON" > /dev/null 2>&1; then
    echo -e "$SUCCESS Branch protection enabled — CI must pass before merging to $DEFAULT_BRANCH."
  else
    echo -e "$WARN Could not enable branch protection (requires GitHub Pro or org repo)."
    echo "  Enable manually: Settings → Branches → Add rule for '$DEFAULT_BRANCH'"
    echo "  → Require status check: 'Verify & Build'"
  fi
  rm -f "$TMPJSON"

  # Dependabot vulnerability alerts
  if gh api "repos/$REPO/vulnerability-alerts" --method PUT > /dev/null 2>&1; then
    echo -e "$SUCCESS Dependabot vulnerability alerts enabled."
  else
    echo -e "$WARN Could not enable Dependabot alerts — enable manually in Settings → Security."
  fi

  # Dependabot automated security fixes
  if gh api "repos/$REPO/automated-security-fixes" --method PUT > /dev/null 2>&1; then
    echo -e "$SUCCESS Dependabot automated security fixes enabled."
  else
    echo -e "$WARN Could not enable automated security fixes — enable manually in Settings → Security."
  fi

  # Allow auto-merge + delete branch on merge
  if gh api "repos/$REPO" --method PATCH \
       --field allow_auto_merge=true \
       --field delete_branch_on_merge=true > /dev/null 2>&1; then
    echo -e "$SUCCESS Auto-merge and delete-branch-on-merge enabled."
  else
    echo -e "$WARN Could not configure repo settings — enable manually in Settings → General."
  fi

  # GitHub Pages for Storybook (gh-pages branch, root path)
  PAGES_JSON=$(mktemp)
  echo '{"source":{"branch":"gh-pages","path":"/"}}' > "$PAGES_JSON"
  PAGES_OWNER=$(echo "$REPO" | cut -d/ -f1)
  PAGES_NAME=$(echo "$REPO" | cut -d/ -f2)
  if gh api "repos/$REPO/pages" --method POST --input "$PAGES_JSON" > /dev/null 2>&1; then
    echo -e "$SUCCESS GitHub Pages enabled — Storybook: https://${PAGES_OWNER}.github.io/${PAGES_NAME}/"
  else
    echo -e "$INFO GitHub Pages already configured or not available for this repo — skipping."
  fi
  rm -f "$PAGES_JSON"
else
  echo -e "$WARN Could not determine repo name — skipping GitHub repository configuration."
fi

# ── 7. Sync to GitHub + open initial-setup PR ─────────────────────────────────
echo ""
echo -e "$STEP"
echo "  Step 7 of 7 — Sync to GitHub and open PR"
echo -e "$STEP"

# Auto-populate sonar-project.properties from the GitHub repo name
if [ -n "$REPO" ] && [ -f "sonar-project.properties" ]; then
  SONAR_OWNER=$(echo "$REPO" | cut -d/ -f1)
  SONAR_REPO=$(echo "$REPO" | cut -d/ -f2)
  SONAR_ORG=$(echo "$SONAR_OWNER" | tr '[:upper:]' '[:lower:]')
  sed -i.bak \
    -e "s|^sonar\.organization=.*|sonar.organization=${SONAR_ORG}|" \
    -e "s|^sonar\.projectKey=.*|sonar.projectKey=${SONAR_OWNER}_${SONAR_REPO}|" \
    -e "s|^sonar\.projectName=.*|sonar.projectName=${SONAR_REPO}|" \
    sonar-project.properties
  rm -f sonar-project.properties.bak
  echo -e "$SUCCESS sonar-project.properties updated (org=${SONAR_ORG}, key=${SONAR_OWNER}_${SONAR_REPO})."
fi

# Collect optional-but-recommended CI tokens interactively
collect_token "SONAR_TOKEN" \
  "https://sonarcloud.io/account/security" \
  "SonarCloud is required for the CI quality gate. Sign in with GitHub at sonarcloud.io, create a project for this repo, update sonar-project.properties with your org/key, then generate a token. After setup, go to Administration → Analysis Method and select CI-based analysis to disable the native auto-scan."

collect_token "SNYK_TOKEN" \
  "https://app.snyk.io/account" \
  "Snyk enables nightly vulnerability scans (not a PR gate, but recommended). Generate a token at snyk.io. To avoid duplicate PR noise, disable Snyk's native auto-PRs: Snyk dashboard → Integrations → GitHub → Configure → disable 'Open fix and upgrade PRs'."

# Sync all secrets and vars to GitHub Actions
bash "$SCRIPT_DIR/sync-github-env.sh"

# Restore .env to local-dev defaults.
# Prod credentials kept as comments — uncomment deliberately to connect locally to production.

# Remove stale prod comment lines from previous setup runs (avoids accumulation)
sed -i.bak -e '/^# DATABASE_URL=libsql:/d' -e '/^# DATABASE_AUTH_TOKEN=/d' .env && rm -f .env.bak

# Save current prod values before overwriting
PROD_URL="$(get_env_var DATABASE_URL)"
PROD_TOKEN="$(get_env_var DATABASE_AUTH_TOKEN)"

# Switch DATABASE_URL to local SQLite and comment out DATABASE_AUTH_TOKEN
update_env_var "DATABASE_URL" "file:./sqlite.db"
sed -i.bak 's|^DATABASE_AUTH_TOKEN=|# DATABASE_AUTH_TOKEN=|' .env && rm -f .env.bak

# Append prod credentials as reference comments
if [[ "${PROD_URL:-}" == libsql://* ]]; then
  {
    echo "# DATABASE_URL=${PROD_URL}  # prod — uncomment to connect locally to production"
    [ -n "${PROD_TOKEN:-}" ] && echo "# DATABASE_AUTH_TOKEN=${PROD_TOKEN}  # prod"
  } >> .env
fi

echo -e "$INFO .env restored to local SQLite — prod credentials kept as comments for reference."

# ── Open feature/initial-setup PR ─────────────────────────────────────────────
echo ""
echo -e "$INFO Opening initial-setup PR..."

SETUP_BRANCH="feature/initial-setup"
ORIG_BRANCH=$(git branch --show-current 2>/dev/null || echo "$DEFAULT_BRANCH")

# Stash uncommitted changes so we can safely switch branches
STASHED=false
if ! git diff --quiet 2>/dev/null || ! git diff --cached --quiet 2>/dev/null; then
  git stash push -m "setup.sh: temporary stash" --quiet
  STASHED=true
fi

# Create/reset branch from latest remote default branch
git fetch origin "$DEFAULT_BRANCH" --quiet
git checkout -B "$SETUP_BRANCH" "origin/$DEFAULT_BRANCH" --quiet

# Empty commit — triggers CI without touching any code
git commit --allow-empty -m "chore: initial CI/CD verification

Triggers the full CI pipeline to confirm all integrations are configured:
  - Biome lint & format
  - Unit tests (80% coverage threshold)
  - SonarCloud code quality scan (requires SONAR_TOKEN)
  - SBOM generation (CycloneDX)

Merge this PR once CI passes to trigger the first production deployment."

git push --force-with-lease origin "$SETUP_BRANCH" --quiet

# Return to the original branch
git checkout "$ORIG_BRANCH" --quiet

# Restore any stashed changes
if [ "$STASHED" = true ]; then
  git stash pop --quiet
fi

# Create PR if one doesn't already exist for this branch
EXISTING_PR=$(gh pr list --head "$SETUP_BRANCH" --base "$DEFAULT_BRANCH" --json number -q '.[0].number' 2>/dev/null || echo "")

if [ -z "$EXISTING_PR" ]; then
  TMPFILE=$(mktemp)
  cat > "$TMPFILE" << 'PREOF'
## 🚀 Initial Production Setup

This PR was created automatically by `npm run infra:setup`.

### What was configured
- ✅ Production Turso database provisioned
- ✅ Vercel project linked, GitHub auto-deploy disabled (`vercel.json` + API)
- ✅ All CI secrets and vars synced to GitHub Actions

### What CI checks before this can merge

| Check | Blocks merge |
|-------|-------------|
| Biome lint & format | ✅ |
| Unit tests (80% coverage threshold) | ✅ |
| SonarCloud code quality scan | ✅ requires `SONAR_TOKEN` |
| SBOM generation | ✅ |

### If CI fails

**SonarCloud fails (most common):**
1. Sign up at [sonarcloud.io](https://sonarcloud.io) and create a project for this repo
2. Generate a token and add it to `.env` as `SONAR_TOKEN`
3. Re-run: `npm run infra:sync:github`
4. Re-trigger CI with an empty commit:
   ```bash
   git commit --allow-empty -m "ci: add sonar token" && git push origin feature/initial-setup
   ```

### After merging

`deploy.yml` triggers automatically and deploys to Vercel production. 🎉

---
> `.env` contains secrets — never commit it.
PREOF

  PR_URL=$(gh pr create \
    --base "$DEFAULT_BRANCH" \
    --head "$SETUP_BRANCH" \
    --title "chore: initial CI/CD verification" \
    --body "$(cat "$TMPFILE")")
  rm -f "$TMPFILE"
  echo -e "$SUCCESS PR opened: $PR_URL"
else
  PR_URL=$(gh pr view "$EXISTING_PR" --json url -q .url 2>/dev/null || echo "")
  echo -e "$INFO PR already exists: $PR_URL"
fi

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "$STEP"
echo -e "  $SUCCESS Setup complete!"
echo -e "$STEP"
echo ""
echo "  Next: review the PR, make sure CI passes, then merge."
echo "  Merging triggers the first production deployment automatically."
echo ""
echo "  Local dev:       npm run dev"
echo "  Apply schema:    npm run db:push && npm run db:seed"
echo "  Rotate DB token: npm run infra:rotate-token"
echo "  Re-sync GitHub:  npm run infra:sync:github"
echo ""
echo -e "$WARN .env contains secrets — never commit it."
echo ""
