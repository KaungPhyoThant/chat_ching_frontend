export type PaymentMethodCode = "KBZPAY" | "WAVEPAY" | "BANK_TRANSFER" | "COD";

export interface PaymentAccount {
  id: string;
  method: PaymentMethodCode;
  name: string;
  phone: string | null;
  accountNumber: string | null;
  bankName: string | null;
  qrImage: string | null;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
}

export const PAYMENT_METHODS: { value: PaymentMethodCode; label: string }[] = [
  { value: "KBZPAY", label: "KBZPay" },
  { value: "WAVEPAY", label: "Wave Pay" },
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "COD", label: "Cash on delivery" },
];
