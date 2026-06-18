"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/delivery-api";
import type { City, Region, Township } from "../types";

const keys = {
  regions: ["delivery", "regions"] as const,
  cities: (regionId?: string) => ["delivery", "cities", regionId ?? "all"] as const,
  townships: (cityId?: string) => ["delivery", "townships", cityId ?? "all"] as const,
};

// ---- Regions ----
export function useRegions() {
  return useQuery({ queryKey: keys.regions, queryFn: api.getRegions });
}
export function useCreateRegion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: Partial<Region>) => api.createRegion(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["delivery"] }),
  });
}
export function useUpdateRegion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Region> }) =>
      api.updateRegion(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["delivery"] }),
  });
}
export function useDeleteRegion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteRegion(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["delivery"] }),
  });
}

// ---- Cities ----
export function useCities(regionId?: string) {
  return useQuery({ queryKey: keys.cities(regionId), queryFn: () => api.getCities(regionId) });
}
export function useCreateCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: Partial<City>) => api.createCity(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["delivery"] }),
  });
}
export function useUpdateCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<City> }) =>
      api.updateCity(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["delivery"] }),
  });
}
export function useDeleteCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteCity(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["delivery"] }),
  });
}

// ---- Townships ----
export function useTownships(cityId?: string) {
  return useQuery({ queryKey: keys.townships(cityId), queryFn: () => api.getTownships(cityId) });
}
export function useCreateTownship() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: Partial<Township>) => api.createTownship(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["delivery"] }),
  });
}
export function useUpdateTownship() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Township> }) =>
      api.updateTownship(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["delivery"] }),
  });
}
export function useDeleteTownship() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteTownship(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["delivery"] }),
  });
}
