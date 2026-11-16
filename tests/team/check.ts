// Shared checks for every Team fixture spec (OS-22 merged the per-ticket copies).
import { expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

export const shooter =
  (ticket: string) => (page: Page, name: string, project: string) =>
    page.screenshot({
      path: `${process.env.OBJECTSCAN_SCREENSHOT_ROOT ?? "output/playwright"}/${ticket}/${name}-${project}.png`,
      fullPage: true,
    });

// Audit the entire rendered fixture, including contrast: no selector exclusions.
export async function checkPage(page: Page) {
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
