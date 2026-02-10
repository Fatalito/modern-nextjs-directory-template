import lighthouse from "lighthouse";
import { chromium } from "playwright";

const DEFAULT_CHROME_PORT = 9222;
const CHROME_DEBUG_PORT =
  Number(process.env.CHROME_DEBUG_PORT) || DEFAULT_CHROME_PORT;

async function run() {
  const browser = await chromium.launch({
    args: [`--remote-debugging-port=${CHROME_DEBUG_PORT}`],
  });

  try {
    const { lhr } = await lighthouse("http://127.0.0.1:3000", {
      port: 9222,
      output: "json",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      maxWaitForLoad: 30000,
    });

    const toPercent = (score) =>
      typeof score === "number" ? Math.round(score * 100) : 0;

    // 1. Get Scores
    const cats = lhr.categories;
    const scores = [
      { name: "Performance", score: toPercent(cats.performance?.score) },
      { name: "Accessibility", score: toPercent(cats.accessibility?.score) },
      {
        name: "Best Practices",
        score: toPercent(cats["best-practices"]?.score),
      },
      { name: "SEO", score: toPercent(cats.seo?.score) },
    ];

    // 2. Get Top 3 Recommendations (Opportunities)
    const opportunities = Object.values(lhr.audits)
      .filter(
        (audit) =>
          audit.details &&
          audit.details.type === "opportunity" &&
          typeof audit.score === "number" &&
          audit.score < 1,
      )
      .sort(
        (a, b) =>
          (b.details.overallSavingsMs || 0) - (a.details.overallSavingsMs || 0),
      )
      .slice(0, 3);

    // 3. Build Markdown
    console.log(`### 🔦 Lighthouse Audit\n`);
    console.log(`| Category | Score |`);
    console.log(`| :--- | :---: |`);
    scores.forEach((s) => {
      const icon = s.score >= 90 ? "✅" : "⚠️";
      console.log(`| ${s.name} | ${s.score} ${icon} |`);
    });

    if (opportunities.length > 0) {
      console.log(
        `\n<details><summary>💡 <b>Opportunities to Improve</b></summary>\n`,
      );
      opportunities.forEach((opp) => {
        const savings = Math.round(opp.details.overallSavingsMs || 0);
        const savingsText = savings > 0 ? ` (Est. Savings: ${savings}ms)` : "";

        console.log(
          `- **${opp.title}**: ${opp.description.split("[")[0]}${savingsText}`,
        );
      });
      console.log(`\n</details>`);
    }
    console.log(`\n---\n`);
  } catch (error) {
    console.error("❌ Lighthouse Audit Failed:", error);
    process.exitCode = 1;
  } finally {
    await browser.close();
    console.log("Cleanup: Browser process closed.");
  }
}

await run();
