"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export const TABLE_STATUSES = ["available", "occupied", "reserved"] as const;
export type TableStatus = (typeof TABLE_STATUSES)[number];

export interface Table {
  id: number;
  number: number;
  status: TableStatus;
}

export interface TablePayload {
  number: number;
  status: TableStatus;
}

function apiError(err: unknown): string {
  const e = err as { response?: { data?: { detail?: string } } };
  return e.response?.data?.detail || "Error al realizar la operación";
}

function qk(branchId: number | null) {
  return ["tables", branchId] as const;
}

export function useTables(branchId: number | null) {
  return useQuery<Table[]>({
    queryKey: qk(branchId),
    queryFn: async () => {
      const { data } = await apiClient.get(`/branches/${branchId}/tables`);
      return data;
    },
    enabled: branchId !== null,
  });
}

export function useCreateTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ branchId, payload }: { branchId: number; payload: TablePayload }) => {
      const { data } = await apiClient.post(`/branches/${branchId}/tables`, payload);
      return data;
    },
    onSuccess: (_, { branchId }) => {
      qc.invalidateQueries({ queryKey: qk(branchId) });
      toast.success("Mesa creada");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useUpdateTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      branchId,
      tableId,
      payload,
    }: {
      branchId: number;
      tableId: number;
      payload: Partial<TablePayload>;
    }) => {
      const { data } = await apiClient.patch(
        `/branches/${branchId}/tables/${tableId}`,
        payload
      );
      return data;
    },
    onSuccess: (_, { branchId }) => {
      qc.invalidateQueries({ queryKey: qk(branchId) });
      toast.success("Mesa actualizada");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useReleaseTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ branchId, tableId }: { branchId: number; tableId: number }) => {
      const { data } = await apiClient.patch(
        `/branches/${branchId}/tables/${tableId}`,
        { status: "available" }
      );
      return data;
    },
    onSuccess: (_, { branchId }) => {
      qc.invalidateQueries({ queryKey: qk(branchId) });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useDeleteTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ branchId, tableId }: { branchId: number; tableId: number }) => {
      await apiClient.delete(`/branches/${branchId}/tables/${tableId}`);
    },
    onSuccess: (_, { branchId }) => {
      qc.invalidateQueries({ queryKey: qk(branchId) });
      toast.success("Mesa eliminada");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}
