"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export const UNITS = ["gr", "ml", "un", "kg"] as const;
export type Unit = (typeof UNITS)[number];

export interface Ingredient {
  id: number;
  branch_id: number;
  name: string;
  unit: Unit;
  cost_per_unit: number;
}

export interface IngredientPayload {
  name: string;
  unit: Unit;
  cost_per_unit: number;
}

function apiError(err: unknown): string {
  const e = err as { response?: { data?: { detail?: string } } };
  return e.response?.data?.detail || "Error al realizar la operación";
}

function qk(branchId: number | null) {
  return ["ingredients", branchId] as const;
}

export function useIngredients(branchId: number | null) {
  return useQuery<Ingredient[]>({
    queryKey: qk(branchId),
    queryFn: async () => {
      const { data } = await apiClient.get(`/branches/${branchId}/ingredients/`);
      return data;
    },
    enabled: branchId !== null,
  });
}

export function useCreateIngredient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ branchId, payload }: { branchId: number; payload: IngredientPayload }) => {
      const { data } = await apiClient.post(`/branches/${branchId}/ingredients/`, payload);
      return data;
    },
    onSuccess: (_, { branchId }) => {
      qc.invalidateQueries({ queryKey: qk(branchId) });
      toast.success("Ingrediente creado");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useUpdateIngredient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ branchId, id, payload }: { branchId: number; id: number; payload: IngredientPayload }) => {
      const { data } = await apiClient.patch(`/branches/${branchId}/ingredients/${id}`, payload);
      return data;
    },
    onSuccess: (_, { branchId }) => {
      qc.invalidateQueries({ queryKey: qk(branchId) });
      toast.success("Ingrediente actualizado");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useDeleteIngredient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ branchId, id }: { branchId: number; id: number }) => {
      await apiClient.delete(`/branches/${branchId}/ingredients/${id}`);
    },
    onSuccess: (_, { branchId }) => {
      qc.invalidateQueries({ queryKey: qk(branchId) });
      toast.success("Ingrediente eliminado");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}
