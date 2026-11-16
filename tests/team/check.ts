// Shared checks for every Team fixture spec (OS-22 merged the per-ticket copies).
import { expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

export const shooter =
  (ticket: string) => (page: Page, name: string, project: string) =>
    page.screenshot({
      path: `output/playwright/${ticket}/${name}-${project}.png`,
      fullPage: true,
    });

// Known app-wide contrast bugs live in globals.css (see docs/TASKS.md); callers name them so the rest of
// the page is still checked: `contrastExclude` skips those selectors, `contrastOnly` checks only the given regions.
export async function checkPage(
  page: Page,
  opts: { contrastExclude?: string[]; contrastOnly?: string[] } = {},
) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const split = !!(opts.contrastExclude || opts.contrastOnly);
  const all = new AxeBuilder({ page }).withTags([
    "wcag2a",
    "wcag2aa",
    "wcag21aa",
  ]);
  if (split) all.disableRules(["color-contrast"]);
  const violations = (await all.analyze()).violations;
  if (split) {
    const contrast = new AxeBuilder({ page }).withRules(["color-contrast"]);
    opts.contrastExclude?.forEach((s) => contrast.exclude(s));
    opts.contrastOnly?.forEach((s) => contrast.include(s));
    violations.push(...(await contrast.analyze()).violations);
  }
  expect(violations.map((v) => v.id)).toEqual([]);
}
