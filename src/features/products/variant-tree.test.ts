import { describe, expect, it } from "vitest";
import { buildVariantTree } from "./variant-tree";
import type { ProductOptionType, ProductVariant } from "./types";

const optionTypes: ProductOptionType[] = [
  {
    id: "ot_color",
    name: "Color",
    level: 1,
    sortOrder: 1,
    values: [
      { id: "ov_red", optionTypeId: "ot_color", value: "Red", sortOrder: 1 },
      { id: "ov_blue", optionTypeId: "ot_color", value: "Blue", sortOrder: 2 },
    ],
  },
  {
    id: "ot_size",
    name: "Size",
    level: 2,
    sortOrder: 2,
    values: [
      { id: "ov_s", optionTypeId: "ot_size", value: "S", sortOrder: 1 },
      { id: "ov_m", optionTypeId: "ot_size", value: "M", sortOrder: 2 },
    ],
  },
];

const variants: ProductVariant[] = [
  { id: "v1", productId: "p", sku: "RS", optionValueIds: ["ov_red", "ov_s"], price: 1, stock: 1, isActive: true, tiers: [] },
  { id: "v2", productId: "p", sku: "BM", optionValueIds: ["ov_blue", "ov_m"], price: 1, stock: 1, isActive: true, tiers: [] },
];

describe("buildVariantTree", () => {
  it("groups variants into a level-ordered tree (sparse children allowed)", () => {
    const tree = buildVariantTree(optionTypes, variants);
    expect(tree.map((n) => n.label)).toEqual(["Red", "Blue"]);
    const red = tree.find((n) => n.label === "Red")!;
    expect(red.children.map((c) => c.label)).toEqual(["S"]); // only S exists under Red
    expect(red.children[0].variant?.id).toBe("v1");
  });
});
