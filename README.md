# modern-nextjs-directory-template

A modern, scalable Next.js directory template designed with performance, maintainability, and developer experience in mind.

**[Live demo →](https://modern-nextjs-directory-template.vercel.app)**

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, React Compiler enabled) |
| **UI Library** | React 19 |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS v4 & Shadcn UI |
| **Database** | Drizzle ORM + libsql (SQLite locally / Turso in production) |
| **Validation** | Zod (schema-first, single source of truth for types) + t3-oss/env-nextjs (type-safe env) |
| **Linting & Formatting** | Biome |
| **Pre-commit Hooks** | Lefthook |
| **Testing** | Vitest (unit), Playwright (E2E), Lighthouse (performance scoring) |
| **Component Explorer** | Storybook |
| **Architecture** | Feature-Sliced Design (FSD) |
| **Runtime** | Node.js v24 (managed via `.nvmrc`) |
| **AI Tooling** | `.mcp.json` auto-loads MCP servers (Next.js DevTools, Context7 docs, Playwright, Shadcn) for Claude Code |

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Set up the database
npm run db:generate   # generate migrations from schema
npm run db:push       # apply migrations to the local SQLite file
npm run db:seed       # seed with sample data

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🚀 First-time production setup (→ live)

**Platforms used:** [Turso](https://turso.tech) (DB) · [Vercel](https://vercel.com) (hosting) · [SonarCloud](https://sonarcloud.io) (quality) · [Snyk](https://snyk.io) (security)

### 1. Install CLIs and copy `.env`

```bash
curl -sSfL https://get.tur.so/install.sh | bash  # Turso
npm i -g vercel                                    # Vercel
brew install gh                                    # GitHub CLI (or https://cli.github.com)

cp .env.example .env
```

### 2. Run setup

```bash
npm run infra:setup
```

This single command handles everything — it will prompt for any missing information:
- Authenticates all CLIs (`turso`, `vercel`, `gh`)
- Collects all tokens interactively (`VERCEL_TOKEN`, `TURSO_API_TOKEN`, `SONAR_TOKEN`, `SNYK_TOKEN`) — skipped if already in `.env` or GitHub Secrets
- Creates the production Turso database, applies schema, and seeds it
- Links the Vercel project and disables GitHub auto-deploy
- Generates `VERCEL_AUTOMATION_BYPASS_SECRET` and configures deployment protection
- Configures the GitHub repository: branch protection, Dependabot, auto-merge
- Syncs all secrets and variables to GitHub Actions
- Opens a `feature/initial-setup` PR

After setup: all credentials live in **GitHub Secrets**. `.env` is restored to local SQLite — prod credentials are kept as comments so you can opt in deliberately; `npm run dev` is safe by default.

### 3. Make CI pass and merge the PR

CI must pass before you can merge — this is intentional. The pipeline checks lint, tests, coverage, and SonarCloud. If you skipped any tokens during `infra:setup`, add them to `.env` and re-run `npm run infra:sync:github` to sync without re-running the full setup.

> **SonarCloud:** After the first successful analysis, go to your project → **Administration → Analysis Method** and select **CI-based analysis** to disable the native auto-scan (which would conflict with the CI integration).

Once CI is green, **merge the PR** — `deploy.yml` triggers automatically and deploys to Vercel production. 🎉

From this point on, every merge to `main` auto-deploys after CI passes, and every PR gets an isolated preview environment with a forked database.

## 🗄️ Database

The project uses **Drizzle ORM** with **libsql**: a local SQLite file in development and a managed [Turso](https://turso.tech) database in production. The connection is determined by `DATABASE_URL`:

| `DATABASE_URL` value | Mode |
|---|---|
| `file:./sqlite.db` (default) | Local SQLite file |
| `libsql://…turso.io` | Remote Turso database |

For turso, install the CLI and create an account:

```bash
curl -sSfL https://get.tur.so/install.sh | bash
turso auth login
```

See the [Turso quickstart](https://docs.turso.tech/quickstart) for full documentation.

### Provisioning

See [First-time production setup](#-first-time-production-setup---live) for the full onboarding flow. The relevant commands:

```bash
npm run infra:setup      # provision DB, link Vercel, configure GitHub, sync secrets, open PR
```

`db:push` and `db:seed` are run automatically by `infra:setup`.

### API token

For CI deployment, [generate an API token](https://app.turso.tech/api-tokens) and store it in .env as `TURSO_API_TOKEN`.

### Free plan locations

The default location is `aws-eu-west-1` (Ireland). All locations available on the free plan:

| ID | Location |
|----|----------|
| `aws-ap-northeast-1` | AWS AP NorthEast (Tokyo) |
| `aws-ap-south-1` | AWS AP South (Mumbai) |
| `aws-eu-west-1` | AWS EU West (Ireland) — **default** |
| `aws-us-east-1` | AWS US East (Virginia) |
| `aws-us-east-2` | AWS US East (Ohio) |
| `aws-us-west-2` | AWS US West (Oregon) |

Run `turso db locations` to get the current list. Override the default in `infra/turso.conf.sh` or via env var:

```bash
TURSO_REGION=aws-us-east-1 npm run infra:setup
```

### Token rotation

```bash
# Mints a new token and prints it — update Vercel/GitHub Secrets, then revoke the old one
npm run infra:rotate-token
```

## Vercel Deployment

`infra:setup` collects `VERCEL_TOKEN` interactively and generates `VERCEL_AUTOMATION_BYPASS_SECRET` automatically. CI workflows send the bypass secret as a header so E2E and perf tests can access protected preview deployments.

## CI/CD & Environment Management

### PR Preview Deployments

Pull requests to `main` automatically deploy a preview to Vercel and fork a Turso DB for isolated testing. See `.github/workflows/pr.yml` for details. The preview URL is posted as a comment on the PR.

### PR Cleanup

When a PR is closed, `.github/workflows/cleanup.yml` deletes the forked Turso database, the Vercel preview and the Storybook PR page to avoid resource leaks.

### Environment Variable Sync

**GitHub Actions is the single source of truth for all runtime secrets.** Deploy workflows push credentials to Vercel fresh on every deploy — nothing is stored permanently in Vercel's dashboard.

Run once after initial setup (and again after any credential change):

```bash
npm run infra:sync:github
```

| Name | Kind | Used by |
|------|------|---------|
| `DATABASE_URL` | Secret | `deploy.yml` → pushed to Vercel production at deploy time |
| `DATABASE_AUTH_TOKEN` | Secret | `deploy.yml` → pushed to Vercel production at deploy time |
| `TURSO_API_TOKEN` | Secret | `pr.yml` — forks DB per PR |
| `VERCEL_TOKEN` | Secret | `deploy.yml`, `pr.yml`, `cleanup.yml` |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | Secret | `pr.yml` — E2E + perf tests against protected deployments |
| `VERCEL_ORG_ID` | Secret | All Vercel CLI workflows |
| `VERCEL_PROJECT_ID` | Secret | All Vercel CLI workflows |
| `TURSO_DB_NAME` | Variable | `pr.yml`, `cleanup.yml` |
| `TURSO_REGION` | Variable | `pr.yml` |

`SONAR_TOKEN` and `SNYK_TOKEN` are collected interactively by `infra:setup` (opens the browser to the token page, prompts for input, syncs via `gh secret set`). If you skipped them, add the values to `.env` and re-run `npm run infra:sync:github`.

### Health Endpoint

`GET /api/health` runs a `SELECT 1` against the production database and returns:

```json
{ "status": "ok", "db": "ok" }
```

The response includes an `X-Commit-Sha` header with the short SHA of the deployed commit. `deploy.yml` polls this endpoint after every deployment, verifies the SHA matches the just-deployed commit, and fails the workflow immediately if there's a mismatch — catching stale-deployment or DB connectivity issues before they go unnoticed.

### Production Deployments

`deploy.yml` triggers automatically after `Main` passes on `main`, and can also be triggered manually. It:
1. Pushes `DATABASE_URL` and `DATABASE_AUTH_TOKEN` from GitHub Secrets to Vercel production
2. Runs `vercel pull` + `vercel build --prod` + `vercel deploy --prebuilt --prod`
3. Polls `/api/health` until the deployment is live and the correct SHA is confirmed

See [scripts/infra/sync-github-env.sh](scripts/infra/sync-github-env.sh) for implementation.


---

## Commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Production start | `npm run start` |
| Clean build + start | `npm run start:clean` |
| Build | `npm run build` |
| Clean build artefacts | `npm run clean` |
| Clean everything | `npm run clean:all` |
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` |
| Lint + fix | `npm run lint:fix` |
| All unit tests | `npm run test` |
| Watch tests | `npm run test:unit:watch` |
| Unit tests (Vitest UI) | `npm run test:unit:ui` |
| Coverage (80% threshold) | `npm run test:coverage` |
| E2E tests | `npm run test:e2e` |
| E2E tests (Playwright UI) | `npm run test:e2e:ui` |
| DB generate migrations | `npm run db:generate` |
| DB push migrations | `npm run db:push` |
| DB seed | `npm run db:seed` |
| DB studio (GUI) | `npm run db:studio` |
| First-time production setup | `npm run infra:setup` |
| Provision DB only | `npm run infra:setup:db` |
| Full teardown (DB + Vercel + secrets) | `npm run infra:teardown` |
| Teardown DB only | `npm run infra:teardown:db` |
| Rotate DB token | `npm run infra:rotate-token` |
| Sync CI vars to GitHub Actions | `npm run infra:sync:github` |
| Storybook | `npm run storybook` |
| Storybook build | `npm run storybook:build` |
| Perf check | `npm run perf:check` |
| Lighthouse only | `npm run perf:lighthouse` |
| Perf compare vs baseline | `npm run perf:compare` |
| Update perf baseline | `npm run perf:baseline` |
| Security audit | `npm run security:audit` |
| Generate SBOM | `npm run security:sbom` |

## Architecture: Feature-Sliced Design (FSD)

```
src/
├── app/              # Next.js routing and pages
│   └── lib/data-loaders/  # Route-specific data fetchers
├── shared/           # Reusable low-level code
│   ├── api/db/       # Drizzle schema, base repository, custom types
│   ├── config/       # Site config, env validation, security policies
│   ├── lib/          # Utilities (cn, validation, security, schema utils)
│   ├── model/        # Cross-entity Zod schemas (Contact, Category…)
│   ├── testing/      # Test factories and helpers
│   └── ui/           # Shared UI components
├── entities/         # Domain models: business, location, service, user, contact
├── widgets/          # Compositional blocks (business-list, directory-layout)
└── views/            # Page compositions
```

### Entity Structure

Each entity (e.g., `src/entities/business/`) follows:

```
model/schema.ts      # Zod schemas — single source of truth for types
model/types.ts       # TypeScript types extracted from schemas
model/selectors.ts   # Drizzle query builders
model/mapper.ts      # Domain mapper (raw DB row → domain object)
api/*-repository.ts  # Repository factory (CRUD + custom methods)
api/accessors.ts     # React-cached accessor functions
index.ts             # Public API for browser-safe code (UI, selectors)
server.ts            # Public API for server-only code (accessors)
ui/                  # React components
```

**Dual-barrel rule** — each entity has two public entry points:

| Entry point | Used by | Contains |
|-------------|---------|----------|
| `index.ts` | Client components, widgets, views | UI, selectors, validation — no Node.js/DB imports |
| `server.ts` | Data loaders, Server Components | React-cached accessors backed by the repository |

Never import from internal paths (e.g., `@/entities/business/api/accessors`). Always go through `@/entities/business` or `@/entities/business/server`. This keeps Storybook and client bundles free from DB/Node.js leakage.

### Repository Pattern

Base repositories are created via factory functions in `src/shared/api/db/base-repository.ts`:

- `createRepository(db, table, parse?)` — basic CRUD with optional Zod parse
- `createSlugRepository(db, table, parse?)` — adds `getBySlug()`

Entity repositories extend these (e.g., `createBusinessRepository(db)` adds `filters()`, `getPopularPaths()`).

### Database

The project uses **Drizzle ORM** with **libsql** (SQLite locally, Turso in production). The schema is defined in `src/shared/api/db/schema.ts`.

Zod schemas are kept in sync with Drizzle columns via `src/shared/model/schema-sync.test.ts`, which uses `getTableColumns()` to diff both at test time.

## ⚙️ Site Configuration

The project uses a centralised configuration pattern located in `src/shared/config/site-config.ts`.
This file serves as the single source of truth for SEO, metadata, and global constants.

- **Metadata:** Automatically synced with the Next.js Metadata API in the root layout.
- **Dynamic URLs:** The site URL adapts based on the environment to ensure valid canonical tags and OpenGraph previews.

## 🔐 Environment Variables

Copy the example file to get started:

```bash
cp .env.example .env
```

`.env` is gitignored — never commit credentials. `.env.example` is the committed template.

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Base URL of the deployment (required for SEO/OG images) | `http://localhost:3000` |
| `NEXT_OUTPUT_MODE` | Build output format (see Deployment Configuration) | `serverless` |
| `ENABLE_HSTS` | Enable HSTS security header (requires HTTPS) | `false` |
| `DATABASE_URL` | libsql connection URL — `file:` for local SQLite, `libsql://` for Turso. Also synced to GitHub as `DATABASE_URL` secret; pushed to Vercel production by `deploy.yml` at deploy time | `file:./sqlite.db` |
| `DATABASE_AUTH_TOKEN` | Turso auth token — required when `DATABASE_URL` is a remote endpoint. Also synced to GitHub as `DATABASE_AUTH_TOKEN` secret; pushed to Vercel production by `deploy.yml` at deploy time | — |
| `TURSO_API_TOKEN` | Turso API token for CI/PR DB forking and cleanup (`TURSO_API_TOKEN` secret in GitHub) | Generate at app.turso.tech |
| `TURSO_DB_NAME` | Base name of the Turso database, without environment suffix (`TURSO_DB_NAME` variable in GitHub) | `modern-directory` |
| `TURSO_REGION` | Turso primary location for new databases (`TURSO_REGION` variable in GitHub) | `aws-eu-west-1` |
| `VERCEL_TOKEN` | Vercel deploy token for CI/preview/cleanup workflows (`VERCEL_TOKEN` secret in GitHub) | Generate at vercel.com |
| `VERCEL_ORG_ID` | Vercel organization ID (`VERCEL_ORG_ID` secret in GitHub) | Extracted from `.vercel/` by sync script |
| `VERCEL_PROJECT_ID` | Vercel project ID (`VERCEL_PROJECT_ID` secret in GitHub) | Extracted from `.vercel/` by sync script |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | Bypass secret for Vercel Deployment Protection; allows CI to access preview deployments without auth | Auto-generated by `infra:setup` |
| `BASE_URL` | Target URL for E2E and performance tests (set automatically in CI; override locally) | `http://localhost:3000` |
| `SONAR_TOKEN` | SonarCloud authentication token (`SONAR_TOKEN` secret in GitHub) | Generate at sonarcloud.io |
| `SNYK_TOKEN` | Snyk authentication token for nightly vulnerability scans (`SNYK_TOKEN` secret in GitHub) | Generate at snyk.io |

## 🚀 Deployment Configuration

Set `NEXT_OUTPUT_MODE` to match your deployment target.

| Mode | Use Case | Output | SSR/API | Deploy To |
|------|----------|--------|---------|-----------|
| `serverless` | Full-featured apps with SSR and API routes | Node.js server | ✅ Yes | Vercel, Netlify |
| `static` | Static sites, no server-side logic | Static HTML export | ❌ No | GitHub Pages, S3, Cloudflare Pages |
| `standalone` | Self-hosted / containers | Self-contained bundle | ✅ Yes | Docker, EC2, VPS, Kubernetes |

```bash
# Deploy to Vercel (auto-detected)
npm run build

# Deploy to GitHub Pages (static-only)
NEXT_OUTPUT_MODE=static npm run build

# Deploy to Docker/EC2
NEXT_OUTPUT_MODE=standalone npm run build
```

## ⚡ Performance Engineering

This repository tracks two complementary performance signals:

- **Playwright E2E timing** — raw `domReady` / `loadTime` metrics compared against a canonical baseline in `perf-baseline.json`
- **Lighthouse** — automated audits for Performance, Accessibility, Best Practices, and SEO scores; run via `chrome-launcher` (avoids CDP conflicts with Playwright) as part of `perf:e2e`

### Core Metrics

- **domReady** — time until the DOM is parsed and stable (measures hydration cost and DOM bloat)
- **loadTime** — time until the page is fully loaded, including all external assets

### Local Verification

```bash
# Build, start the server, and run the 3× repeat suite
npm run perf:check

# Non-blocking comparison against the current baseline
npm run perf:compare
```

> **Note:** Local results vary by hardware. Always trust the CI baseline for final verification.

### CI Caching

The CI pipeline caches two layers to minimise redundant work:

| Cache | Key | Benefit |
|-------|-----|---------|
| `node_modules` | `package-lock.json` hash | Skips `npm ci` entirely on cache hit |
| `.next/cache` | lockfile + `src/**` hash | Speeds up incremental Turbopack compilation |

Playwright browsers are not cached separately — the `mcr.microsoft.com/playwright` Docker image (used in `pr.yml` and `update-perf-baseline.yml`) ships with all browsers pre-installed.

### CI Gatekeeper

Every PR triggers a `perf:e2e` job with:

- **Isolation:** serial execution (`--workers=1`) to prevent CPU contention
- **Warmup:** routes are curled before measurement to ensure JIT compilation
- **Resilience:** multiple samples with median delta to squash outliers
- **Failure condition:** build fails if a metric regresses by more than the configured threshold (default 20%) or a baseline is missing
- **Server lifecycle:** the perf benchmark runs via `start-server-and-test` so the production server stays alive when Lighthouse connects (Playwright's `webServer` would kill it between steps)

### Updating the Baseline

When a performance shift is intentional:

1. Trigger the **Update Performance Baseline** workflow manually in GitHub Actions.
2. The workflow generates a new `perf-baseline.json` and opens a Pull Request.
3. Once reviewed and merged, this becomes the new source of truth.

```bash
# Update the baseline locally (use with caution)
npm run perf:baseline
```

### Artifacts

CI uploads the following artifacts for every run:

- `perf-metrics.jsonl` — raw line-by-line logs of every test iteration
- `test-results/perf-summary.json` — machine-readable summary for dashboards and downstream automation

## 🛡️ Security

### Dependency Audit

```bash
# Fail on high or critical vulnerabilities
npm run security:audit
```

### Software Bill of Materials (SBOM)

The project uses `@cyclonedx/cyclonedx-npm` to generate a CycloneDX-format SBOM, listing every direct and transitive dependency with licence and integrity metadata.

```bash
# Outputs to build/reports/bom.json
npm run security:sbom
```

This is useful for supply-chain compliance and licence auditing in regulated environments.

### HTTP Security Headers

Applied in the middleware via `src/shared/lib/security/`. Key headers:

- **Content-Security-Policy** — CSP defined in `src/shared/config/security-policies.ts`; uses `'unsafe-inline'` to allow Next.js hydration scripts while still blocking external script sources
- **Cache-Control** — public routes served with `s-maxage=1, stale-while-revalidate=60` (CDN stale window); ISR revalidation period is set separately per route via `export const revalidate`
- **HSTS** — enabled via `ENABLE_HSTS=true` (requires HTTPS)
- Standard headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`

## License

Apache 2.0
