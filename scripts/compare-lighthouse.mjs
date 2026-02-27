/**
 * @file Lighthouse Score Comparison Script
 * Compares current Lighthouse scores against a committed baseline.
 * Mirrors the compare-perf.mjs pattern for Playwright timing metrics.
 */

import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const scoresPath = path.join(
  repoRoot,
  "test-results",
  "lighthouse-scores.json",
);
const baselinePath = path.join(repoRoot, "lighthouse-baseline.json");

const _parsedThreshold = Number(process.env.LIGHTHOUSE_REGRESSION_THRESHOLD);
const REGRESSION_THRESHOLD =
  Number.isFinite(_parsedThreshold) && _parsedThreshold >= 0
    ? _parsedThreshold
    : 5;
const IS_UPDATE_MODE = process.env.UPDATE_LIGHTHOUSE_BASELINE === "1";

const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];

const CATEGORY_LABELS = {
  performance: "Performance",
  accessibility: "Accessibility",
  "best-practices": "Best Practices",
  seo: "SEO",
};

const logger = {
  info: (msg) => console.log(`\x1b[34mINFO:\x1b[0m ${msg}`),
  error: (msg) => console.error(`\x1b[31mERROR:\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32mSUCCESS:\x1b[0m ${msg}`),
  raw: (msg) => console.log(msg),
  errorRaw: (msg) => console.error(msg),
};

const scoreIcon = (score) => {
  if (score >= 90) return "✅";
  if (score >= 50) return "⚠️";
  return "❌";
};

const deltaIcon = (delta) => {
  if (delta > 0) return "🚀";
  if (delta < -REGRESSION_THRESHOLD) return "❌";
  return "✅";
};

const buildScoreTableRow = (cat, baseline, current) => {
  const base = baseline[cat] ?? null;
  const curr = current[cat] ?? null;
  const label = CATEGORY_LABELS[cat];

  if (base == null || curr == null) {
    return {
      row: `| ${label} | - | ${curr ?? "-"} ${curr == null ? "" : scoreIcon(curr)} | N/A | ➖ |\n`,
      regression: null,
    };
  }

  const delta = curr - base;
  const deltaDisplay = delta > 0 ? `+${delta}` : `${delta}`;
  const regression =
    delta < -REGRESSION_THRESHOLD
      ? `${label}: ${base} → ${curr} (dropped ${Math.abs(delta)} points, threshold: ${REGRESSION_THRESHOLD})`
      : null;

  return {
    row: `| ${label} | ${base} | ${curr} ${scoreIcon(curr)} | ${deltaDisplay} | ${deltaIcon(delta)} |\n`,
    regression,
  };
};

const buildScoreTable = (baseline, current) => {
  let md = "### 🔦 Lighthouse Score Comparison\n\n";
  md += "| Category | Baseline | Current | Delta | Status |\n";
  md += "| :--- | :---: | :---: | :---: | :---- |\n";

  const regressions = [];
  for (const cat of CATEGORIES) {
    const { row, regression } = buildScoreTableRow(cat, baseline, current);
    md += row;
    if (regression) regressions.push(regression);
  }

  return { md, regressions };
};

const buildSuggestionsBlock = (suggestions) => {
  const entries = Object.entries(suggestions);
  if (entries.length === 0) return "";

  let md = "\n<details>\n<summary>💡 Audit suggestions</summary>\n\n";
  for (const [catKey, items] of entries) {
    md += `**${CATEGORY_LABELS[catKey] ?? catKey}**\n\n`;
    for (const { title, displayValue, score } of items) {
      const display = displayValue ? ` — ${displayValue}` : "";
      md += `- ${scoreIcon(score)} ${title}${display}\n`;
    }
    md += "\n";
  }
  return `${md}</details>\n`;
};

const reportRegressions = (regressions) => {
  logger.errorRaw("### ❌ Lighthouse Regressions Detected");
  logger.errorRaw("> [!CAUTION]");
  logger.errorRaw(
    "> The following scores dropped beyond the allowed threshold:",
  );
  for (const r of regressions) {
    logger.errorRaw(`- ${r}`);
  }
  process.exit(1);
};

const runComparison = () => {
  if (!fs.existsSync(scoresPath)) {
    logger.raw(
      `_Lighthouse scores not found. Run \`npm run perf:lighthouse\` first._`,
    );
    process.exit(1);
  }

  const current = JSON.parse(fs.readFileSync(scoresPath, "utf8"));

  if (IS_UPDATE_MODE) {
    fs.writeFileSync(baselinePath, `${JSON.stringify(current, null, 2)}\n`);
    logger.success("Lighthouse baseline updated.");
    process.exit(0);
  }

  if (!fs.existsSync(baselinePath)) {
    logger.raw(
      `_Lighthouse baseline not found. Run \`npm run perf:lighthouse:baseline\` to create one._`,
    );
    process.exit(1);
  }

  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  const { md: tableMd, regressions } = buildScoreTable(baseline, current);
  const suggestionsMd = buildSuggestionsBlock(current.suggestions ?? {});

  logger.raw(tableMd + suggestionsMd);

  if (regressions.length > 0) {
    reportRegressions(regressions);
  }

  logger.raw("### Lighthouse Check Passed ✅");
};

try {
  runComparison();
} catch (err) {
  const message = err?.message ?? String(err);
  logger.raw(`_Lighthouse comparison failed: ${message}_`);
  process.exit(1);
}
