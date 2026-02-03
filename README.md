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
- **Internationalization:** Supported (i18n)
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
The project uses a centralized configuration pattern located in src/shared/config/site-config.ts. 
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

## License

Apache 2.0

