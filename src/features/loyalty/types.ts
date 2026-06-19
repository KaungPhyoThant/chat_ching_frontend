export type LoyaltyTxnType = "EARN" | "REDEEM" | "ADJUST";

export interface LoyaltyTransaction {
  id: string;
  type: LoyaltyTxnType;
  points: number;
  note: string | null;
  orderNo: string | null;
  createdAt: string;
}

export interface LoyaltyHistory {
  balance: number;
  transactions: LoyaltyTransaction[];
}
