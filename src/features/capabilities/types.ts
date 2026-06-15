export interface Capabilities {
  productVariants: boolean;
  tieredPricing: boolean;
  customerGroups: boolean;
  multiPriceList: boolean;
  multiCurrency: boolean;
  productAttributes: boolean;
}

export type FeatureKey = keyof Capabilities;
