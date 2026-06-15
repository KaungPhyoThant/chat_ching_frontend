import { describe, expect, it } from "vitest";
import { resolvePrice } from "./resolve-price";
import { FEATURE_DEFAULTS } from "@/config/feature-defaults";
import type { ProductVariant } from "@/features/products/types";
import type { PriceList } from "@/features/pricing/types";

const variant: ProductVariant = {
  id: "var_1",
  productId: "prd_1",
  sku: "S1",
  optionValueIds: [],
  price: 10_000,
  stock: 5,
  isActive: true,
  tiers: [
    { id: "t1", minQty: 10, price: 9_000 },
    { id: "t2", minQty: 20, price: 8_000 },
  ],
};

const wholesaleList: PriceList = {
  id: "pl_ws",
  name: "Wholesale",
  currency: "MMK",
  customerGroupId: "grp_wholesale",
  isDefault: false,
  priority: 10,
  isActive: true,
  items: [
    {
      id: "pli1",
      priceListId: "pl_ws",
      variantId: "var_1",
      price: 7_000,
      tiers: [{ id: "wt1", minQty: 50, price: 6_000 }],
    },
  ],
};

describe("resolvePrice", () => {
  it("returns base variant price when all flags are off", () => {
    const r = resolvePrice({ variant, quantity: 100, features: FEATURE_DEFAULTS, priceLists: [wholesaleList] });
    expect(r.unitPrice).toBe(10_000);
    expect(r.currency).toBe("MMK");
  });

  it("applies a volume tier when tieredPricing is on", () => {
    const r = resolvePrice({ variant, quantity: 20, features: { ...FEATURE_DEFAULTS, tieredPricing: true } });
    expect(r.unitPrice).toBe(8_000);
    expect(r.appliedTier?.minQty).toBe(20);
  });

  it("ignores tiers below the quantity threshold", () => {
    const r = resolvePrice({ variant, quantity: 5, features: { ...FEATURE_DEFAULTS, tieredPricing: true } });
    expect(r.unitPrice).toBe(10_000);
  });

  it("uses a wholesale price list for a wholesale customer when multiPriceList + customerGroups on", () => {
    const r = resolvePrice({
      variant,
      quantity: 1,
      customerGroupId: "grp_wholesale",
      features: { ...FEATURE_DEFAULTS, multiPriceList: true, customerGroups: true },
      priceLists: [wholesaleList],
    });
    expect(r.unitPrice).toBe(7_000);
    expect(r.priceListId).toBe("pl_ws");
  });

  it("applies list-specific tiers over base tiers", () => {
    const r = resolvePrice({
      variant,
      quantity: 50,
      customerGroupId: "grp_wholesale",
      features: { ...FEATURE_DEFAULTS, multiPriceList: true, customerGroups: true, tieredPricing: true },
      priceLists: [wholesaleList],
    });
    expect(r.unitPrice).toBe(6_000);
  });
});
