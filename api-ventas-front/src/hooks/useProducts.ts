"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category_id: number;
  is_active: boolean;
}

export interface RecipeItem {
  ingredient_id: number;
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

const QK = ["products"] as const;

function apiError(err: unknown): string {
  const e = err as { response?: { data?: { detail?: string } } };
  return e.response?.data?.detail || "Error al realizar la operación";
}

export function useProducts(params: ProductsParams = {}) {
  return useQuery<Product[]>({
    queryKey: [...QK, params],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (params.category_id !== undefined) sp.set("category_id", String(params.category_id));
      if (params.active_only !== undefined) sp.set("active_only", String(params.active_only));
      const qs = sp.toString();
      const { data } = await apiClient.get(`/products/${qs ? `?${qs}` : ""}`);
      return data;
    },
  });
}

export function useProduct(id: number | null) {
  return useQuery<ProductDetail>({
    queryKey: [...QK, id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/products/${id}`);
      return data;
    },
    enabled: id !== null,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ProductPayload) => {
      const { data } = await apiClient.post("/products/", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
      toast.success("Producto creado");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<ProductPayload> }) => {
      const { data } = await apiClient.patch(`/products/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
      toast.success("Producto actualizado");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useDeactivateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/products/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
      toast.success("Producto desactivado");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useSetRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, recipe }: { id: number; recipe: RecipeItem[] }) => {
      const { data } = await apiClient.put(`/products/${id}/recipe`, recipe);
      return data;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [...QK, id] });
      toast.success("Receta guardada");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}
