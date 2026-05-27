"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export interface Coupon {
  id: number;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_value: number | null;
  expiration_date: string | null;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  branch_id: number | null;
}

export interface CouponPayload {
  code: string;
  description?: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_value?: number | null;
  expiration_date?: string | null;
  max_uses?: number | null;
  is_active?: boolean;
}

function apiError(err: unknown): string {
  const e = err as { response?: { data?: { detail?: string } } };
  return e.response?.data?.detail || "Error al realizar la operación";
}

function qk(branchId: number | null) {
  return ["coupons", branchId] as const;
}

export function useCoupons(branchId: number | null) {
  return useQuery<Coupon[]>({
    queryKey: qk(branchId),
    queryFn: async () => {
      const { data } = await apiClient.get(`/branches/${branchId}/coupons`);
      return data;
    },
    enabled: branchId !== null,
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ branchId, payload }: { branchId: number; payload: CouponPayload }) => {
      const { data } = await apiClient.post(`/branches/${branchId}/coupons`, payload);
      return data;
    },
    onSuccess: (_, { branchId }) => {
      qc.invalidateQueries({ queryKey: qk(branchId) });
      toast.success("Cupón creado");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useUpdateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      branchId,
      id,
      payload,
    }: {
      branchId: number;
      id: number;
      payload: Partial<CouponPayload>;
    }) => {
      const { data } = await apiClient.patch(`/branches/${branchId}/coupons/${id}`, payload);
      return data;
    },
    onSuccess: (_, { branchId }) => {
      qc.invalidateQueries({ queryKey: qk(branchId) });
      toast.success("Cupón actualizado");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ branchId, id }: { branchId: number; id: number }) => {
      await apiClient.delete(`/branches/${branchId}/coupons/${id}`);
    },
    onSuccess: (_, { branchId }) => {
      qc.invalidateQueries({ queryKey: qk(branchId) });
      toast.success("Cupón eliminado");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export interface CouponValidation {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  discount_amount?: number;
  final_total?: number;
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: async ({
      branchId,
      code,
      orderTotal,
    }: {
      branchId: number;
      code: string;
      orderTotal: number;
    }) => {
      const { data } = await apiClient.get<CouponValidation>(
        `/branches/${branchId}/coupons/validate`,
        { params: { code, order_total: orderTotal } }
      );
      return data;
    },
  });
}
