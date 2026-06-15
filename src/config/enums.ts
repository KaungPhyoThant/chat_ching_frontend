/**
 * Frontend mirrors of backend enums + display metadata (label i18n key + AntD tag color).
 * Keeps status badges / tags consistent everywhere.
 */

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PAID"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

export type PaymentMethod = "KBZPAY" | "WAVEPAY" | "BANK_TRANSFER" | "COD";

interface EnumMeta {
  /** i18n key (namespace-qualified, e.g. "orderStatus.pending") */
  labelKey: string;
  /** AntD Tag color */
  color: string;
}

export const ORDER_STATUS: Record<OrderStatus, EnumMeta> = {
  PENDING: { labelKey: "orderStatus.pending", color: "default" },
  CONFIRMED: { labelKey: "orderStatus.confirmed", color: "blue" },
  PAID: { labelKey: "orderStatus.paid", color: "cyan" },
  PACKED: { labelKey: "orderStatus.packed", color: "geekblue" },
  SHIPPED: { labelKey: "orderStatus.shipped", color: "purple" },
  DELIVERED: { labelKey: "orderStatus.delivered", color: "green" },
  CANCELLED: { labelKey: "orderStatus.cancelled", color: "red" },
  REFUNDED: { labelKey: "orderStatus.refunded", color: "orange" },
};

export const PAYMENT_STATUS: Record<PaymentStatus, EnumMeta> = {
  PENDING: { labelKey: "paymentStatus.pending", color: "default" },
  SUCCESS: { labelKey: "paymentStatus.success", color: "green" },
  FAILED: { labelKey: "paymentStatus.failed", color: "red" },
  REFUNDED: { labelKey: "paymentStatus.refunded", color: "orange" },
};

export const PAYMENT_METHOD: Record<PaymentMethod, EnumMeta> = {
  KBZPAY: { labelKey: "paymentMethod.kbzpay", color: "blue" },
  WAVEPAY: { labelKey: "paymentMethod.wavepay", color: "gold" },
  BANK_TRANSFER: { labelKey: "paymentMethod.bankTransfer", color: "geekblue" },
  COD: { labelKey: "paymentMethod.cod", color: "default" },
};

export function getOrderStatusMeta(status?: OrderStatus): EnumMeta | undefined {
  return status ? ORDER_STATUS[status] : undefined;
}

export function getPaymentStatusMeta(
  status?: PaymentStatus,
): EnumMeta | undefined {
  return status ? PAYMENT_STATUS[status] : undefined;
}
