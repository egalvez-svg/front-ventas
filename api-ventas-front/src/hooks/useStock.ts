"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export interface StockItem {
  ingredient_id: number;
  name: string;
  unit: string;
  quantity: number;
  min_stock: number;
}

export interface StockUpdatePayload {
  quantity?: number;
  min_stock?: number;
}

function apiError(err: unknown): string {
  const e = err as { response?: { data?: { detail?: string } } };
  return e.response?.data?.detail || "Error al realizar la operación";
}

export function useStock(branchId: number | null, critical = false) {
  return useQuery<StockItem[]>({
    queryKey: ["stock", branchId, critical],
    queryFn: async () => {
      const path = critical
        ? `/branches/${branchId}/stock/critical`
        : `/branches/${branchId}/stock`;
      const { data } = await apiClient.get(path);
      return data;
    },
    enabled: branchId !== null,
  });
}

export function useUpdateStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      branchId,
      ingredientId,
      payload,
    }: {
      branchId: number;
      ingredientId: number;
      payload: StockUpdatePayload;
    }) => {
      const { data } = await apiClient.patch(
        `/branches/${branchId}/stock/${ingredientId}`,
        payload
      );
      return data;
    },
    onSuccess: (_, { branchId }) => {
      qc.invalidateQueries({ queryKey: ["stock", branchId] });
      toast.success("Stock actualizado");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}
