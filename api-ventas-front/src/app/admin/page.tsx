"use client";

import { Authenticated } from "@refinedev/core";
import { LayoutDashboard, Loader2 } from "lucide-react";
import { SalesDashboard } from "@/components/admin/SalesDashboard";
import { StockAlerts } from "@/components/admin/StockAlerts";

export default function AdminDashboard() {
  return (
    <Authenticated
      key="admin-page"
      loading={
        <div className="min-h-screen bg-stone-100 dark:bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        </div>
      }
    >
      <AdminContent />
    </Authenticated>
  );
}

function AdminContent() {
  return (
    <div className="min-h-full text-stone-900 dark:text-slate-100 px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
          <LayoutDashboard className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h1 className="text-base font-bold leading-none">Dashboard</h1>
          <p className="text-xs text-stone-400 dark:text-slate-500 mt-0.5">Ventas y alertas de inventario</p>
        </div>
      </div>

      <SalesDashboard />
      <StockAlerts />
    </div>
  );
}
