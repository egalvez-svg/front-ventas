"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export const UNITS = ["gr", "ml", "un", "kg"] as const;
export type Unit = (typeof UNITS)[number];

export interface Ingredient {
  id: number;
  name: string;
  unit: Unit;
  cost_per_unit: number;
}

export interface IngredientPayload {
  name: string;
  unit: Unit;
  cost_per_unit: number;
}

const QK = ["ingredients"] as const;

function apiError(err: unknown): string {
  const e = err as { response?: { data?: { detail?: string } } };
  return e.response?.data?.detail || "Error al realizar la operación";
}

export function useIngredients() {
  return useQuery<Ingredient[]>({
    queryKey: QK,
    queryFn: async () => {
      const { data } = await apiClient.get("/ingredients/");
      return data;
    },
  });
}

export function useCreateIngredient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: IngredientPayload) => {
      const { data } = await apiClient.post("/ingredients/", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
      toast.success("Ingrediente creado");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useUpdateIngredient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: IngredientPayload }) => {
      const { data } = await apiClient.patch(`/ingredients/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
      toast.success("Ingrediente actualizado");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useDeleteIngredient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/ingredients/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
      toast.success("Ingrediente eliminado");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}
