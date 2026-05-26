"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export interface Category {
  id: number;
  branch_id: number;
  name: string;
  description: string | null;
}

export interface CategoryPayload {
  name: string;
  description?: string | null;
}

function apiError(err: unknown): string {
  const e = err as { response?: { data?: { detail?: string } } };
  return e.response?.data?.detail || "Error al realizar la operación";
}

function qk(branchId: number | null) {
  return ["categories", branchId] as const;
}

export function useCategories(branchId: number | null) {
  return useQuery<Category[]>({
    queryKey: qk(branchId),
    queryFn: async () => {
      const { data } = await apiClient.get(`/branches/${branchId}/categories/`);
      return data;
    },
    enabled: branchId !== null,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ branchId, payload }: { branchId: number; payload: CategoryPayload }) => {
      const { data } = await apiClient.post(`/branches/${branchId}/categories/`, payload);
      return data;
    },
    onSuccess: (_, { branchId }) => {
      qc.invalidateQueries({ queryKey: qk(branchId) });
      toast.success("Categoría creada");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ branchId, id, payload }: { branchId: number; id: number; payload: CategoryPayload }) => {
      const { data } = await apiClient.patch(`/branches/${branchId}/categories/${id}`, payload);
      return data;
    },
    onSuccess: (_, { branchId }) => {
      qc.invalidateQueries({ queryKey: qk(branchId) });
      toast.success("Categoría actualizada");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ branchId, id }: { branchId: number; id: number }) => {
      await apiClient.delete(`/branches/${branchId}/categories/${id}`);
    },
    onSuccess: (_, { branchId }) => {
      qc.invalidateQueries({ queryKey: qk(branchId) });
      toast.success("Categoría eliminada");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}
