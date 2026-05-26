"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export interface Product {
  id: number;
  branch_id: number;
  name: string;
  description: string | null;
  price: number;
  category_id: number;
  is_active: boolean;
}

export interface RecipeItem {
  ingredient_id: number;
  ingredient_name?: string;
  unit?: string;
  quantity: number;
}

export interface ProductDetail extends Product {
  recipe: RecipeItem[];
}

export interface ProductPayload {
  name: string;
  description?: string | null;
  price: number;
  category_id: number;
  is_active: boolean;
}

export interface ProductsParams {
  category_id?: number;
  active_only?: boolean;
}

function apiError(err: unknown): string {
  const e = err as { response?: { data?: { detail?: string } } };
  return e.response?.data?.detail || "Error al realizar la operación";
}

function qk(branchId: number | null, params?: ProductsParams) {
  return ["products", branchId, params] as const;
}

export function useProducts(branchId: number | null, params: ProductsParams = {}) {
  return useQuery<Product[]>({
    queryKey: qk(branchId, params),
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (params.category_id !== undefined) sp.set("category_id", String(params.category_id));
      if (params.active_only !== undefined) sp.set("active_only", String(params.active_only));
      const qs = sp.toString();
      const { data } = await apiClient.get(
        `/branches/${branchId}/products/${qs ? `?${qs}` : ""}`
      );
      return data;
    },
    enabled: branchId !== null,
  });
}

export function useProduct(branchId: number | null, id: number | null) {
  return useQuery<ProductDetail>({
    queryKey: ["products", branchId, id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/branches/${branchId}/products/${id}`);
      return data;
    },
    enabled: id !== null && branchId !== null,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ branchId, payload }: { branchId: number; payload: ProductPayload }) => {
      const { data } = await apiClient.post(`/branches/${branchId}/products/`, payload);
      return data;
    },
    onSuccess: (_, { branchId }) => {
      qc.invalidateQueries({ queryKey: ["products", branchId] });
      toast.success("Producto creado");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ branchId, id, payload }: { branchId: number; id: number; payload: Partial<ProductPayload> }) => {
      const { data } = await apiClient.patch(`/branches/${branchId}/products/${id}`, payload);
      return data;
    },
    onSuccess: (_, { branchId }) => {
      qc.invalidateQueries({ queryKey: ["products", branchId] });
      toast.success("Producto actualizado");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useDeactivateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ branchId, id }: { branchId: number; id: number }) => {
      await apiClient.delete(`/branches/${branchId}/products/${id}`);
    },
    onSuccess: (_, { branchId }) => {
      qc.invalidateQueries({ queryKey: ["products", branchId] });
      toast.success("Producto desactivado");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useSetRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      branchId,
      id,
      recipe,
    }: {
      branchId: number;
      id: number;
      recipe: Pick<RecipeItem, "ingredient_id" | "quantity">[];
    }) => {
      const { data } = await apiClient.put(`/branches/${branchId}/products/${id}/recipe`, recipe);
      return data;
    },
    onSuccess: (_, { branchId }) => {
      qc.invalidateQueries({ queryKey: ["products", branchId] });
      toast.success("Receta guardada");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}
