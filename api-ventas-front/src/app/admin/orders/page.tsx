"use client";

import { Authenticated } from "@refinedev/core";
import { useState, useMemo } from "react";
import Link from "next/link";
import { ClipboardList, ArrowLeft, Loader2, X, ChevronRight, Search } from "lucide-react";
import {
  useOrders,
  useUpdateOrderStatus,
  ORDER_STATUSES,
  type Order,
  type OrderStatus,
} from "@/hooks/useOrders";

const STATUS_CONFIG: Record<OrderStatus, { label: string; classes: string }> = {
  pending:   { label: "Pendiente",   classes: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30" },
  cooking:   { label: "En cocina",   classes: "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/30" },
  served:    { label: "Servido",     classes: "text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/30" },
  delivered: { label: "Entregado",   classes: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30" },
  paid:      { label: "Pagado",      classes: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  cancelled: { label: "Cancelado",   classes: "text-stone-500 dark:text-slate-500 bg-stone-100 dark:bg-slate-500/10 border-stone-300 dark:border-slate-500/30" },
};

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending:   ["cooking", "cancelled"],
  cooking:   ["served", "cancelled"],
  served:    ["delivered", "paid"],
  delivered: ["paid"],
  paid:      [],
  cancelled: [],
};

type FilterTab = "all" | OrderStatus;

export default function AdminOrdersPage() {
  return (
    <Authenticated
      key="admin-orders-page"
      loading={
        <div className="min-h-screen bg-stone-100 dark:bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        </div>
      }
    >
      <OrdersContent />
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

function OrdersContent() {
  const branchId = useBranchId();
  const [tab, setTab] = useState<FilterTab>("all");
  const [selected, setSelected] = useState<Order | null>(null);
  const [search, setSearch] = useState("");

  const status = tab === "all" ? undefined : tab;
  const { data: orders, isLoading, isError } = useOrders(branchId, status);

  const filteredOrders = useMemo(
    () =>
      (orders ?? []).filter(
        (o) =>
          String(o.id).includes(search) ||
          String(o.table_number ?? o.table_id).includes(search)
      ),
    [orders, search]
  );
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = (order: Order, newStatus: OrderStatus) => {
    if (!branchId) return;
    updateStatus.mutate(
      { branchId, orderId: order.id, status: newStatus },
      { onSuccess: (updated) => setSelected(updated) }
    );
  };

  const tabs: Array<{ key: FilterTab; label: string }> = [
    { key: "all", label: "Todos" },
    ...ORDER_STATUSES.map((s) => ({ key: s as FilterTab, label: STATUS_CONFIG[s].label })),
  ];

  return (
    <div className="min-h-full text-stone-900 dark:text-slate-50 p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin"
          className="flex items-center gap-1.5 text-stone-400 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-200 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Admin
        </Link>
        <div className="w-px h-5 bg-stone-300 dark:bg-slate-700" />
        <div className="flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-amber-500" />
          <h1 className="text-2xl font-bold">Pedidos</h1>
        </div>
      </div>

      {branchId === null ? (
        <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl p-8 max-w-sm">
          <p className="text-sm text-stone-500 dark:text-slate-400">Tu cuenta no tiene una sucursal asignada.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por mesa o #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-stone-100 dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-xl text-sm text-stone-900 dark:text-slate-100 placeholder-stone-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all w-56"
              />
            </div>
          </div>
          <div className="flex gap-1.5 mb-6 flex-wrap">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  tab === key
                    ? "bg-amber-500 text-white"
                    : "bg-white dark:bg-slate-800 text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-200 border border-stone-200 dark:border-transparent"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-stone-400 dark:text-slate-500">
                <X className="w-10 h-10 text-rose-500/50" />
                <p>Error al cargar los pedidos</p>
              </div>
            ) : !filteredOrders.length ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-stone-400 dark:text-slate-500">
                <ClipboardList className="w-10 h-10 opacity-30" />
                <p>{search ? "Sin resultados" : `No hay pedidos${tab !== "all" ? ` con estado "${STATUS_CONFIG[tab as OrderStatus]?.label}"` : ""}`}</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-slate-800 text-stone-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                    <th className="text-left px-6 py-4 font-medium">#</th>
                    <th className="text-left px-6 py-4 font-medium">Mesa</th>
                    <th className="text-left px-6 py-4 font-medium">Estado</th>
                    <th className="text-left px-6 py-4 font-medium">Items</th>
                    <th className="text-left px-6 py-4 font-medium">Hora</th>
                    <th className="px-6 py-4 font-medium w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-slate-800/50">
                  {filteredOrders.map((order) => {
                    const cfg = STATUS_CONFIG[order.status];
                    return (
                      <tr
                        key={order.id}
                        onClick={() => setSelected(order)}
                        className="hover:bg-stone-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 font-mono text-stone-500 dark:text-slate-400">#{order.id}</td>
                        <td className="px-6 py-4 font-bold text-stone-800 dark:text-slate-200">
                          Mesa {order.table_number ?? order.table_id}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-lg border text-xs font-semibold ${cfg.classes}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-stone-500 dark:text-slate-400">
                          {order.items.length} ítem{order.items.length !== 1 ? "s" : ""}
                        </td>
                        <td className="px-6 py-4 text-stone-500 dark:text-slate-400">
                          {new Date(order.created_at).toLocaleTimeString("es-CL", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <ChevronRight className="w-4 h-4 text-stone-300 dark:text-slate-600" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {selected && (
        <ModalOverlay onClose={() => setSelected(null)}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white">Pedido #{selected.id}</h2>
              <p className="text-sm text-stone-500 dark:text-slate-400">
                Mesa {selected.table_number ?? selected.table_id}
              </p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-stone-400 dark:text-slate-500 hover:text-stone-700 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-5">
            <span className={`inline-flex px-3 py-1.5 rounded-xl border text-sm font-semibold ${STATUS_CONFIG[selected.status].classes}`}>
              {STATUS_CONFIG[selected.status].label}
            </span>
          </div>

          <div className="space-y-2 mb-6">
            <p className="text-xs font-medium text-stone-400 dark:text-slate-400 uppercase tracking-wider mb-3">
              Ítems
            </p>
            {selected.items.map((item, i) => (
              <div
                key={i}
                className="bg-stone-50 dark:bg-slate-800/50 border border-stone-100 dark:border-transparent rounded-xl px-4 py-3 flex items-start justify-between gap-4"
              >
                <div>
                  <p className="font-medium text-stone-800 dark:text-slate-200">{item.product_name}</p>
                  {item.notes && (
                    <p className="text-xs text-stone-400 dark:text-slate-500 mt-0.5">{item.notes}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-stone-900 dark:text-white">×{item.quantity}</p>
                  {item.unit_price > 0 && (
                    <p className="text-xs text-stone-400 dark:text-slate-400">
                      ${(item.unit_price * item.quantity).toLocaleString("es-CL")}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {selected.total != null && selected.total > 0 && (
              <div className="flex justify-end pt-2 gap-2 text-sm">
                <span className="text-stone-400 dark:text-slate-400">Total:</span>
                <span className="font-bold text-stone-900 dark:text-white">
                  ${selected.total.toLocaleString("es-CL")}
                </span>
              </div>
            )}
          </div>

          {branchId && STATUS_TRANSITIONS[selected.status].length > 0 && (
            <div>
              <p className="text-xs font-medium text-stone-400 dark:text-slate-400 uppercase tracking-wider mb-3">
                Cambiar estado
              </p>
              <div className="flex gap-2 flex-wrap">
                {STATUS_TRANSITIONS[selected.status].map((next) => (
                  <button
                    key={next}
                    onClick={() => handleStatusChange(selected, next)}
                    disabled={updateStatus.isPending}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 ${
                      next === "cancelled"
                        ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-500 dark:text-rose-400 border border-rose-500/30"
                        : "bg-amber-500 hover:bg-amber-400 text-white"
                    }`}
                  >
                    {updateStatus.isPending && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    → {STATUS_CONFIG[next].label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </ModalOverlay>
      )}
    </div>
  );
}

function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 dark:bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
