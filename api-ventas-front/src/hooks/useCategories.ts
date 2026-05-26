"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export interface CategoryPayload {
  name: string;
  description?: string | null;
}

const QK = ["categories"] as const;

function apiError(err: unknown): string {
  const e = err as { response?: { data?: { detail?: string } } };
  return e.response?.data?.detail || "Error al realizar la operación";
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: QK,
    queryFn: async () => {
      const { data } = await apiClient.get("/categories/");
      return data;
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CategoryPayload) => {
      const { data } = await apiClient.post("/categories/", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
      toast.success("Categoría creada");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: CategoryPayload }) => {
      const { data } = await apiClient.patch(`/categories/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
      toast.success("Categoría actualizada");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
      toast.success("Categoría eliminada");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}
