import { describe, expect, it } from "vitest";
import {
  compareMetrics,
  computeDelta,
  computeMedian,
  formatMetric,
  generateJsonSummary,
} from "./compare-perf.mjs";

describe("Compare Performance Script ", () => {
  describe("Mathematical Utilities", () => {
    it.each([
      { base: null, current: 100, expected: null, label: "missing base" },
      {
        base: 100,
        current: 110,
        expected: { fraction: 0.1, percent: 10 },
        label: "standard increase",
      },
      {
        base: 100,
        current: 80,
        expected: { fraction: -0.2, percent: -20 },
        label: "improvement",
      },
      {
        base: 0,
        current: 50,
        expected: { fraction: Infinity, percent: Infinity },
        label: "zero base",
      },
    ])("computeDelta: $label", ({ base, current, expected }) => {
      expect(computeDelta(base, current)).toEqual(expected);
    });

    it("computeMedian: handles even/odd sets and squashes variance", () => {
      // Odd set: picks middle after sort [100, 105, 800]
      expect(computeMedian([100, 800, 105])).toBe(105);

      // Even set: averages middle two after sort [100, 110, 120, 800] -> (110+120)/2
      expect(computeMedian([100, 110, 120, 800])).toBe(115);

      // Extreme outlier resilience
      expect(computeMedian([100, 5000, 105])).toBe(105);
    });
  });

  describe("Reporting & CI Output", () => {
    it("formatMetric: correctly categorises performance shifts", () => {
      // Logic: < -10% = 🚀, < 20% = ✅, > 20% = ❌, else = ➖
      expect(formatMetric(100, 80).icon).toBe("🚀"); // -20%
      expect(formatMetric(100, 105).icon).toBe("✅"); // +5%
      expect(formatMetric(100, 120).icon).toBe("✅"); // +20% (on threshold)
      expect(formatMetric(100, 121).icon).toBe("❌"); // +21% (over threshold)

      const missing = formatMetric(null, 110);
      expect(missing.deltaDisplay).toBe("N/A");
      expect(missing.icon).toBe("➖");
    });

    it("compareMetrics: filters regressions and ignores noise", () => {
      const baseline = { listing: { domReady: 100 } };
      const current = {
        listing: { domReady: 130 },
        home: { unknownMetric: 999 },
      };

      const regs = compareMetrics(baseline, current);
      expect(regs).toHaveLength(1);
      expect(regs[0]).toBe("listing: domReady +30% (100ms → 130ms)");
    });

    it("generateJsonSummary: produces valid schema and handles new features", () => {
      const baseline = { home: { domReady: 100 } };
      const current = {
        home: { domReady: 110 },
        "new-city-filter": { domReady: 150 },
      };

      const json = generateJsonSummary(baseline, current);

      expect(json).toHaveProperty("timestamp");
      expect(json.metrics.home.domReady.delta.percent).toBe(10);
      expect(json.metrics["new-city-filter"]).toBe(undefined);
    });
  });
});
