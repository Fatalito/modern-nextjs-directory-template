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

    const { lhr } = await lighthouse(TARGET_URL, {
      port: chrome.port,
      output: "json",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      maxWaitForLoad: 30000,
      extraHeaders: VERCEL_AUTOMATION_BYPASS_SECRET
        ? { "x-vercel-protection-bypass": VERCEL_AUTOMATION_BYPASS_SECRET }
        : {},
    });

    const toPercent = (score) =>
      typeof score === "number" ? Math.round(score * 100) : 0;

    const cats = lhr.categories;

    fs.mkdirSync(path.dirname(SCORES_PATH), { recursive: true });
    fs.writeFileSync(
      SCORES_PATH,
      JSON.stringify(
        {
          performance: toPercent(cats.performance?.score),
          accessibility: toPercent(cats.accessibility?.score),
          "best-practices": toPercent(cats["best-practices"]?.score),
          seo: toPercent(cats.seo?.score),
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
