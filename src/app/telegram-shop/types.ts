export interface OptionValue {
  id: string;
  value: string;
}

export interface OptionType {
  id: string;
  name: string;
  level: number;
  values: OptionValue[];
}

export interface PriceTier {
  minQty: number;
  price: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  stock: number;
  isActive: boolean;
  optionValueIds: string[];
  tiers?: PriceTier[];
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: { name: string };
  images?: string[];
  hasVariants?: boolean;
  variants?: ProductVariant[];
  optionTypes?: OptionType[];
}

export interface Township {
  id: string;
  name: string;
  deliveryFee: number | null;
}

export interface City {
  id: string;
  name: string;
  deliveryFee: number | null;
  townships: Township[];
}

export interface Region {
  id: string;
  name: string;
  deliveryFee: number | null;
  cities: City[];
}

export interface CartItem extends Product {
  quantity: number;
  variantId?: string;
  variantLabel?: string;
}

export interface PaymentAccount {
  id: string;
  method: string;
  name: string;
  phone?: string | null;
  accountNumber?: string | null;
  bankName?: string | null;
  qrImage?: string | null;
  description?: string | null;
}

export interface OrderHistoryEntry {
  orderNo: string;
  status: string;
  subtotal?: number;
  total: number;
  shippingAddress?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt: string;
  items: { name: string; quantity: number; unitPrice?: number; total: number }[];
}

export interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  initData: string;
  initDataUnsafe?: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
  };
  openLink?: (url: string, options?: { try_instant_view?: boolean }) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}
