import { Product, ProductVariant, CartItem } from "./types";

export const lineKey = (i: { id: string; variantId?: string }) => i.variantId ?? i.id;

export const lineUnit = (item: CartItem): { base: number; unit: number; discounted: boolean } => {
  const variant =
    item.variants?.find((v) => v.id === item.variantId) ?? item.variants?.[0];
  const base = variant?.price ?? item.price;
  let unit = base;
  let bestMin = -1;
  for (const t of variant?.tiers ?? []) {
    if (item.quantity >= t.minQty && t.minQty > bestMin) {
      bestMin = t.minQty;
      unit = t.price;
    }
  }
  return { base, unit, discounted: unit < base };
};

export interface VariantOption {
  id: string;
  name: string;
  idx: number;
  choices: { tok: string; label: string }[];
}

export const variantOptions = (p: Product): VariantOption[] => {
  const types = [...(p.optionTypes ?? [])].sort((a, b) => a.level - b.level);
  const vars = (p.variants ?? []).filter((v) => v.isActive);
  return types
    .map((ot, idx) => {
      const tokens = Array.from(
        new Set(vars.map((v) => v.optionValueIds[idx]).filter(Boolean)),
      );
      return {
        id: ot.id,
        name: ot.name,
        idx,
        choices: tokens.map((tok) => ({
          tok,
          label: ot.values?.find((val) => val.id === tok)?.value ?? tok,
        })),
      };
    })
    .filter((o) => o.choices.length > 0);
};

export const hasVariantChoice = (p: Product) =>
  variantOptions(p).length > 0 &&
  (p.variants?.filter((v) => v.isActive).length ?? 0) > 0;

export const matchVariant = (
  p: Product,
  picks: Record<string, string>,
): ProductVariant | null => {
  const opts = variantOptions(p);
  const wanted = opts.map((o) => picks[o.id]);
  if (wanted.some((w) => !w)) return null;
  return (
    (p.variants ?? []).find(
      (v) => v.isActive && opts.every((o, i) => v.optionValueIds[o.idx] === wanted[i]),
    ) ?? null
  );
};

export const valueAvailable = (
  p: Product,
  opts: VariantOption[],
  opt: VariantOption,
  tok: string,
  picks: Record<string, string>,
) =>
  (p.variants ?? []).some(
    (v) =>
      v.isActive &&
      v.optionValueIds[opt.idx] === tok &&
      opts.every(
        (o) =>
          o.id === opt.id ||
          !picks[o.id] ||
          v.optionValueIds[o.idx] === picks[o.id],
      ),
  );

export const variantLabelOf = (p: Product, picks: Record<string, string>) =>
  variantOptions(p)
    .map((o) => o.choices.find((c) => c.tok === picks[o.id])?.label)
    .filter(Boolean)
    .join(" / ");
export type Lang = "en" | "my";
