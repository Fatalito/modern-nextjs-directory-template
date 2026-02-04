/**
 * @file Performance Baseline Comparison Script
 * Handles aggregation of Playwright performance metrics.
 */

import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const resultsRoot = path.join(repoRoot, "test-results");
const baselinePath = path.join(repoRoot, "perf-baseline.json");

const config = {
  threshold: Number(process.env.PERF_REGRESSION_THRESHOLD ?? 0.2),
  isUpdateMode: process.env.UPDATE_PERF_BASELINE === "1",
  metrics: (process.env.PERF_METRICS || "domReady,loadTime")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  resultsRoot,
  baselinePath,
  improvementThreshold: -0.1,
};

const logger = {
  info: (msg) => console.log(`\x1b[34mINFO:\x1b[0m ${msg}`),
  warn: (msg) => console.warn(`\x1b[33mWARN:\x1b[0m ${msg}`),
  error: (msg) => console.error(`\x1b[31mERROR:\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32mSUCCESS:\x1b[0m ${msg}`),
  raw: (msg) => console.log(msg),
  errorRaw: (msg) => console.error(msg),
};

// --- Helpers ---

/**
 * Finds all metric files in the given directory and its subdirectories.
 * @param {string} dir - The directory to search for metric files.
 * @returns {string[]} An array of file paths to metric files.
 */
const findMetricFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return findMetricFiles(fullPath);
    return entry.name === "perf-metrics.jsonl" ? [fullPath] : [];
  });
};

/**
 * Reads and parses JSONL records from a file.
 * @param {string} file - The path to the JSONL file.
 * @returns {object[]} An array of parsed JSON Objects.
 */
const readJsonlRecords = (file) =>
  fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map(JSON.parse);

/**
 * Computes the delta between baseline and current values.
 * @param {number|null} base - The baseline value.
 * @param {number|null} current - The current value.
 * @returns {{fraction: number, percent: number}|null} An object containing fraction and percent change, or null if base/current is null.
 */

const computeDelta = (base, current) => {
  if (base == null || current == null) return null;
  const fraction = (current - base) / base;
  const percent = Math.round(fraction * 1000) / 10;
  return { fraction, percent };
};

/**
 * Aggregates performance records by platform, test name and metric.
 * @param {object[]} records - The performance records to aggregate.
 * @returns {object} An object containing aggregated metrics by test name.
 */
const aggregateRecords = (records) => {
  return records.reduce((acc, rec) => {
    const { testName } = rec;
    const key = `${testName} [${rec.platform}]`;
    acc[key] = acc[key] || {};

    for (const m of config.metrics) {
      if (rec[m] != null) {
        acc[key][m] = acc[key][m] || [];
        acc[key][m].push(Number(rec[m]));
      }
    }
    return acc;
  }, {});
};

/**
 * Computes the median value of an array of numbers.
 * @param {number[]} values - The array of numbers to compute the median for.
 * @returns {number} The median value.
 */
const computeMedian = (values) => {
  if (!values || values.length === 0) return 0;

  const sortedValues = [...values].sort((a, b) => a - b);
  const middleIndex = Math.floor(sortedValues.length / 2);

  const isEvenNumberOfSamples = sortedValues.length % 2 === 0;
  const median = isEvenNumberOfSamples
    ? Math.round(
        (sortedValues[middleIndex - 1] + sortedValues[middleIndex]) / 2,
      )
    : sortedValues[middleIndex];

  return median;
};

/**
 * Computes the average metrics for each test name and metric.
 * @param {object} aggregate - The aggregated metrics by test name.
 * @returns {object} An object containing average metrics by test name.
 */
const computeAverages = (aggregate) =>
  Object.fromEntries(
    Object.entries(aggregate).map(([name, metrics]) => [
      name,
      Object.fromEntries(
        Object.entries(metrics).map(([m, values]) => [
          m,
          computeMedian(values),
        ]),
      ),
    ]),
  );

/**
 * Formats a metric comparison between baseline and current values.
 * @param {number|null} base - The baseline value.
 * @param {number|null} current - The current value.
 * @returns {object} An object containing formatted metric comparison details.
 */
const formatMetric = (base, current) => {
  const baselineDisplay = base == null ? "-" : `${base}ms`;
  const currentDisplay = current == null ? "-" : `${current}ms`;
  const delta = computeDelta(base, current);
  const deltaDisplay = delta == null ? "N/A" : `${delta.percent}%`;

  let icon = "❌";
  if (delta == null) {
    icon = "➖";
  } else if (delta?.percent <= config.improvementThreshold * 100) {
    icon = "🚀";
  } else if (delta?.percent <= config.threshold * 100) {
    icon = "✅";
  }

  return { baselineDisplay, currentDisplay, deltaDisplay, icon, delta };
};

const compareMetrics = (baseline, current) => {
  const regressions = [];

  for (const [testName, currentValues] of Object.entries(current)) {
    const baselineValues = baseline?.[testName];
    if (!baselineValues) continue;

    for (const metric of config.metrics) {
      const delta = computeDelta(baselineValues[metric], currentValues[metric]);
      const isRegression = delta && delta.fraction > config.threshold;

      if (isRegression) {
        regressions.push(
          `${testName}: ${metric} +${delta.percent}% (${baselineValues[metric]}ms → ${currentValues[metric]}ms)`,
        );
      }
    }
  }

  return regressions;
};

const generateJsonSummary = (baseline, current) => {
  const metrics = Object.fromEntries(
    Object.entries(current)
      .map(([testName, currentValues]) => {
        const metricEntries = config.metrics.reduce((acc, metric) => {
          const baseVal = baseline?.[testName]?.[metric] ?? null;
          const currVal = currentValues[metric];
          if (!baseVal || !currVal) return acc;

          const comparison = formatMetric(baseVal, currVal);
          acc[metric] = {
            baseline: baseVal,
            current: currVal,
            ...comparison,
          };
          return acc;
        }, {});

        return [testName, metricEntries];
      })
      .filter(([_, metrics]) => Object.keys(metrics).length > 0),
  );

  return {
    timestamp: new Date().toISOString(),
    thresholdPercent: config.threshold * 100,
    metrics,
  };
};

const generateMarkdownTable = (summaryJson) => {
  let table =
    "| Test Name | Metric | Baseline | Current | Delta | Status |\n| :--- | :--- | :---: | :---: | :---: | :---- |\n";
  let totalImprovement = 0,
    count = 0,
    allImproved = true;

  for (const [testName, metrics] of Object.entries(summaryJson.metrics)) {
    for (const [metricName, data] of Object.entries(metrics)) {
      const { baselineDisplay, currentDisplay, deltaDisplay, icon, delta } =
        data;

      if (delta != null) {
        if (delta.percent >= 0) allImproved = false;
        totalImprovement += delta.percent;
        count++;
      }
      table += `| ${testName} | ${metricName} | ${baselineDisplay} | ${currentDisplay} | ${deltaDisplay} | ${icon} |\n`;
    }
  }

  const avgDelta = count > 0 ? (totalImprovement / count).toFixed(1) : 0;
  const summaryText =
    avgDelta < 0
      ? `**Overall: Improvement of ${Math.abs(avgDelta)}%**`
      : `**Overall: Regression of ${avgDelta}%**`;

  return {
    report: `${summaryText}\n\n${table}`,
    allImproved: allImproved && count > 0,
  };
};

/**
 * Main function to run performance comparison.
 */
const runPerformanceComparison = () => {
  const metricFiles = findMetricFiles(resultsRoot);
  if (metricFiles.length === 0) {
    logger.warn(
      "No metrics found. Ensure Playwright tests have been executed to generate current metrics and baseline is present.",
    );
    process.exit(0);
  }

  const records = metricFiles.flatMap(readJsonlRecords);
  const currentMetrics = computeAverages(aggregateRecords(records));

  if (config.isUpdateMode) {
    fs.writeFileSync(
      baselinePath,
      `${JSON.stringify(currentMetrics, null, 2)}\n`,
    );
    logger.success("Baseline updated.");
    process.exit(0);
  }

  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  const regressions = compareMetrics(baseline, currentMetrics);
  const jsonSummary = generateJsonSummary(baseline, currentMetrics);
  fs.writeFileSync(
    path.join(resultsRoot, "perf-summary.json"),
    JSON.stringify(jsonSummary, null, 2),
  );
  const { report, allImproved } = generateMarkdownTable(jsonSummary);
  logger.raw(report);
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `\n## Perf Summary\n\n${report}\n`,
    );
  }
  if (regressions.length > 0) {
    logger.error("Regressions detected!");
    regressions.forEach((r) => {
      logger.errorRaw(`  - ${r}`);
    });
    process.exit(1);
  }
  logger.success(allImproved ? "All improved! 🚀" : "Pass.");
};

// ✅ Only run this if the script is executed directly
if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("compare-perf.mjs")
) {
  try {
    runPerformanceComparison();
  } catch (err) {
    logger.error(`Script failed: ${err.message}`);
    process.exit(1);
  }
}

export {
  computeDelta,
  computeMedian,
  formatMetric,
  compareMetrics,
  generateJsonSummary,
};
