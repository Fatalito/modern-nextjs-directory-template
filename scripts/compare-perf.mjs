import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const resultsRoot = path.join(repoRoot, "test-results");
const baselinePath = path.join(repoRoot, "perf-baseline.json");
const threshold = Number(process.env.PERF_REGRESSION_THRESHOLD ?? 0.2);
const updateBaseline = process.env.UPDATE_PERF_BASELINE === "1";

const findMetricFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return findMetricFiles(fullPath);
    return entry.name === "perf-metrics.jsonl" ? [fullPath] : [];
  });
};

const metricFiles = findMetricFiles(resultsRoot);
if (metricFiles.length === 0) {
  console.log("No perf-metrics.jsonl files found. Skipping regression check.");
  process.exit(0);
}

const records = metricFiles.flatMap((file) => {
  const lines = fs.readFileSync(file, "utf8").split("\n").filter(Boolean);
  return lines.map((line) => JSON.parse(line));
});

const aggregate = records.reduce((acc, record) => {
  const entry = acc[record.testName] ?? { domReady: 0, loadTime: 0, count: 0 };
  entry.domReady += record.domReady;
  entry.loadTime += record.loadTime;
  entry.count += 1;
  acc[record.testName] = entry;
  return acc;
}, {});

const current = Object.fromEntries(
  Object.entries(aggregate).map(([testName, stats]) => [
    testName,
    {
      domReady: Math.round(stats.domReady / stats.count),
      loadTime: Math.round(stats.loadTime / stats.count),
    },
  ]),
);

if (!fs.existsSync(baselinePath)) {
  console.warn("Baseline file not found. Skipping regression check.");
  if (!process.env.CI && updateBaseline) {
    fs.writeFileSync(baselinePath, `${JSON.stringify(current, null, 2)}\n`);
    console.log("Baseline created at perf-baseline.json");
  }
  process.exit(0);
}

const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
if (!process.env.CI && updateBaseline) {
  fs.writeFileSync(baselinePath, `${JSON.stringify(current, null, 2)}\n`);
  console.log("Baseline updated at perf-baseline.json");
  process.exit(0);
}
const regressions = [];

for (const [testName, baselineMetrics] of Object.entries(baseline)) {
  if (!baselineMetrics) continue;
  const currentMetrics = current[testName];
  if (!currentMetrics) continue;

  for (const metric of ["domReady", "loadTime"]) {
    const baseValue = baselineMetrics[metric];
    if (baseValue === null || baseValue === undefined) continue;
    const currentValue = currentMetrics[metric];
    const delta = (currentValue - baseValue) / baseValue;
    if (delta > threshold) {
      regressions.push(
        `${testName} ${metric} regressed by ${(delta * 100).toFixed(1)}% (baseline ${baseValue}ms → current ${currentValue}ms)`,
      );
    }
  }
}

if (regressions.length > 0) {
  console.error("Performance regressions detected:");
  regressions.forEach((line) => {
    console.error(`- ${line}`);
  });
  process.exit(1);
}

console.log("Performance regression check passed.");
