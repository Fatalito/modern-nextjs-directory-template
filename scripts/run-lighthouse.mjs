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

  try {
    chrome = await launch({
      chromeFlags: ["--headless", "--disable-gpu", "--no-sandbox"],
    });

    const { lhr } = await lighthouse(
      TARGET_URL,
      {
        port: chrome.port,
        output: "json",
        onlyCategories: [
          "performance",
          "accessibility",
          "best-practices",
          "seo",
        ],
        maxWaitForLoad: 30000,
        extraHeaders: VERCEL_AUTOMATION_BYPASS_SECRET
          ? { "x-vercel-protection-bypass": VERCEL_AUTOMATION_BYPASS_SECRET }
          : {},
      },
      {
        extends: "lighthouse:default",
        settings: {
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

    fs.mkdirSync(path.dirname(SCORES_PATH), { recursive: true });
    fs.writeFileSync(
      SCORES_PATH,
      JSON.stringify(
        {
          performance: toPercent(cats.performance?.score),
          accessibility: toPercent(cats.accessibility?.score),
          "best-practices": toPercent(cats["best-practices"]?.score),
          seo: toPercent(cats.seo?.score),
          suggestions,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    console.error("❌ Lighthouse Audit Failed:", error);
    process.exitCode = 1;
  } finally {
    chrome?.kill();
  }
}

await run();
