import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { PAGES } from "./pages";

// Resolución 001-2025-PCM/SGTD: las entidades públicas peruanas deben cumplir WCAG 2.2.
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

for (const { path } of PAGES) {
  test(`${path} cumple WCAG 2.2 AA (axe)`, async ({ page }) => {
    await page.goto(path);
    // sin JS hidratado los bloques con entrada animada siguen en opacidad 0
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(400);
    // axe mide colores reales: espera a que terminen las transiciones finitas (fundidos de entrada)
    // (las ligadas al scroll o infinitas no terminan nunca, se ignoran)
    await page
      .waitForFunction(
        () =>
          document
            .getAnimations()
            .every(
              (a) =>
                a.playState !== "running" || !(a.timeline instanceof DocumentTimeline) || a.effect?.getTiming().iterations === Infinity,
            ),
        undefined,
        { timeout: 8000 },
      )
      .catch(() => {});
    const results = await new AxeBuilder({ page })
      .withTags(TAGS)
      // los mosaicos del mapa base son de terceros
      .exclude(".leaflet-tile-pane")
      .analyze();
    const blocking = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    const summary = blocking.map(
      (v) =>
        `${v.id} (${v.impact}): ${v.nodes
          .map((n) => n.target.join(" "))
          .slice(0, 3)
          .join(" | ")}`,
    );
    expect(summary, summary.join("\n")).toEqual([]);
  });
}
