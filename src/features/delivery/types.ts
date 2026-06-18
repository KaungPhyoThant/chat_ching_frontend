/** Delivery areas: Region → City → Township. deliveryFee is optional at each
 * level (null = inherit from parent, 0 = explicit free delivery). */

export interface Region {
  id: string;
  name: string;
  deliveryFee: number | null;
  isActive: boolean;
}

export interface City {
  id: string;
  regionId: string;
  name: string;
  deliveryFee: number | null;
  isActive: boolean;
}

export interface Township {
  id: string;
  cityId: string;
  name: string;
  deliveryFee: number | null;
  isActive: boolean;
}

export type DeliveryFeeSource = "township" | "city" | "region" | "none";

export interface DeliveryQuote {
  fee: number | null;
  source: DeliveryFeeSource;
}
