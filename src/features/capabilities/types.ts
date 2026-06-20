export interface Capabilities {
  productVariants: boolean;
  tieredPricing: boolean;
  customerGroups: boolean;
  multiPriceList: boolean;
  multiCurrency: boolean;
  productAttributes: boolean;
  imageSearch: boolean;
}

export type FeatureKey = keyof Capabilities;
