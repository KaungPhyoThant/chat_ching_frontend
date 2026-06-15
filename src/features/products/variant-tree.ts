import type { ProductOptionType, ProductOptionValue, ProductVariant } from "./types";

export interface VariantNode {
  optionValueId: string;
  label: string;
  level: number;
  children: VariantNode[];
  variant?: ProductVariant; // present at the leaf level
}

function valueLabel(optionTypes: ProductOptionType[], id: string): string {
  for (const ot of optionTypes) {
    const v = ot.values.find((x: ProductOptionValue) => x.id === id);
    if (v) return v.value;
  }
  return id;
}

/**
 * Build a sparse, level-ordered tree from variants' optionValueIds. Children
 * can differ per parent (e.g. Red → S,M while Blue → M,L,XL). The leaf node
 * carries the variant (price/stock live there).
 */
export function buildVariantTree(
  optionTypes: ProductOptionType[],
  variants: ProductVariant[],
): VariantNode[] {
  const roots: VariantNode[] = [];

  for (const variant of variants) {
    let siblings = roots;
    variant.optionValueIds.forEach((ovId, depth) => {
      let node = siblings.find((n) => n.optionValueId === ovId);
      if (!node) {
        node = {
          optionValueId: ovId,
          label: valueLabel(optionTypes, ovId),
          level: depth + 1,
          children: [],
        };
        siblings.push(node);
      }
      const isLeaf = depth === variant.optionValueIds.length - 1;
      if (isLeaf) node.variant = variant;
      siblings = node.children;
    });
  }

  return roots;
}
