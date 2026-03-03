import fs from "node:fs";
import path from "node:path";
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

const TARGET_URL = process.env.BASE_URL || "http://127.0.0.1:3000";
const VERCEL_AUTOMATION_BYPASS_SECRET =
  process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

const SCORES_PATH = path.join(
  process.cwd(),
  "test-results",
  "lighthouse-scores.json",
);

async function run() {
  let chrome;

  const bypassHeaders = VERCEL_AUTOMATION_BYPASS_SECRET
    ? { "x-vercel-protection-bypass": VERCEL_AUTOMATION_BYPASS_SECRET }
    : {};

  try {
    const response = await fetch(TARGET_URL, {
      signal: AbortSignal.timeout(5000),
      headers: bypassHeaders,
    });
    const html = await response.text();
    // Every Next.js page references /_next/ assets. Vercel's protection wall
    // uses /_vercel/ assets — its absence means we're auditing the wrong page.
    if (!html.includes("/_next/")) {
      console.error(
        `❌ ${TARGET_URL} does not look like a Next.js app — /_next/ assets missing.`,
      );
      console.error(
        "   This usually means Lighthouse is hitting Vercel's Deployment Protection page.",
      );
      if (VERCEL_AUTOMATION_BYPASS_SECRET) {
        console.error(
          "   Verify that VERCEL_AUTOMATION_BYPASS_SECRET matches the secret registered at:",
        );
        console.error(
          "   Vercel Dashboard → Project → Settings → Deployment Protection → Protection Bypass for Automation",
        );
      } else {
        console.error(
          "   Set VERCEL_AUTOMATION_BYPASS_SECRET to bypass Vercel Deployment Protection.",
        );
      }
      process.exit(1);
    }
  } catch {
    console.error(
      `❌ Server not reachable at ${TARGET_URL}. Ensure it is running before calling this script.`,
    );
    process.exit(1);
  }

  try {
    chrome = await launch({
      chromeFlags: ["--headless", "--disable-gpu", "--no-sandbox"],
      ...(process.env.CHROME_PATH
        ? { chromePath: process.env.CHROME_PATH }
        : {}),
    });

    const { lhr } = await lighthouse(
      TARGET_URL,
      { port: chrome.port, output: "json" },
      {
        extends: "lighthouse:default",
        settings: {
          onlyCategories: [
            "performance",
            "accessibility",
            "best-practices",
            "seo",
          ],
          maxWaitForLoad: 30000,
          extraHeaders: bypassHeaders,
          // Preview deployments set x-robots-tag: noindex intentionally.
          // This audit is irrelevant in a CI/dev context — skip it.
          skipAudits: ["is-crawlable"],
        },
      },
    );

    const toPercent = (score) =>
      typeof score === "number" ? Math.round(score * 100) : 0;

    const cats = lhr.categories;
    const audits = lhr.audits;

    // Collect failing audits per category for the suggestions block
    const suggestions = {};
    for (const [catKey, cat] of Object.entries(cats)) {
      const failing = (cat.auditRefs ?? [])
        .filter(({ id }) => {
          const audit = audits[id];
          return (
            audit &&
            audit.score !== null &&
            audit.score < 1 &&
            audit.scoreDisplayMode !== "notApplicable" &&
            audit.scoreDisplayMode !== "informative"
          );
        })
        .map(({ id }) => {
          const { title, displayValue, score } = audits[id];
          return {
            title,
            displayValue: displayValue ?? null,
            score: Math.round(score * 100),
          };
        })
        .sort((a, b) => a.score - b.score);

      if (failing.length > 0) {
        suggestions[catKey] = failing;
      }
    }

    const scores = {
      performance: toPercent(cats.performance?.score),
      accessibility: toPercent(cats.accessibility?.score),
      "best-practices": toPercent(cats["best-practices"]?.score),
      seo: toPercent(cats.seo?.score),
      suggestions,
    };

    fs.mkdirSync(path.dirname(SCORES_PATH), { recursive: true });
    fs.writeFileSync(SCORES_PATH, JSON.stringify(scores, null, 2));

    const icon = (n) => (n >= 90 ? "✅" : n >= 50 ? "⚠️" : "❌");
    console.log("\n📊 Lighthouse Scores");
    console.log(
      `  Performance:    ${scores.performance}  ${icon(scores.performance)}`,
    );
    console.log(
      `  Accessibility:  ${scores.accessibility}  ${icon(scores.accessibility)}`,
    );
    console.log(
      `  Best Practices: ${scores["best-practices"]}  ${icon(scores["best-practices"])}`,
    );
    console.log(`  SEO:            ${scores.seo}  ${icon(scores.seo)}\n`);
  } catch (error) {
    console.error(`❌ Lighthouse Audit Failed: ${error?.message ?? error}`);
    process.exit(1);
  } finally {
    chrome?.kill();
  }
}

await run();
