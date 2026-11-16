// Shared checks for every Team fixture spec (OS-22 merged the per-ticket copies).
import { expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

export const shooter =
  (ticket: string) => (page: Page, name: string, project: string) =>
    page.screenshot({
      path: `${process.env.OBJECTSCAN_SCREENSHOT_ROOT ?? "output/playwright"}/${ticket}/${name}-${project}.png`,
      fullPage: true,
      animations: "disabled",
    });

// Audit the entire rendered fixture, including contrast: no selector exclusions.
export async function checkPage(page: Page) {
  // Audit settled colors, not a frame halfway through a finite CSS transition.
  // Infinite spinners remain visible and are still audited.
  await page.evaluate(async () => {
    await Promise.all(
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation.effect?.getComputedTiming().iterations !== Infinity,
        )
        .map((animation) => animation.finished.catch(() => undefined)),
    );
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const violations = (
    await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze()
  ).violations;
  expect(
    violations.map((v) => ({
      id: v.id,
      targets: v.nodes.map((n) => n.target),
      details: v.nodes.map((n) => n.failureSummary),
    })),
  ).toEqual([]);
}
