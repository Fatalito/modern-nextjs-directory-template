# modern-nextjs-directory-template

A modern, scalable Next.js directory template designed with performance, maintainability, and developer experience in mind.

## Tech Stack

- **Framework:** Next.js (App Router, Server Components)
- **Runtime:** Node.js v24 (managed via `.nvmrc`)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 & Shadcn UI
- **Linting & Formatting:** Biome
- **Pre-commit Hooks:** Lefthook
- **Testing:** Vitest (Unit), Playwright (Integration/E2E)
- **Internationalisation:** Supported (i18n)
- **Architecture:** Multi-Zones - Listing, Dashboard, Blog

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## ⚙️ Site Configuration
The project uses a centralised configuration pattern located in src/shared/config/site-config.ts. 
This file serves as the Single Source of Truth for SEO, metadata, and global constants.

- Metadata: Automatically synced with Next.js Metadata API in the root layout.
- Dynamic URLs: The site URL adapts based on the environment to ensure valid Canonical tags and OpenGraph previews.

## 🔐 Environment Variables
Copy the example file to get started:
```bash
cp .env.example .env.local
```

| Variable | Description | Default |  
| --- | --- | --- |  
| NEXT_PUBLIC_APP_URL | The base URL of the deployment (required for SEO/OG images) | `http://localhost:3000` |  
| NEXT_OUTPUT_MODE | Build output format (see Deployment Configuration section) | `serverless` |  
| ENABLE_HSTS | Enable HSTS security header (requires HTTPS) | `false` |  

## 🚀 Deployment Configuration

Set `NEXT_OUTPUT_MODE` to match your deployment target. This controls the Next.js build output format and determines which platforms and features are available.

| Mode | Use Case | Output | SSR/API | Deploy To | Notes |
|------|----------|--------|---------|-----------|-------|
| `serverless` | Full-featured apps with SSR and API routes | `undefined` (Node.js server) | ✅ Yes | Vercel, Netlify, Cloudflare Pages | Requires runtime middleware support |
| `static` | Static websites, no server-side logic | `"export"` (static HTML) | ❌ No | GitHub Pages, S3, Cloudflare Pages (static) | Build-time only, fastest delivery |
| `standalone` | Self-hosted servers, containers | `"standalone"` (self-contained bundle) | ✅ Yes | Docker, EC2, VPS, Kubernetes | Bundles node_modules, no npm install needed |

### Examples

```bash
# Deploy to Vercel (no config needed, auto-detected)
npm run build

# Deploy to GitHub Pages (static-only)
NEXT_OUTPUT_MODE=static npm run build

# Deploy to Docker/EC2 (default, standalone)
NEXT_OUTPUT_MODE=standalone npm run build
```

## ⚡ Performance Engineering & Workflow
This repository tracks Playwright E2E (@perf) performance metrics and compares them against a canonical baseline stored in `perf-baseline.json`.

### The Core Metrics
We track two key lifecycle events for our critical paths:
- domReady: Time until the HTML is parsed and the DOM is stable (measures Hydration cost and DOM bloat).
- loadTime: Time until the page is fully loaded, including all external assets and scripts.

### Local Development & Verification
To check performance locally before pushing to CI:

```bash
# Builds the app, starts the server, and runs the 3x repeat suite
npm run perf:check
# Run a permissive comparison against the current baseline (non-blocking)
npm run perf:compare
```
> **Important:** Local results will vary based on hardware. While useful for catching massive regressions during development, always trust the CI Baseline for final verification.

### CI Gatekeeper
Every PR triggers a perf:e2e job in GitHub Actions with the following constraints:
- Isolation: Serial execution (--workers=1) to prevent CPU contention.
- Warmup: Routes are warmed up via curl prior to measurement to ensure JIT compilation.
- Resilience: We capture multiple samples and utilise the Median to calculate deltas, automatically squashing outliers.
- Failure Condition: The build fails if a metric regresses by more than the configured threshold (default 20%) or if a baseline is missing.

### Updating the Baseline
When a performance shift is intentional (e.g., following a significant system modernisation or feature addition), you must update the canonical baseline:
- Trigger the Update Performance Baseline workflow manually in GitHub Actions.
- The workflow will generate a new perf-baseline.json and open a Pull Request.
- Once reviewed and merged to main, this becomes the new "Source of Truth."

```bash
# To update the baseline locally (use with caution):
npm run perf:baseline
```

### Artifacts & Integration
CI uploads the following artifacts for every run:
- perf-metrics.jsonl: Raw line-by-line logs of every test iteration.
- test-results/perf-summary.json: Machine-readable summary for use in dashboards, custom monitoring, or downstream automation.

## License

Apache 2.0

