"use client";

import { Authenticated } from "@refinedev/core";
import { useState, useEffect, useMemo } from "react";
import { ChefHat, Loader2, RefreshCw, CheckCircle2, Clock, Store, AlertTriangle, MessageSquare, BellRing } from "lucide-react";
import { useKitchenOrders, useOrders, useUpdateOrderStatus, type Order } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { AppHeader } from "@/components/AppHeader";
import { RoleGuard } from "@/components/RoleGuard";
import { ROUTE_ROLES } from "@/lib/roles";

export default function KitchenPage() {
  return (
    <Authenticated
      key="kitchen-page"
      loading={
        <div className="min-h-screen bg-stone-50 dark:bg-[#080c18] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        </div>
      }
    >
      <RoleGuard allowedRoles={ROUTE_ROLES.kitchen}>
        <KitchenContent />
      </RoleGuard>
    </Authenticated>
  );
}

function useBranchId() {
  const [branchId] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const id = localStorage.getItem("branch_id");
    return id ? Number(id) : null;
  });
  return branchId;
}

function elapsed(createdAt: string): { text: string; mins: number } {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const mins = Math.floor(diffMs / 60_000);
  const secs = Math.floor((diffMs % 60_000) / 1000);
  return {
    mins,
    text: mins < 1 ? `${secs}s` : mins === 1 ? "1 min" : `${mins} min`,
  };
}

function urgency(mins: number): "ok" | "warn" | "urgent" {
  if (mins >= 15) return "urgent";
  if (mins >= 8) return "warn";
  return "ok";
}

const URGENCY_STYLES = {
  ok: {
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5",
    glow: "",
    timer: "text-emerald-400",
    timerBg: "bg-emerald-500/10",
    badge: "Nuevo",
    badgeColor: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    icon: <Clock className="w-3 h-3" />,
  },
  warn: {
    border: "border-amber-500/50",
    bg: "bg-amber-500/5",
    glow: "",
    timer: "text-amber-400",
    timerBg: "bg-amber-500/10",
    badge: "Atención",
    badgeColor: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  urgent: {
    border: "border-rose-500/60",
    bg: "bg-rose-500/8",
    glow: "shadow-rose-500/20 shadow-lg",
    timer: "text-rose-400",
    timerBg: "bg-rose-500/10",
    badge: "¡Urgente!",
    badgeColor: "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30",
    icon: <AlertTriangle className="w-3 h-3" />,
  },
};

function KitchenContent() {
  const branchId = useBranchId();
  const { data: orders, isLoading, isFetching, isError, dataUpdatedAt } =
    useKitchenOrders(branchId);
  const { data: servedOrders } = useOrders(branchId, "served", 4_000);
  const readyForPickup = useMemo(
    () => (servedOrders ?? []).filter((o) => o.table_id !== null),
    [servedOrders]
  );
  const updateStatus = useUpdateOrderStatus();
  const { data: products } = useProducts(branchId, { active_only: true });
  const [tick, setTick] = useState(0);

  const productMap = useMemo<Record<number, string>>(
    () => Object.fromEntries((products ?? []).map((p) => [p.id, p.name])),
    [products]
  );

  // Re-render every 10s to update timers
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 10_000);
    return () => clearInterval(id);
  }, []);

  const markServed = (order: Order) => {
    if (!branchId) return;
    updateStatus.mutate({ branchId, orderId: order.id, status: "served" });
  };

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("es-CL", {
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    })
    : null;

  const pending = orders?.length ?? 0;
  const urgent = orders?.filter((o) => urgency(elapsed(o.created_at).mins) === "urgent").length ?? 0;

  return (
    <div className="h-screen bg-stone-50 dark:bg-[#080c18] text-stone-900 dark:text-slate-50 flex flex-col">
      <AppHeader
        icon={<ChefHat className="w-5 h-5 text-amber-400" />}
        title="Cocina"
        actions={
          <div className="flex items-center gap-2">
            {pending > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-600 dark:text-amber-400 font-bold">
                <ChefHat className="w-3.5 h-3.5" />
                {pending} pedido{pending !== 1 ? "s" : ""}
              </div>
            )}
            {urgent > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-600 dark:text-rose-400 font-bold animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                {urgent} urgente{urgent !== 1 ? "s" : ""}
              </div>
            )}
            {isFetching && <RefreshCw className="w-3.5 h-3.5 animate-spin text-stone-400 dark:text-slate-500" />}
            {lastUpdated && (
              <span className="text-[10px] text-stone-400 dark:text-slate-600 hidden sm:block">
                {lastUpdated}
              </span>
            )}
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto p-5">
        {branchId === null ? (
          <div className="flex items-center justify-center h-full">
            <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl p-8 max-w-sm text-center">
              <Store className="w-10 h-10 text-stone-400 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-stone-500 dark:text-slate-400 text-sm">Tu cuenta no tiene una sucursal asignada.</p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-full text-stone-400 dark:text-slate-500">
            <p>Error al cargar los pedidos de cocina</p>
          </div>
        ) : (
          <div className="space-y-8">
            {(orders?.length ?? 0) > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {(orders ?? [])
                  .slice()
                  .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                  .map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      productMap={productMap}
                      onServed={() => markServed(order)}
                      isPending={updateStatus.isPending && updateStatus.variables?.orderId === order.id}
                      tick={tick}
                    />
                  ))}
              </div>
            )}

            {readyForPickup.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BellRing className="w-4 h-4 text-sky-500 dark:text-sky-400 animate-pulse" />
                  <h2 className="text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">
                    Listo para retirar — {readyForPickup.length} mesa{readyForPickup.length !== 1 ? "s" : ""}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {readyForPickup
                    .slice()
                    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    .map((order) => (
                      <ReadyCard key={order.id} order={order} productMap={productMap} />
                    ))}
                </div>
              </div>
            )}

            {(orders?.length ?? 0) === 0 && readyForPickup.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-24 h-24 rounded-full bg-stone-200 dark:bg-slate-900/60 flex items-center justify-center">
                  <ChefHat className="w-12 h-12 text-stone-400 dark:text-slate-700 opacity-40" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-stone-500 dark:text-slate-500">Todo al día</p>
                  <p className="text-sm text-stone-400 dark:text-slate-600 mt-1">Los nuevos pedidos aparecerán aquí automáticamente</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function OrderCard({
  order, productMap, onServed, isPending, tick,
}: {
  order: Order;
  productMap: Record<number, string>;
  onServed: () => void;
  isPending: boolean;
  tick: number;
}) {
  void tick;
  const { text: elapsedText, mins } = elapsed(order.created_at);
  const level = urgency(mins);
  const styles = URGENCY_STYLES[level];

  return (
    <div
      className={`rounded-2xl border ${styles.border} ${styles.bg} ${styles.glow} bg-white/70 dark:bg-transparent flex flex-col gap-0 overflow-hidden transition-all`}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200/80 dark:border-white/5">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-stone-400 dark:text-slate-600">Pedido</p>
          <p className="text-2xl font-black text-stone-900 dark:text-white leading-none">#{order.id}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-stone-400 dark:text-slate-600">Mesa</p>
          <p className="text-2xl font-black text-stone-900 dark:text-white leading-none">
            {order.table_number ?? order.table_id}
          </p>
        </div>
      </div>

      {/* Status badge */}
      <div className="px-4 py-2 border-b border-stone-200/80 dark:border-white/5">
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${styles.badgeColor}`}>
          {styles.icon}
          {styles.badge} · {elapsedText}
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 px-4 py-3 space-y-2.5">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="w-7 h-7 rounded-lg bg-stone-200 dark:bg-slate-800/80 border border-stone-300 dark:border-slate-700/50 flex items-center justify-center text-sm font-black text-stone-900 dark:text-white flex-shrink-0">
              {item.quantity}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-stone-800 dark:text-slate-200 leading-tight">
                {item.product_name ?? productMap[item.product_id] ?? `Producto #${item.product_id}`}
              </p>
              {item.notes && (
                <p className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400/90 mt-0.5">
                  <MessageSquare className="w-3 h-3 flex-shrink-0" />
                  {item.notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action */}
      <div className="px-4 pb-4">
        <button
          onClick={onServed}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-black transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-emerald-500/20"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          Listo
        </button>
      </div>
    </div>
  );
}

function ReadyCard({
  order, productMap,
}: {
  order: Order;
  productMap: Record<number, string>;
}) {
  return (
    <div className="rounded-2xl border border-sky-500/40 bg-sky-500/5 bg-white/70 dark:bg-transparent flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200/80 dark:border-white/5">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-stone-400 dark:text-slate-600">Pedido</p>
          <p className="text-2xl font-black text-stone-900 dark:text-white leading-none">#{order.id}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-stone-400 dark:text-slate-600">Mesa</p>
          <p className="text-2xl font-black text-stone-900 dark:text-white leading-none">
            {order.table_number ?? order.table_id}
          </p>
        </div>
      </div>

      <div className="px-4 py-2 border-b border-stone-200/80 dark:border-white/5">
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-600 dark:text-sky-300 border-sky-500/30">
          <BellRing className="w-3 h-3" />
          Listo para retirar
        </div>
      </div>

      <div className="flex-1 px-4 py-3 space-y-2.5">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="w-7 h-7 rounded-lg bg-stone-200 dark:bg-slate-800/80 border border-stone-300 dark:border-slate-700/50 flex items-center justify-center text-sm font-black text-stone-900 dark:text-white flex-shrink-0">
              {item.quantity}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-stone-800 dark:text-slate-200 leading-tight">
                {item.product_name ?? productMap[item.product_id] ?? `Producto #${item.product_id}`}
              </p>
              {item.notes && (
                <p className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400/90 mt-0.5">
                  <MessageSquare className="w-3 h-3 flex-shrink-0" />
                  {item.notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
