# modern-nextjs-directory-template

A modern, scalable Next.js directory template designed with performance, maintainability, and developer experience in mind.

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

```bash
# One-time setup: creates the Turso database and update .env with DATABASE_URL + DATABASE_AUTH_TOKEN
npm run infra:setup
npm run db:push
npm run db:seed
```

### API token

For CI deployment, (generate an API token)[https://app.turso.tech/api-tokens] and store it in .env TURSO_API_TOKEN

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

### Linking the Project

Before syncing environment variables or deploying, link your local project to Vercel:

```bash
vercel link
```
Follow the prompts to select the correct Vercel project and team.
It will create a `.vercel` directory with the project configuration.
VERCEL_ORG_ID and VERCEL_PROJECT_ID are extracted from this config for use in the sync scripts and CI/CD workflows.

### Syncing Environment Variables

Use:

```bash
npm run infra:sync:vercel
```
This script interactively syncs your `.env` variables to Vercel environments (development, preview, production). Tokens are marked as sensitive in production. See the script for details.


### API token

For CI deployment, (generate an API token)[https://vercel.com/account/settings/tokens] and store it in .env VERCEL_TOKEN

### Vercel Protection bypass

To Allow CI PR perf and end to end testing workflows to bypass Vercel's protection mechanisms, go to  your project settings > Deployment Protection and either disable it or generate a bypass secret and add it to your .env as VERCEL_AUTOMATION_BYPASS_SECRET. The CI workflows will send this secret as a header in requests to the preview deployment.

## CI/CD & Environment Management

## PR Preview Deployments

Pull requests to `main` automatically deploy a preview to Vercel and fork a Turso DB for isolated testing. See `.github/workflows/preview.yml` for details. The preview URL is posted as a comment on the PR.

## PR Cleanup

When a PR is closed, `.github/workflows/cleanup.yml` deletes the forked Turso database, the Vercle preview and the storybook pr page to avoid resource leaks.

## Environment Variable Sync

Use the provided scripts to sync your local `.env` to cloud environments:

- `npm run infra:sync:vercel` — Syncs `.env` to selected Vercel environments (development, preview, production). Skips `VERCEL_*` vars and marks tokens as sensitive in production. Interactive selection.
- `npm run infra:sync:github` — Syncs `.env` to GitHub Actions (tokens as secrets, others as variables). Also uploads Vercel project IDs from `.vercel/project.json` if present.

See `scripts/infra/sync-vercel-env.sh` and `scripts/infra/sync-github-env.sh` for implementation.


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
| Sync .env to Vercel envs | `npm run infra:sync:vercel` |
| Sync .env to GitHub Actions | `npm run infra:sync:github` |
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
| `DATABASE_URL` | libsql connection URL — `file:` for local SQLite, `libsql://` for Turso | `file:./sqlite.db` |
| `DATABASE_AUTH_TOKEN` | Turso auth token — required when `DATABASE_URL` is a remote endpoint | — |
| `TURSO_API_TOKEN` | Turso API token for CI/PR DB forking and cleanup | Generate at app.turso.tech |
| `VERCEL_TOKEN` | Vercel deploy token for CI/preview/cleanup workflows | Generate at vercel.com |
| `VERCEL_ORG_ID` | Vercel organization ID (used by preview workflow) | Extracted from vercel/ and set by sync script |
| `VERCEL_PROJECT_ID` | Vercel project ID (used by preview workflow) | Extracted from vercel/ and set by sync script |
| `BUILD_URL` | Target url for e2e and perf tests (used in CI, E2E, and reporting) | `http://localhost:3000` |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | Set to `1` to bypass certain checks or validation in CI/CD (if needed) | — |

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

The CI pipeline caches three layers to minimise redundant work:

| Cache | Key | Benefit |
|-------|-----|---------|
| `node_modules` | `package-lock.json` hash | Skips `npm ci` entirely on cache hit |
| `.next/cache` | lockfile + `src/**` hash | Speeds up incremental Turbopack compilation |
| Playwright browsers | `package-lock.json` hash | Skips ~300 MB browser download; only system deps reinstalled |

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
