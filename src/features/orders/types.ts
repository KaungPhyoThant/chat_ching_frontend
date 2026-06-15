import type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/config/enums";

export type { OrderStatus, PaymentMethod, PaymentStatus };

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderPayment {
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  transactionRef?: string;
  paidAt?: string;
}

export interface OrderEvent {
  status: OrderStatus;
  at: string;
}

export interface Order {
  id: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  promotionCode?: string;
  shippingAddress?: string;
  createdAt: string;
  items: OrderItem[];
  payment: OrderPayment;
  timeline: OrderEvent[];
}
