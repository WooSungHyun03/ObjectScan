import { expect, test } from "vitest";
import {
  applyLocalFilters,
  filtersQuery,
  readFilters,
  defaults,
} from "@/features/marketplace/filters";
import type { Listing } from "@/features/marketplace/asset-card";
const l = (id: string, price: number, license: string) =>
  ({
    id,
    price,
    license,
    title: id,
    description: "",
    category: "objects",
    currency: "KRW",
  }) as Listing;
const list = [
  l("free-cc0", 0, "cc0-1.0"),
  l("std-5k", 5000, "standard"),
  l("std-10k", 10000, "standard"),
  l("by-20k", 20000, "cc-by-4.0"),
];
test("market filters: URL roundtrip, unknown values, license and price bands", () => {
  const f = {
    q: "의자",
    category: "furniture",
    sort: "price",
    license: "standard",
    price: "under10k",
  };
  expect(readFilters(new URLSearchParams(filtersQuery(f)))).toEqual(f);
  expect(filtersQuery(defaults)).toBe("");
  expect(
    readFilters(
      new URLSearchParams("category=<x>&sort=drop&license=gpl&price=9"),
    ),
  ).toEqual(defaults);
  const ids = (p: Partial<typeof f>) =>
    applyLocalFilters(list, { ...defaults, ...p }).map((x) => x.id);
  expect(ids({})).toEqual(list.map((x) => x.id));
  expect(ids({ price: "free" })).toEqual(["free-cc0"]);
  expect(ids({ price: "under10k" })).toEqual(["std-5k", "std-10k"]);
  expect(ids({ price: "over10k" })).toEqual(["by-20k"]);
  expect(ids({ license: "standard", price: "under10k" })).toEqual([
    "std-5k",
    "std-10k",
  ]);
  expect(ids({ license: "cc0-1.0", price: "over10k" })).toEqual([]);
});
