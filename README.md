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
cp .env.example .env.local

# Set up the database
npm run db:generate   # generate migrations from schema
npm run db:push       # apply migrations to the local SQLite file
npm run db:seed       # seed with sample data

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

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
| Storybook | `npm run storybook` |
| Storybook build | `npm run storybook:build` |
| Perf check | `npm run perf:check` |
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
cp .env.example .env.local
```

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Base URL of the deployment (required for SEO/OG images) | `http://localhost:3000` |
| `NEXT_OUTPUT_MODE` | Build output format (see Deployment Configuration) | `serverless` |
| `ENABLE_HSTS` | Enable HSTS security header (requires HTTPS) | `false` |

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
- **Lighthouse** — automated audits for Performance, Accessibility, Best Practices, and SEO scores; run as part of `perf:e2e`

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

### CI Gatekeeper

Every PR triggers a `perf:e2e` job with:

- **Isolation:** serial execution (`--workers=1`) to prevent CPU contention
- **Warmup:** routes are curled before measurement to ensure JIT compilation
- **Resilience:** multiple samples with median delta to squash outliers
- **Failure condition:** build fails if a metric regresses by more than the configured threshold (default 20%) or a baseline is missing

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

Configured in `src/shared/config/` via `next.config.ts`. Key headers:

- **Content-Security-Policy** — strict CSP defined in `src/shared/config/security-policies.ts`
- **HSTS** — enabled via `ENABLE_HSTS=true` (requires HTTPS)
- Standard headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`

## License

Apache 2.0
