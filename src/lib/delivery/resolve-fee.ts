import type {
  City,
  DeliveryQuote,
  Region,
  Township,
} from "@/features/delivery/types";

/**
 * Resolve a township's delivery fee most-specific first:
 * township → city → region. `null` = inherit from parent; `0` = explicit free
 * delivery (stops the lookup).
 */
export function resolveDeliveryFee(
  townshipId: string,
  data: { townships: Township[]; cities: City[]; regions: Region[] },
): DeliveryQuote {
  const township = data.townships.find((t) => t.id === townshipId);
  if (!township) return { fee: null, source: "none" };
  if (township.deliveryFee != null) {
    return { fee: township.deliveryFee, source: "township" };
  }

  const city = data.cities.find((c) => c.id === township.cityId);
  if (city?.deliveryFee != null) {
    return { fee: city.deliveryFee, source: "city" };
  }

  const region = city
    ? data.regions.find((r) => r.id === city.regionId)
    : undefined;
  if (region?.deliveryFee != null) {
    return { fee: region.deliveryFee, source: "region" };
  }

  return { fee: null, source: "none" };
}
