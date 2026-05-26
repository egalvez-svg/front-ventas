"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export const ORDER_STATUSES = ["pending", "cooking", "served", "delivered", "paid", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ACTIVE_STATUSES: OrderStatus[] = ["pending", "cooking", "served", "delivered"];

export interface OrderExtra {
  ingredient_id: number;
  quantity: number;
}

export interface OrderItemPayload {
  product_id: number;
  quantity: number;
  notes?: string;
  extras?: OrderExtra[];
}

export interface CreateOrderPayload {
  table_id: number | null;
  items: OrderItemPayload[];
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  notes: string | null;
  unit_price: number;
  extras: OrderExtra[];
}

export interface Order {
  id: number;
  table_id: number | null;
  table_number?: number;
  status: OrderStatus;
  items: OrderItem[];
  created_at: string;
  total?: number;
}

function apiError(err: unknown): string {
  const e = err as { response?: { data?: { detail?: string } } };
  return e.response?.data?.detail || "Error al realizar la operación";
}

function qk(branchId: number | null) {
  return ["orders", branchId] as const;
}

export function useOrders(branchId: number | null, status?: OrderStatus, refetchInterval?: number) {
  return useQuery<Order[]>({
    queryKey: [...qk(branchId), status ?? "all"],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (status) sp.set("status", status);
      const qs = sp.toString();
      const { data } = await apiClient.get(
        `/branches/${branchId}/orders${qs ? `?${qs}` : ""}`
      );
      return data;
    },
    enabled: branchId !== null,
    refetchInterval,
    refetchOnWindowFocus: true,
  });
}

export function useKitchenOrders(branchId: number | null) {
  return useQuery<Order[]>({
    queryKey: [...qk(branchId), "kitchen"],
    queryFn: async () => {
      const { data } = await apiClient.get(`/branches/${branchId}/orders/kitchen`);
      return data;
    },
    enabled: branchId !== null,
    refetchInterval: 4_000,
    refetchOnWindowFocus: true,
  });
}

export function useOrder(branchId: number | null, orderId: number | null) {
  return useQuery<Order>({
    queryKey: [...qk(branchId), orderId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/branches/${branchId}/orders/${orderId}`);
      return data;
    },
    enabled: branchId !== null && orderId !== null,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      branchId,
      payload,
    }: {
      branchId: number;
      payload: CreateOrderPayload;
    }) => {
      const { data } = await apiClient.post(`/branches/${branchId}/orders`, payload);
      return data as Order;
    },
    onSuccess: (_, { branchId }) => {
      qc.invalidateQueries({ queryKey: qk(branchId) });
      qc.invalidateQueries({ queryKey: ["tables", branchId] });
      toast.success("Pedido enviado a cocina");
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export interface InvoiceItem {
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
  extras: OrderExtra[];
}

export interface Invoice {
  order_id: number;
  branch_id: number;
  created_at: string;
  subtotal: number;
  tip: number;
  total: number;
  items: InvoiceItem[];
}

export interface TableInvoiceItem {
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
  extras: OrderExtra[];
}

export interface TableInvoiceOrder {
  order_id: number;
  status: OrderStatus;
  created_at: string;
  items: TableInvoiceItem[];
  order_total: number;
}

export interface TableInvoice {
  table_id: number;
  branch_id: number;
  orders: TableInvoiceOrder[];
  subtotal: number;
  tip: number;
  total: number;
}

export function useTableInvoice(branchId: number | null, tableId: number | null) {
  return useQuery<TableInvoice>({
    queryKey: ["table-invoice", branchId, tableId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/branches/${branchId}/tables/${tableId}/invoice`
      );
      return data;
    },
    enabled: branchId !== null && tableId !== null,
  });
}

export function usePayTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      branchId,
      tableId,
      tip,
    }: {
      branchId: number;
      tableId: number;
      tip?: number;
    }) => {
      const body: Record<string, unknown> = {};
      if (tip !== undefined && tip > 0) body.tip = tip;
      const { data } = await apiClient.post(
        `/branches/${branchId}/tables/${tableId}/pay`,
        body
      );
      return data;
    },
    onSuccess: (_, { branchId }) => {
      qc.invalidateQueries({ queryKey: qk(branchId) });
      qc.invalidateQueries({ queryKey: ["tables", branchId] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useOrderInvoice(branchId: number | null, orderId: number | null) {
  return useQuery<Invoice>({
    queryKey: ["invoice", branchId, orderId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/branches/${branchId}/orders/${orderId}/invoice`
      );
      return data;
    },
    enabled: branchId !== null && orderId !== null,
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      branchId,
      orderId,
      status,
      tip,
    }: {
      branchId: number;
      orderId: number;
      status: OrderStatus;
      tip?: number;
    }) => {
      const body: Record<string, unknown> = { status };
      if (tip !== undefined && tip > 0) body.tip = tip;
      const { data } = await apiClient.patch(
        `/branches/${branchId}/orders/${orderId}/status`,
        body
      );
      return data as Order;
    },
    onSuccess: (_, { branchId }) => {
      qc.invalidateQueries({ queryKey: qk(branchId) });
      qc.invalidateQueries({ queryKey: ["tables", branchId] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}
