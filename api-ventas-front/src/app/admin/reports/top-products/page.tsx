"use client";

import { Fragment, useState } from "react";
import { Authenticated } from "@refinedev/core";
import { useAdminBranch } from "@/providers/AdminBranchContext";
import { TrendingUp, Loader2, ShoppingCart, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { useTopProductsReport, FrequentlyBoughtWith } from "@/hooks/useReports";

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

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="w-4 h-4 text-amber-400" />;
  if (rank === 2) return <Trophy className="w-4 h-4 text-slate-400" />;
  if (rank === 3) return <Trophy className="w-4 h-4 text-orange-400" />;
  return <span className="text-xs font-medium text-stone-400 dark:text-slate-500">{rank}</span>;
}

function PairingRankIcon({ idx }: { idx: number }) {
  if (idx === 0) return <Trophy className="w-3 h-3 text-amber-400" />;
  if (idx === 1) return <Trophy className="w-3 h-3 text-slate-400" />;
  if (idx === 2) return <Trophy className="w-3 h-3 text-orange-400" />;
  return <span className="text-xs text-stone-400 dark:text-slate-500">{idx + 1}</span>;
}

function PairingsPanel({ pairings }: { pairings: FrequentlyBoughtWith[] }) {
  return (
    <tr className="bg-rose-50 dark:bg-rose-950/20">
      <td colSpan={5} className="px-8 pt-2 pb-5">
        <p className="text-xs font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-wider mb-3">
          Más vendido con este producto:
        </p>
        <div className="space-y-2.5 max-w-lg">
          {pairings.map((fw, idx) => (
            <div key={fw.product_id} className="flex items-center gap-3">
              <div className="w-4 flex items-center justify-center flex-shrink-0">
                <PairingRankIcon idx={idx} />
              </div>
              <span className="text-xs font-semibold text-stone-700 dark:text-slate-300 w-36 truncate">
                {fw.product_name}
              </span>
              <div className="flex-1 h-1.5 bg-stone-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-400 dark:bg-rose-500 rounded-full transition-all"
                  style={{ width: `${Math.min(fw.percentage, 100)}%` }}
                />
              </div>
              <span className="text-xs font-bold text-stone-600 dark:text-slate-300 tabular-nums w-8 text-right">
                {fw.co_order_count}x
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-slate-700 text-xs font-medium text-stone-500 dark:text-slate-400 tabular-nums w-10 justify-center">
                {Math.round(fw.percentage)}%
              </span>
            </div>
          ))}
        </div>
      </td>
    </tr>
  );
}

function TopProductsContent() {
  const { selectedBranchId: branchId } = useAdminBranch();
  const [days, setDays] = useState(30);
  const [limit, setLimit] = useState(10);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: products, isLoading, isError } = useTopProductsReport(branchId, days, limit);

  const totalRevenue = products?.reduce((sum, p) => sum + p.total_revenue, 0) ?? 0;

  function clpFull(n: number) {
    return Math.round(n).toLocaleString("es-CL", { style: "currency", currency: "CLP" });
  }

  function contribution(revenue: number) {
    if (totalRevenue === 0) return 0;
    return Math.round((revenue / totalRevenue) * 100);
  }

  function toggleExpand(productId: number) {
    setExpandedId((prev) => (prev === productId ? null : productId));
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
          <span className="text-xs font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-wider">
            Período
          </span>
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
          <span className="text-xs font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-wider">
            Top
          </span>
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
                <th className="w-12 px-5 py-3" />
                <th className="text-left text-xs font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-wider px-5 py-3">
                  Producto
                </th>
                <th className="text-right text-xs font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-wider px-5 py-3">
                  Cantidad
                </th>
                <th className="text-right text-xs font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-wider px-5 py-3">
                  Valor total
                </th>
                <th className="text-right text-xs font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-wider px-5 py-3">
                  Contribución
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const contrib = contribution(p.total_revenue);
                const isExpanded = expandedId === p.product_id;
                const hasPairings = p.frequently_bought_with?.length > 0;

                return (
                  <Fragment key={p.product_id}>
                    <tr
                      onClick={() => hasPairings && toggleExpand(p.product_id)}
                      className={`border-b border-stone-100 dark:border-slate-800 transition-colors ${
                        hasPairings ? "cursor-pointer" : ""
                      } ${
                        isExpanded
                          ? "bg-rose-50 dark:bg-rose-950/20"
                          : "hover:bg-stone-50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      {/* Rank */}
                      <td className="px-5 py-4 w-12">
                        <div className="flex items-center justify-center">
                          <RankIcon rank={p.rank} />
                        </div>
                      </td>

                      {/* Product + category */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-stone-800 dark:text-slate-200">
                            {p.product_name}
                          </span>
                          {p.category_name && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 dark:bg-slate-700 text-stone-500 dark:text-slate-400">
                              {p.category_name}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="px-5 py-4 text-right tabular-nums text-stone-700 dark:text-slate-300">
                        {p.total_quantity.toLocaleString("es-CL")}
                      </td>

                      {/* Revenue */}
                      <td className="px-5 py-4 text-right tabular-nums text-stone-700 dark:text-slate-300">
                        {clpFull(p.total_revenue)}
                      </td>

                      {/* Contribution */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <div className="relative w-20 h-1.5 bg-stone-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="absolute inset-y-0 left-0 bg-amber-400 dark:bg-amber-500 rounded-full"
                              style={{ width: `${contrib}%` }}
                            />
                          </div>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold tabular-nums min-w-[36px] justify-center ${
                              contrib >= 15
                                ? "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400"
                                : contrib >= 8
                                ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
                                : "bg-stone-100 dark:bg-slate-700 text-stone-500 dark:text-slate-400"
                            }`}
                          >
                            {contrib}%
                          </span>
                          <span className="w-4 flex items-center justify-center text-stone-300 dark:text-slate-600">
                            {hasPairings &&
                              (isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ))}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && hasPairings && (
                      <PairingsPanel pairings={p.frequently_bought_with} />
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
