"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Package, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useStock } from "@/hooks/useStock";

export function StockAlerts() {
  const [branchId, setBranchId] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const bid = localStorage.getItem("branch_id");
    setBranchId(bid ? Number(bid) : null);
    setReady(true);
  }, []);

  const { data: criticalItems, isLoading } = useStock(ready ? branchId : null, true);

  if (!ready || isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          <h3 className="text-xs font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-widest">
            Alertas de stock
          </h3>
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-9 bg-stone-100 dark:bg-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!branchId) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-stone-300 dark:text-slate-600" />
          <h3 className="text-xs font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-widest">
            Alertas de stock
          </h3>
        </div>
        <p className="text-sm text-stone-400 dark:text-slate-500">
          Vista global — inicia sesión en una sucursal para ver alertas de stock.
        </p>
      </div>
    );
  }

  const count = criticalItems?.length ?? 0;
  const hasCritical = count > 0;

  return (
    <div
      className={`border rounded-2xl p-6 transition-colors ${
        hasCritical
          ? "bg-orange-500/5 border-orange-500/20"
          : "bg-white dark:bg-slate-900 border-stone-200 dark:border-slate-800"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle
            className={`w-4 h-4 ${hasCritical ? "text-orange-400" : "text-stone-300 dark:text-slate-600"}`}
          />
          <h3 className="text-xs font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-widest">
            Stock crítico
          </h3>
          {hasCritical && (
            <span className="ml-1 px-1.5 py-0.5 bg-orange-500/20 text-orange-500 dark:text-orange-400 text-xs font-bold rounded-md">
              {count}
            </span>
          )}
        </div>
        {hasCritical && (
          <Link
            href="/admin/stock"
            className="flex items-center gap-1 text-xs text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 transition-colors"
          >
            Ver todo
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {!hasCritical ? (
        <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-500">
          <Package className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">Todo el stock está en niveles normales.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {criticalItems!.slice(0, 8).map((item) => {
            const pct = item.min_stock > 0 ? item.quantity / item.min_stock : 0;
            return (
              <div
                key={item.ingredient_id}
                className="flex items-center gap-3 py-2 border-b border-orange-500/10 last:border-0"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                <span className="flex-1 text-sm text-stone-700 dark:text-slate-300 truncate min-w-0">
                  {item.ingredient_name || item.name}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-16 h-1.5 bg-stone-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${Math.min(pct * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-orange-500 dark:text-orange-400 w-12 text-right">
                    {parseFloat(item.quantity.toFixed(2))}
                    <span className="text-stone-400 dark:text-slate-600 font-normal"> {item.unit}</span>
                  </span>
                </div>
              </div>
            );
          })}
          {count > 8 && (
            <p className="text-xs text-stone-400 dark:text-slate-500 pt-2">
              +{count - 8} ingredientes más en stock crítico
            </p>
          )}
        </div>
      )}
    </div>
  );
}
