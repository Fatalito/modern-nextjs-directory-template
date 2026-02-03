import fs from "node:fs";
import path from "node:path";
import type { Page, TestInfo } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { city1, city2, country1, service1 } from "./fixtures";

/**
 * Capture performance metrics for test analysis
 */
const captureMetrics = async (
  page: Page,
  testName: string,
  testInfo: TestInfo,
) => {
  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    return {
      domReady: Math.round(nav.domContentLoadedEventEnd),
      loadTime: Math.round(nav.loadEventEnd),
    };
  });
  console.log(
    `[${testName}] DOM: ${metrics.domReady}ms, Load: ${metrics.loadTime}ms`,
  );
  const outputPath = path.join(
    testInfo.project.outputDir,
    "perf-metrics.jsonl",
  );
  fs.appendFileSync(
    outputPath,
    `${JSON.stringify({
      testName,
      project: testInfo.project.name,
      domReady: metrics.domReady,
      loadTime: metrics.loadTime,
    })}\n`,
  );
};

test.describe("Directory Listings", () => {
  test("home page loads with filters and businesses", async ({
    page,
  }, testInfo) => {
    await page.goto("/");
    await captureMetrics(page, "home-page", testInfo);
    await expect(page).toHaveTitle(/Directory/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: city1.name })).toBeVisible();
  });

  test("navigate to city view", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: city1.name }).click();
    await expect(page).toHaveURL(
      new RegExp(`/${city1.country.slug}/${city1.slug}`),
    );
    await expect(
      page.getByRole("link", { name: `✓ ${city1.name}` }),
    ).toBeVisible();
  });

  test("navigate to city with service filter ", async ({ page }) => {
    await page.goto(`/${city1.country.slug}/${city1.slug}`);
    await expect(page).toHaveURL(new RegExp(`/${country1.slug}/${city1.slug}`));
    await page.getByRole("link", { name: service1.name }).click();
    await expect(page).toHaveURL(
      new RegExp(`/${country1.slug}/${city1.slug}/${service1.slug}`),
    );
  });

  test("preserve service filter when switching cities", async ({ page }) => {
    await page.goto(`/${city1.country.slug}/${city1.slug}/${service1.slug}`);
    await page.getByRole("link", { name: city2.name }).click();
    await expect(page).toHaveURL(
      new RegExp(`/${city2.country.slug}/${city2.slug}/${service1.slug}`),
    );
  });

  test("service-only page shows all locations", async ({ page }) => {
    await page.goto(`/service/${service1.slug}`);
    await expect(page.getByRole("link", { name: city1.name })).toBeVisible();
    await expect(page.getByRole("link", { name: city2.name })).toBeVisible();
  });
});
