import { apiClient } from "@/lib/api/client";
import type { City, DeliveryQuote, Region, Township } from "../types";

// ---- Regions ----
export async function getRegions(): Promise<Region[]> {
  const { data } = await apiClient.get<Region[]>("/delivery/regions");
  return data;
}
export async function createRegion(payload: Partial<Region>): Promise<Region> {
  const { data } = await apiClient.post<Region>("/delivery/regions", payload);
  return data;
}
export async function updateRegion(id: string, payload: Partial<Region>): Promise<Region> {
  const { data } = await apiClient.patch<Region>(`/delivery/regions/${id}`, payload);
  return data;
}
export async function deleteRegion(id: string): Promise<Region> {
  const { data } = await apiClient.delete<Region>(`/delivery/regions/${id}`);
  return data;
}

// ---- Cities ----
export async function getCities(regionId?: string): Promise<City[]> {
  const { data } = await apiClient.get<City[]>("/delivery/cities", {
    params: regionId ? { regionId } : undefined,
  });
  return data;
}
export async function createCity(payload: Partial<City>): Promise<City> {
  const { data } = await apiClient.post<City>("/delivery/cities", payload);
  return data;
}
export async function updateCity(id: string, payload: Partial<City>): Promise<City> {
  const { data } = await apiClient.patch<City>(`/delivery/cities/${id}`, payload);
  return data;
}
export async function deleteCity(id: string): Promise<City> {
  const { data } = await apiClient.delete<City>(`/delivery/cities/${id}`);
  return data;
}

// ---- Townships ----
export async function getTownships(cityId?: string): Promise<Township[]> {
  const { data } = await apiClient.get<Township[]>("/delivery/townships", {
    params: cityId ? { cityId } : undefined,
  });
  return data;
}
export async function createTownship(payload: Partial<Township>): Promise<Township> {
  const { data } = await apiClient.post<Township>("/delivery/townships", payload);
  return data;
}
export async function updateTownship(id: string, payload: Partial<Township>): Promise<Township> {
  const { data } = await apiClient.patch<Township>(`/delivery/townships/${id}`, payload);
  return data;
}
export async function deleteTownship(id: string): Promise<Township> {
  const { data } = await apiClient.delete<Township>(`/delivery/townships/${id}`);
  return data;
}

export async function getDeliveryQuote(townshipId: string): Promise<DeliveryQuote> {
  const { data } = await apiClient.get<DeliveryQuote>(`/delivery/quote/${townshipId}`);
  return data;
}
