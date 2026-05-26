"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export interface Branch {
  id: number;
  name: string;
  address: string;
  is_active: boolean;
}

export interface BranchPayload {
  name: string;
  address: string;
}

export function useBranches() {
  return useQuery<Branch[]>({
    queryKey: ["branches"],
    queryFn: async () => {
      const { data } = await apiClient.get("/branches/");
      return data;
    },
  });
}

export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BranchPayload) => {
      const { data } = await apiClient.post("/branches/", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Sucursal creada");
    },
    onError: () => toast.error("Error al crear sucursal"),
  });
}

export function useUpdateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: BranchPayload }) => {
      const { data } = await apiClient.patch(`/branches/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Sucursal actualizada");
    },
    onError: () => toast.error("Error al actualizar sucursal"),
  });
}

export function useDeleteBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/branches/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Sucursal desactivada");
    },
    onError: () => toast.error("Error al desactivar sucursal"),
  });
}
