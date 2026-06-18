import { describe, expect, it } from "vitest";
import { resolveDeliveryFee } from "./resolve-fee";
import type { City, Region, Township } from "@/features/delivery/types";

const regions: Region[] = [
  { id: "r1", name: "Yangon", deliveryFee: 3000, isActive: true },
  { id: "r2", name: "Mandalay", deliveryFee: null, isActive: true },
];
const cities: City[] = [
  { id: "c1", regionId: "r1", name: "Yangon City", deliveryFee: null, isActive: true },
  { id: "c2", regionId: "r1", name: "Insein", deliveryFee: 1500, isActive: true },
  { id: "c3", regionId: "r2", name: "Mandalay City", deliveryFee: null, isActive: true },
];
const townships: Township[] = [
  { id: "t1", cityId: "c1", name: "Hlaing", deliveryFee: 5000, isActive: true }, // own fee
  { id: "t2", cityId: "c1", name: "Kamayut", deliveryFee: null, isActive: true }, // inherit region (city null)
  { id: "t3", cityId: "c2", name: "Insein-1", deliveryFee: null, isActive: true }, // inherit city
  { id: "t4", cityId: "c3", name: "Aung Myay", deliveryFee: null, isActive: true }, // nothing set
  { id: "t5", cityId: "c1", name: "Free Zone", deliveryFee: 0, isActive: true }, // explicit free
];

const data = { townships, cities, regions };

describe("resolveDeliveryFee", () => {
  it("uses the township fee when set", () => {
    expect(resolveDeliveryFee("t1", data)).toEqual({ fee: 5000, source: "township" });
  });
  it("falls back to the city fee", () => {
    expect(resolveDeliveryFee("t3", data)).toEqual({ fee: 1500, source: "city" });
  });
  it("falls back to the region fee when township and city are null", () => {
    expect(resolveDeliveryFee("t2", data)).toEqual({ fee: 3000, source: "region" });
  });
  it("returns none when nothing is set anywhere", () => {
    expect(resolveDeliveryFee("t4", data)).toEqual({ fee: null, source: "none" });
  });
  it("treats 0 as explicit free delivery (not inherit)", () => {
    expect(resolveDeliveryFee("t5", data)).toEqual({ fee: 0, source: "township" });
  });
  it("returns none for an unknown township", () => {
    expect(resolveDeliveryFee("nope", data)).toEqual({ fee: null, source: "none" });
  });
});
