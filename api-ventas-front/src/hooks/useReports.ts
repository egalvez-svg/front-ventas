"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

// ─── Normalized output types (same shape regardless of role) ──────────────────

export interface LastShiftStats {
  total_sales: number;
  total_tips: number;
  order_count: number;
  average_order: number;
  /** null for admin global view (no single shift context) */
  is_active: boolean | null;
  /** null for admin global view */
  opened_at: string | null;
}

export interface AveragesStats {
  daily_average: number;
  weekly_average: number;
  monthly_average: number;
  /** null for admin global view */
  total_days_with_sales: number | null;
  period_days: number;
}

export interface TrendPoint {
  date: string;
  total: number;
  order_count: number;
}

export interface WeekdayPoint {
  weekday: number;
  weekday_name: string;
  total: number;
  order_count: number;
  average_order: number;
}

export interface MonthlyTrendPoint {
  year: number;
  month: number;
  month_label: string;
  gross_sales: number;
  net_sales: number;
  tips: number;
  net_losses: number;
  order_count: number;
}

// ─── Raw API response shapes ──────────────────────────────────────────────────

interface AdminLastShiftRaw {
  global_total_sales: number;
  global_total_tips: number;
  global_order_count: number;
  global_average_order: number;
  by_branch: unknown[];
}

interface BranchLastShiftRaw {
  shift_id: number | null;
  opened_at: string;
  closed_at: string | null;
  is_active: boolean;
  total_sales: number;
  total_tips: number;
  order_count: number;
  average_order: number;
}

interface AdminAveragesRaw {
  daily_average: number;
  weekly_average: number;
  monthly_average: number;
  period_days: number;
  by_branch: unknown[];
}

interface BranchAveragesRaw {
  daily_average: number;
  weekly_average: number;
  monthly_average: number;
  total_days_with_sales: number;
  period_days: number;
}

interface AdminTrendRaw {
  global_trend: TrendPoint[];
  by_branch: unknown[];
}

interface AdminWeekdayRaw {
  global_weekdays: WeekdayPoint[];
  by_branch: unknown[];
}

interface AdminMonthlyTrendRaw {
  global_trend: MonthlyTrendPoint[];
  by_branch: unknown[];
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useLastShiftReport(role: string | null, branchId: number | null) {
  const isAdmin = role === "admin";
  return useQuery<LastShiftStats | null>({
    queryKey: ["reports", "last-shift", role, branchId],
    queryFn: async () => {
      if (isAdmin) {
        const { data } = await apiClient.get<AdminLastShiftRaw>("/reports/last-shift");
        return {
          total_sales: data.global_total_sales,
          total_tips: data.global_total_tips,
          order_count: data.global_order_count,
          average_order: data.global_average_order,
          is_active: null,
          opened_at: null,
        };
      }
      const { data } = await apiClient.get<BranchLastShiftRaw>(
        `/branches/${branchId}/reports/last-shift`
      );
      return {
        total_sales: data.total_sales,
        total_tips: data.total_tips,
        order_count: data.order_count,
        average_order: data.average_order,
        is_active: data.is_active,
        opened_at: data.opened_at,
      };
    },
    enabled: role !== null && (isAdmin || branchId !== null),
    retry: (_, error: unknown) => {
      const e = error as { response?: { status?: number } };
      return e.response?.status !== 404;
    },
  });
}

export function useAveragesReport(role: string | null, branchId: number | null, days = 30) {
  const isAdmin = role === "admin";
  return useQuery<AveragesStats>({
    queryKey: ["reports", "averages", role, branchId, days],
    queryFn: async () => {
      if (isAdmin) {
        const { data } = await apiClient.get<AdminAveragesRaw>(
          `/reports/averages?days=${days}`
        );
        return {
          daily_average: data.daily_average,
          weekly_average: data.weekly_average,
          monthly_average: data.monthly_average,
          total_days_with_sales: null,
          period_days: data.period_days,
        };
      }
      const { data } = await apiClient.get<BranchAveragesRaw>(
        `/branches/${branchId}/reports/averages?days=${days}`
      );
      return { ...data };
    },
    enabled: role !== null && (isAdmin || branchId !== null),
  });
}

export function useTrendReport(role: string | null, branchId: number | null, days = 30) {
  const isAdmin = role === "admin";
  return useQuery<TrendPoint[]>({
    queryKey: ["reports", "trend", role, branchId, days],
    queryFn: async () => {
      if (isAdmin) {
        const { data } = await apiClient.get<AdminTrendRaw>(`/reports/trend?days=${days}`);
        return data.global_trend;
      }
      const { data } = await apiClient.get<TrendPoint[]>(
        `/branches/${branchId}/reports/trend?days=${days}`
      );
      return data;
    },
    enabled: role !== null && (isAdmin || branchId !== null),
  });
}

export function useWeekdayReport(role: string | null, branchId: number | null, days = 90) {
  const isAdmin = role === "admin";
  return useQuery<WeekdayPoint[]>({
    queryKey: ["reports", "by-weekday", role, branchId, days],
    queryFn: async () => {
      if (isAdmin) {
        const { data } = await apiClient.get<AdminWeekdayRaw>(
          `/reports/by-weekday?days=${days}`
        );
        return data.global_weekdays;
      }
      const { data } = await apiClient.get<WeekdayPoint[]>(
        `/branches/${branchId}/reports/by-weekday?days=${days}`
      );
      return data;
    },
    enabled: role !== null && (isAdmin || branchId !== null),
  });
}

export function useMonthlyTrendReport(
  role: string | null,
  branchId: number | null,
  months = 6
) {
  const isAdmin = role === "admin";
  return useQuery<MonthlyTrendPoint[]>({
    queryKey: ["reports", "monthly-trend", role, branchId, months],
    queryFn: async () => {
      if (isAdmin) {
        const { data } = await apiClient.get<AdminMonthlyTrendRaw>(
          `/reports/monthly-trend?months=${months}`
        );
        return data.global_trend;
      }
      const { data } = await apiClient.get<MonthlyTrendPoint[]>(
        `/branches/${branchId}/reports/monthly-trend?months=${months}`
      );
      return data;
    },
    enabled: role !== null && (isAdmin || branchId !== null),
  });
}

export interface TopProduct {
  rank: number;
  product_id: number;
  product_name: string;
  total_quantity: number;
  total_revenue: number;
  order_count: number;
}

export function useTopProductsReport(
  branchId: number | null,
  days = 30,
  limit = 10
) {
  return useQuery<TopProduct[]>({
    queryKey: ["reports", "top-products", branchId, days, limit],
    queryFn: async () => {
      const { data } = await apiClient.get<TopProduct[]>(
        `/branches/${branchId}/reports/top-products?days=${days}&limit=${limit}`
      );
      return data;
    },
    enabled: branchId !== null,
  });
}
