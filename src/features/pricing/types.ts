export type CurrencyCode = "MMK" | "USD" | "THB";

export interface CustomerGroup {
  id: string;
  code: string;
  name: string;
  isDefault: boolean;
}

export interface PriceTier {
  id: string;
  minQty: number;
  price: number;
}

export interface PriceListItem {
  id: string;
  priceListId: string;
  variantId: string;
  price: number;
  tiers: PriceTier[];
}

export interface PriceList {
  id: string;
  name: string;
  currency: CurrencyCode;
  customerGroupId: string | null;
  isDefault: boolean;
  priority: number;
  isActive: boolean;
  items: PriceListItem[];
}
