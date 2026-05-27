"use client";

import { useState, useEffect } from "react";
import { Authenticated } from "@refinedev/core";
import { TrendingUp, Loader2, ShoppingCart } from "lucide-react";
import { useTopProductsReport } from "@/hooks/useReports";

const DAYS_OPTIONS = [
  { value: 7, label: "7 días" },
  { value: 15, label: "15 días" },
  { value: 30, label: "30 días" },
  { value: 60, label: "60 días" },
  { value: 90, label: "90 días" },
];

const LIMIT_OPTIONS = [5, 10, 20];

export default function TopProductsPage() {
  return (
    <Authenticated
      key="top-products-page"
      loading={
        <div className="min-h-screen bg-stone-100 dark:bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        </div>
      }
    >
      <TopProductsContent />
    </Authenticated>
  );
}

function TopProductsContent() {
  const [branchId, setBranchId] = useState<number | null>(null);
  const [days, setDays] = useState(30);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const stored = localStorage.getItem("branch_id");
    if (stored) setBranchId(Number(stored));
  }, []);

  const { data: products, isLoading, isError } = useTopProductsReport(branchId, days, limit);

  function clpFull(n: number) {
    return Math.round(n).toLocaleString("es-CL", { style: "currency", currency: "CLP" });
  }

  return (
    <div className="min-h-full text-stone-900 dark:text-slate-100 px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h1 className="text-base font-bold leading-none">Productos más vendidos</h1>
          <p className="text-xs text-stone-400 dark:text-slate-500 mt-0.5">
            Ranking por unidades vendidas en el período
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-wider">Período</span>
          <div className="flex items-center bg-stone-100 dark:bg-slate-800/60 rounded-xl p-0.5 gap-0.5">
            {DAYS_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setDays(o.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  days === o.value
                    ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm"
                    : "text-stone-500 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-300"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="w-px h-5 bg-stone-200 dark:bg-slate-700" />

        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-wider">Top</span>
          <div className="flex items-center bg-stone-100 dark:bg-slate-800/60 rounded-xl p-0.5 gap-0.5">
            {LIMIT_OPTIONS.map((l) => (
              <button
                key={l}
                onClick={() => setLimit(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  limit === l
                    ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm"
                    : "text-stone-500 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-300"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400 dark:text-slate-500 gap-2">
            <ShoppingCart className="w-8 h-8" />
            <p className="text-sm">No se pudieron cargar los datos</p>
          </div>
        ) : !products || products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400 dark:text-slate-500 gap-2">
            <ShoppingCart className="w-8 h-8" />
            <p className="text-sm">Sin ventas en el período seleccionado</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 dark:border-slate-800">
                <th className="text-left text-xs font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-wider px-5 py-3 w-12">#</th>
                <th className="text-left text-xs font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-wider px-5 py-3">Producto</th>
                <th className="text-right text-xs font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-wider px-5 py-3">Unidades</th>
                <th className="text-right text-xs font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-wider px-5 py-3">Ingresos</th>
                <th className="text-right text-xs font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-wider px-5 py-3">Pedidos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-slate-800">
              {products.map((p) => (
                <tr
                  key={p.product_id}
                  className="hover:bg-stone-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      p.rank === 1
                        ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        : p.rank === 2
                        ? "bg-stone-100 dark:bg-slate-700 text-stone-500 dark:text-slate-300"
                        : p.rank === 3
                        ? "bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400"
                        : "text-stone-400 dark:text-slate-500"
                    }`}>
                      {p.rank}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-stone-800 dark:text-slate-200">
                    {p.product_name}
                  </td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-stone-700 dark:text-slate-300">
                    {p.total_quantity.toLocaleString("es-CL")}
                  </td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-stone-700 dark:text-slate-300">
                    {clpFull(p.total_revenue)}
                  </td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-stone-500 dark:text-slate-400">
                    {p.order_count.toLocaleString("es-CL")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
