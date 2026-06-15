export type PromotionType = "PERCENT" | "FIXED";

export interface Promotion {
  id: string;
  code: string;
  type: PromotionType;
  value: number;
  minSpend?: number;
  maxUses?: number;
  usedCount: number;
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
}
