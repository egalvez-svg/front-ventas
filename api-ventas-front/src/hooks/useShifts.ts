"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export interface Shift {
  id: number;
  branch_id: number;
  opened_by: number;
  opened_at: string;
  closed_at: string | null;
  is_active: boolean;
  initial_cash: number;
  actual_cash: number | null;
}

function apiError(err: unknown): string {
  const e = err as { response?: { data?: { detail?: string } } };
  return e.response?.data?.detail || "Error al realizar la operación";
}

function qk(branchId: number | null) {
  return ["shifts", branchId] as const;
}

export function useCurrentShift(branchId: number | null) {
  return useQuery<Shift | null>({
    queryKey: [...qk(branchId), "current"],
    queryFn: async () => {
      const { data } = await apiClient.get(`/branches/${branchId}/shifts/current`);
      return data;
    },
    enabled: branchId !== null,
    retry: (_, error: unknown) => {
      const e = error as { response?: { status?: number } };
      return e.response?.status !== 404;
    },
  });
}

export function useOpenShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ branchId, initial_cash }: { branchId: number; initial_cash: number }) => {
      const { data } = await apiClient.post(`/branches/${branchId}/shifts/open`, { initial_cash });
      return data as Shift;
    },
    onSuccess: (shift, { branchId }) => {
      qc.invalidateQueries({ queryKey: qk(branchId) });
      localStorage.setItem("shift_id", shift.id.toString());
      toast.success("Turno abierto correctamente");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useCloseShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ branchId, actual_cash }: { branchId: number; actual_cash: number }) => {
      const { data } = await apiClient.post(`/branches/${branchId}/shifts/close`, { actual_cash });
      return data as Shift;
    },
    onSuccess: (_, { branchId }) => {
      qc.invalidateQueries({ queryKey: qk(branchId) });
      localStorage.removeItem("shift_id");
      toast.success("Turno cerrado correctamente");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}
