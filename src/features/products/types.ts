import type { CurrencyCode, PriceTier } from "@/features/pricing/types";

export interface ProductOptionValue {
  id: string;
  optionTypeId: string;
  value: string;
  sortOrder: number;
}

export interface ProductOptionType {
  id: string;
  name: string;
  /** 1..3 — the tree depth/order for this product */
  level: number;
  sortOrder: number;
  values: ProductOptionValue[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  /** one option value per used level, ordered by level */
  optionValueIds: string[];
  price: number;
  stock: number;
  image?: string;
  isActive: boolean;
  /** base-price volume tiers (used when no price-list override applies) */
  tiers: PriceTier[];
}

export interface Product {
  id: string;
  categoryId: string;
  categoryName: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  images: string[];
  isActive: boolean;
  createdAt: string;
  hasVariants: boolean;
  baseCurrency: CurrencyCode;
  optionTypes: ProductOptionType[];
  variants: ProductVariant[];
  attributes?: Record<string, string>;
}
