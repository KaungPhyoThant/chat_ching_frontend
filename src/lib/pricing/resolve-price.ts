import type { Capabilities } from "@/features/capabilities/types";
import type { ProductVariant } from "@/features/products/types";
import type { CurrencyCode, PriceList, PriceTier } from "@/features/pricing/types";

export interface ResolvePriceInput {
  variant: ProductVariant;
  quantity: number;
  features: Capabilities;
  customerGroupId?: string | null;
  currency?: CurrencyCode;
  priceLists?: PriceList[];
}

export interface ResolvedPrice {
  unitPrice: number;
  currency: CurrencyCode;
  appliedTier?: PriceTier;
  priceListId?: string;
  source: "variant" | "price-list";
}

const BASE_CURRENCY: CurrencyCode = "MMK";

function bestTier(tiers: PriceTier[], quantity: number): PriceTier | undefined {
  return tiers
    .filter((t) => quantity >= t.minQty)
    .sort((a, b) => b.minQty - a.minQty)[0];
}

/**
 * Pure pricing engine. Each rule is gated by its capability flag; with all flags
 * off it returns the variant's base price. Resolution order:
 * group → currency → price list → volume tier.
 */
export function resolvePrice(input: ResolvePriceInput): ResolvedPrice {
  const { variant, quantity, features } = input;
  const currency = features.multiCurrency ? (input.currency ?? BASE_CURRENCY) : BASE_CURRENCY;

  let price = variant.price;
  let tiers = variant.tiers;
  let priceListId: string | undefined;
  let source: ResolvedPrice["source"] = "variant";

  if (features.multiPriceList) {
    const group = features.customerGroups ? (input.customerGroupId ?? null) : null;
    const candidates = (input.priceLists ?? [])
      .filter((pl) => pl.isActive && pl.currency === currency)
      .filter((pl) => pl.customerGroupId === group || pl.customerGroupId === null)
      .sort((a, b) => b.priority - a.priority);
    for (const pl of candidates) {
      const item = pl.items.find((it) => it.variantId === variant.id);
      if (item) {
        price = item.price;
        tiers = item.tiers;
        priceListId = pl.id;
        source = "price-list";
        break;
      }
    }
  }

  let appliedTier: PriceTier | undefined;
  if (features.tieredPricing) {
    appliedTier = bestTier(tiers, quantity);
    if (appliedTier) price = appliedTier.price;
  }

  return { unitPrice: price, currency, appliedTier, priceListId, source };
}
