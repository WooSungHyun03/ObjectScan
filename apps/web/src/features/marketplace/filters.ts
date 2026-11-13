import type { Listing } from "./asset-card";
import { licenseLabels } from "./presentation";
// Market search state kept in the URL so back navigation restores it.
// q/category/sort go to the existing API; license/price filter the loaded list only.
export type MarketFilters = {
  q: string;
  category: string;
  sort: string;
  license: string;
  price: string;
};
export const categories = [
  "all",
  "objects",
  "scenes",
  "furniture",
  "decor",
  "other",
];
export const sorts = ["recent", "price"];
export const priceBands: Record<string, string> = {
  all: "모든 가격",
  free: "무료",
  under10k: "1만원 이하",
  over10k: "1만원 초과",
};
export const defaults: MarketFilters = {
  q: "",
  category: "all",
  sort: "recent",
  license: "all",
  price: "all",
};
const pick = (v: string | null, allowed: string[], fallback: string) =>
  v && allowed.includes(v) ? v : fallback;

// URL values are user input: unknown values fall back to defaults.
export function readFilters(p: URLSearchParams): MarketFilters {
  return {
    q: (p.get("q") ?? "").slice(0, 100),
    category: pick(p.get("category"), categories, "all"),
    sort: pick(p.get("sort"), sorts, "recent"),
    license: pick(
      p.get("license"),
      ["all", ...Object.keys(licenseLabels)],
      "all",
    ),
    price: pick(p.get("price"), Object.keys(priceBands), "all"),
  };
}
export function filtersQuery(f: MarketFilters) {
  const p = new URLSearchParams();
  for (const k of Object.keys(defaults) as (keyof MarketFilters)[])
    if (f[k] !== defaults[k]) p.set(k, f[k]);
  const s = p.toString();
  return s ? `?${s}` : "";
}
const inBand = (price: number, band: string) =>
  band === "free"
    ? price === 0
    : band === "under10k"
      ? price > 0 && price <= 10000
      : band === "over10k"
        ? price > 10000
        : true;
export function applyLocalFilters(list: Listing[], f: MarketFilters) {
  return list.filter(
    (l) =>
      (f.license === "all" || l.license === f.license) &&
      inBand(l.price, f.price),
  );
}
export const hasLocalFilters = (f: MarketFilters) =>
  f.license !== "all" || f.price !== "all";
