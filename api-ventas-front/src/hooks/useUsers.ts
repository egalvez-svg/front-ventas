"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export interface BranchMembership {
  id: number;
  branch_id: number | null;
  branch_name: string | null;
  role: string;
  is_active: boolean;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  memberships: BranchMembership[];
}

export interface CreateUserPayload {
  email: string;
  full_name: string;
  password?: string;
  role: string;
  branch_id: number | null;
}

export interface MembershipPayload {
  branch_id: number | null;
  role: string;
}

export interface UpdateUserPayload {
  email?: string;
  full_name?: string;
  password?: string;
  memberships?: MembershipPayload[];
}

function apiError(err: unknown): string {
  const e = err as { response?: { data?: { detail?: string } } };
  return e.response?.data?.detail || "Error al realizar la operación";
}

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await apiClient.get("/users/");
      return data;
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateUserPayload) => {
      // The backend expects memberships as a list in UserCreate
      const backendPayload = {
        email: payload.email,
        full_name: payload.full_name,
        password: payload.password,
        memberships: [
          {
            branch_id: payload.branch_id,
            role: payload.role
          }
        ]
      };
      const { data } = await apiClient.post("/users/", backendPayload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuario creado");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: UpdateUserPayload }) => {
      const { data } = await apiClient.patch(`/users/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuario actualizado");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuario desactivado");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useAddMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, payload }: { userId: number; payload: { branch_id: number | null; role: string } }) => {
      const { data } = await apiClient.post(`/users/${userId}/memberships`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Membresía añadida");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useRemoveMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, membershipId }: { userId: number; membershipId: number }) => {
      await apiClient.delete(`/users/${userId}/memberships/${membershipId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Membresía eliminada");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}
