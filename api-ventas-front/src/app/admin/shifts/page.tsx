"use client";

import { Authenticated } from "@refinedev/core";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useAdminBranch } from "@/providers/AdminBranchContext";
import {
  ArrowLeft, Clock, Loader2, PlayCircle, StopCircle,
  CalendarClock, AlertCircle, Banknote, History, X,
  ChevronLeft, ChevronRight, TrendingUp, ShoppingBag, Receipt,
} from "lucide-react";
import {
  useCurrentShift, useOpenShift, useCloseShift,
  useShifts, useShiftOrders,
  type Shift,
} from "@/hooks/useShifts";
import type { Order, OrderStatus } from "@/hooks/useOrders";

export default function ShiftsPage() {
  return (
    <Authenticated
      key="shifts-page"
      loading={
        <div className="min-h-screen bg-stone-100 dark:bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        </div>
      }
    >
      <ShiftsContent />
    </Authenticated>
  );
}

function CurrencyInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm text-stone-500 dark:text-slate-400 mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-slate-500 text-sm">$</span>
        <input
          type="number"
          min="0"
          step="100"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-stone-100 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl pl-7 pr-4 py-2.5 text-stone-900 dark:text-slate-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
          placeholder="0"
        />
      </div>
    </div>
  );
}

function TabButton({
  active, onClick, children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-all ${
        active
          ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5"
          : "border-transparent text-stone-400 dark:text-slate-500 hover:text-stone-600 dark:hover:text-slate-300"
      }`}
    >
      {children}
    </button>
  );
}

function ShiftsContent() {
  const { selectedBranchId: branchId, role } = useAdminBranch();
  const [tab, setTab] = useState<"current" | "history">("current");

  const isManager = role === "manager" || role === "admin";

  return (
    <div className="p-8 min-h-full text-stone-900 dark:text-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors text-stone-400 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Clock className="w-8 h-8 text-amber-500" />
        <h1 className="text-3xl font-bold">Gestión de Turnos</h1>
      </div>

      <div className="flex gap-1 border-b border-stone-200 dark:border-slate-700 mb-6">
        <TabButton active={tab === "current"} onClick={() => setTab("current")}>
          <Clock className="w-3.5 h-3.5" />
          Turno actual
        </TabButton>
        <TabButton active={tab === "history"} onClick={() => setTab("history")}>
          <History className="w-3.5 h-3.5" />
          Historial
        </TabButton>
      </div>

      {tab === "current" ? (
        <CurrentShiftPanel branchId={branchId} isManager={isManager} />
      ) : branchId ? (
        <ShiftHistoryPanel branchId={branchId} />
      ) : (
        <p className="text-sm text-stone-400 dark:text-slate-500">Sin sucursal asignada.</p>
      )}
    </div>
  );
}

function CurrentShiftPanel({ branchId, isManager }: { branchId: number | null; isManager: boolean }) {
  const { data: shift, isLoading, isError } = useCurrentShift(branchId);
  const openShift = useOpenShift();
  const closeShift = useCloseShift();

  const [initialCash, setInitialCash] = useState("");
  const [actualCash, setActualCash] = useState("");
  const [showCloseForm, setShowCloseForm] = useState(false);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" });
  }

  function formatCurrency(n: number) {
    return n.toLocaleString("es-CL", { style: "currency", currency: "CLP" });
  }

  function duration(from: string) {
    const minutes = Math.floor((Date.now() - new Date(from).getTime()) / 60_000);
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  const handleOpen = () => {
    if (!branchId) return;
    const cash = parseFloat(initialCash);
    if (isNaN(cash) || cash < 0) return;
    openShift.mutate({ branchId, initial_cash: cash }, { onSuccess: () => setInitialCash("") });
  };

  const handleClose = () => {
    if (!branchId) return;
    const cash = parseFloat(actualCash);
    if (isNaN(cash) || cash < 0) return;
    closeShift.mutate({ branchId, actual_cash: cash }, { onSuccess: () => { setActualCash(""); setShowCloseForm(false); } });
  };

  const difference =
    shift?.initial_cash != null && actualCash !== ""
      ? parseFloat(actualCash) - shift.initial_cash
      : null;

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 text-stone-400 dark:text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Consultando turno activo…</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-3 text-rose-500 dark:text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span>No se pudo obtener el estado del turno.</span>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-6">
      {shift?.is_active ? (
        <div className="bg-white dark:bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-600 dark:text-emerald-300 text-lg">Turno activo</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-stone-400 dark:text-slate-500 mb-0.5">Abierto</p>
              <p className="text-stone-800 dark:text-slate-200 font-medium">{formatDate(shift.opened_at)}</p>
            </div>
            <div>
              <p className="text-stone-400 dark:text-slate-500 mb-0.5">Duración</p>
              <p className="text-stone-800 dark:text-slate-200 font-medium flex items-center gap-1.5">
                <CalendarClock className="w-4 h-4 text-amber-500" />
                {duration(shift.opened_at)}
              </p>
            </div>
            <div>
              <p className="text-stone-400 dark:text-slate-500 mb-0.5">Fondo inicial</p>
              <p className="text-stone-800 dark:text-slate-200 font-medium flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-amber-500" />
                {formatCurrency(shift.initial_cash)}
              </p>
            </div>
            <div>
              <p className="text-stone-400 dark:text-slate-500 mb-0.5">ID turno</p>
              <p className="text-stone-800 dark:text-slate-200 font-medium">#{shift.id}</p>
            </div>
          </div>

          {isManager && (
            <div className="pt-1 border-t border-stone-100 dark:border-slate-800">
              {!showCloseForm ? (
                <button
                  onClick={() => setShowCloseForm(true)}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/40 text-rose-500 dark:text-rose-300 rounded-xl text-sm font-medium transition-colors"
                >
                  <StopCircle className="w-4 h-4" />
                  Cerrar turno (arqueo)
                </button>
              ) : (
                <div className="mt-4 space-y-4">
                  <CurrencyInput label="Efectivo en caja al cierre (arqueo)" value={actualCash} onChange={setActualCash} />

                  {difference !== null && (
                    <div className={`text-sm px-4 py-2.5 rounded-xl border ${difference >= 0 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300" : "bg-rose-500/10 border-rose-500/30 text-rose-500 dark:text-rose-300"}`}>
                      Diferencia: <span className="font-semibold">{difference >= 0 ? "+" : ""}{formatCurrency(difference)}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleClose}
                      disabled={closeShift.isPending || actualCash === ""}
                      className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      {closeShift.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <StopCircle className="w-4 h-4" />}
                      Confirmar cierre
                    </button>
                    <button
                      onClick={() => { setShowCloseForm(false); setActualCash(""); }}
                      className="px-4 py-2 bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-stone-300 dark:bg-slate-600" />
            <span className="font-semibold text-stone-400 dark:text-slate-400 text-lg">Sin turno activo</span>
          </div>
          <p className="text-sm text-stone-400 dark:text-slate-500">
            {isManager ? "Ingresa el fondo inicial para abrir la caja." : "Contacta a un encargado para abrir el turno."}
          </p>

          {isManager && (
            <div className="space-y-4">
              <CurrencyInput label="Fondo inicial de caja" value={initialCash} onChange={setInitialCash} />
              <button
                onClick={handleOpen}
                disabled={openShift.isPending || initialCash === ""}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors shadow-md shadow-amber-500/20"
              >
                {openShift.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                Abrir caja
              </button>
            </div>
          )}
        </div>
      )}

      {!isManager && (
        <p className="text-xs text-stone-400 dark:text-slate-600">
          Solo los managers pueden abrir o cerrar turnos.
        </p>
      )}
    </div>
  );
}

function ShiftHistoryPanel({ branchId }: { branchId: number }) {
  const limit = 20;
  const [skip, setSkip] = useState(0);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const { data: shifts, isLoading, isFetching } = useShifts(branchId, skip, limit);

  const hasMore = (shifts?.length ?? 0) === limit;
  const hasPrev = skip > 0;
  const page = Math.floor(skip / limit) + 1;

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" });
  }

  function formatCurrency(n: number) {
    return `$${n.toLocaleString("es-CL")}`;
  }

  function shiftDuration(from: string, to: string | null) {
    const end = to ? new Date(to).getTime() : Date.now();
    const minutes = Math.floor((end - new Date(from).getTime()) / 60_000);
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!shifts?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-stone-400 dark:text-slate-500">
        <History className="w-12 h-12 opacity-30" />
        <p className="text-sm">No hay turnos registrados.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[3rem_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-stone-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-widest text-stone-400 dark:text-slate-500">
          <span>#</span>
          <span>Apertura</span>
          <span>Cierre</span>
          <span>Fondo inicial</span>
          <span>Arqueo</span>
          <span />
        </div>

        {/* Rows */}
        {shifts.map((shift, i) => (
          <div
            key={shift.id}
            className={`grid grid-cols-[3rem_1fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-3.5 text-sm ${
              i !== shifts.length - 1 ? "border-b border-stone-100 dark:border-slate-800" : ""
            } hover:bg-stone-50 dark:hover:bg-slate-800/50 transition-colors`}
          >
            <span className="font-bold text-stone-500 dark:text-slate-400">{shift.id}</span>

            <div>
              <p className="text-stone-800 dark:text-slate-200 font-medium">{formatDate(shift.opened_at)}</p>
              <p className="text-[11px] text-stone-400 dark:text-slate-500 mt-0.5">
                <CalendarClock className="w-3 h-3 inline mr-1" />
                {shiftDuration(shift.opened_at, shift.closed_at)}
              </p>
            </div>

            <div>
              {shift.closed_at ? (
                <p className="text-stone-700 dark:text-slate-300">{formatDate(shift.closed_at)}</p>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Activo
                </span>
              )}
            </div>

            <span className="text-stone-700 dark:text-slate-300 font-medium">
              {formatCurrency(shift.initial_cash)}
            </span>

            <span className={shift.actual_cash != null ? "text-stone-700 dark:text-slate-300 font-medium" : "text-stone-300 dark:text-slate-600"}>
              {shift.actual_cash != null ? formatCurrency(shift.actual_cash) : "—"}
            </span>

            <button
              onClick={() => setSelectedShift(shift)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold transition-colors border border-amber-500/20"
            >
              <Receipt className="w-3.5 h-3.5" />
              Ver pedidos
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setSkip((s) => Math.max(0, s - limit))}
          disabled={!hasPrev || isFetching}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 dark:border-slate-700 text-sm font-medium text-stone-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </button>

        <div className="flex items-center gap-2 text-sm text-stone-400 dark:text-slate-500">
          {isFetching && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Página {page}
        </div>

        <button
          onClick={() => setSkip((s) => s + limit)}
          disabled={!hasMore || isFetching}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 dark:border-slate-700 text-sm font-medium text-stone-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {selectedShift && (
        <ShiftOrdersModal
          branchId={branchId}
          shift={selectedShift}
          onClose={() => setSelectedShift(null)}
        />
      )}
    </>
  );
}

const ORDER_STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  pending:   { label: "Pendiente",  cls: "bg-stone-100 text-stone-600 dark:bg-slate-700 dark:text-slate-300" },
  cooking:   { label: "Cocinando",  cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
  served:    { label: "Servido",    cls: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400" },
  delivered: { label: "Entregado",  cls: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400" },
  paid:      { label: "Cobrado",    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
  cancelled: { label: "Cancelado",  cls: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400" },
};

function ShiftOrdersModal({
  branchId, shift, onClose,
}: {
  branchId: number;
  shift: Shift;
  onClose: () => void;
}) {
  const { data: orders, isLoading } = useShiftOrders(branchId, shift.id);

  const { totalCobrado, totalPedidos, paidCount, cancelledCount } = useMemo(() => {
    if (!orders) return { totalCobrado: 0, totalPedidos: 0, paidCount: 0, cancelledCount: 0 };
    let cobrado = 0, paid = 0, cancelled = 0;
    for (const o of orders) {
      if (o.status === "paid") { cobrado += o.total ?? 0; paid++; }
      if (o.status === "cancelled") cancelled++;
    }
    return { totalCobrado: cobrado, totalPedidos: orders.length, paidCount: paid, cancelledCount: cancelled };
  }, [orders]);

  const sorted = useMemo(
    () => [...(orders ?? [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [orders]
  );

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-stone-100 dark:border-slate-800 flex-shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-slate-500">Turno</p>
            <h2 className="text-xl font-bold text-stone-900 dark:text-white mt-0.5">#{shift.id}</h2>
            <p className="text-sm text-stone-500 dark:text-slate-400 mt-1">
              {formatDate(shift.opened_at)}
              {shift.closed_at && <> → {formatDate(shift.closed_at)}</>}
            </p>
          </div>
          <button onClick={onClose} className="text-stone-400 dark:text-slate-500 hover:text-stone-700 dark:hover:text-slate-300 transition-colors mt-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 px-6 py-4 border-b border-stone-100 dark:border-slate-800 flex-shrink-0">
          <div className="bg-stone-50 dark:bg-slate-800/50 rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-slate-500">Pedidos</p>
            <p className="text-2xl font-black text-stone-900 dark:text-white mt-1">{totalPedidos}</p>
            <p className="text-[11px] text-stone-400 dark:text-slate-500 mt-0.5">{cancelledCount} cancelado{cancelledCount !== 1 ? "s" : ""}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500">Cobrado</p>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
              ${totalCobrado.toLocaleString("es-CL")}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-[11px] text-emerald-600 dark:text-emerald-500">{paidCount} pagado{paidCount !== 1 ? "s" : ""}</span>
            </div>
          </div>
          <div className="bg-stone-50 dark:bg-slate-800/50 rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-slate-500">Caja</p>
            <p className="text-lg font-black text-stone-700 dark:text-slate-300 mt-1">
              ${shift.initial_cash.toLocaleString("es-CL")}
            </p>
            <p className="text-[11px] text-stone-400 dark:text-slate-500 mt-0.5">
              {shift.actual_cash != null
                ? `Arqueo: $${shift.actual_cash.toLocaleString("es-CL")}`
                : "Sin arqueo"}
            </p>
          </div>
        </div>

        {/* Orders list */}
        <div className="overflow-y-auto flex-1 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
            </div>
          ) : !sorted.length ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-stone-400 dark:text-slate-500">
              <ShoppingBag className="w-10 h-10 opacity-30" />
              <p className="text-sm">Sin pedidos en este turno.</p>
            </div>
          ) : (
            sorted.map((order, i) => {
              const style = ORDER_STATUS_STYLE[order.status] ?? ORDER_STATUS_STYLE.pending;
              const time = new Date(order.created_at).toLocaleTimeString("es-CL", {
                hour: "2-digit", minute: "2-digit",
              });
              const isDirect = order.table_id == null;
              return (
                <div
                  key={order.id}
                  className={`flex items-center gap-4 px-6 py-3 ${
                    i !== sorted.length - 1 ? "border-b border-stone-100 dark:border-slate-800" : ""
                  }`}
                >
                  <span className="text-sm font-black text-stone-400 dark:text-slate-500 w-10 flex-shrink-0">
                    #{order.id}
                  </span>
                  <div className="flex-1 min-w-0">
                    {isDirect ? (
                      <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                        <ShoppingBag className="w-3 h-3" />
                        Llevar
                      </div>
                    ) : (
                      <p className="text-sm text-stone-600 dark:text-slate-300">
                        Mesa {order.table_number ?? order.table_id}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${style.cls}`}>
                    {style.label}
                  </span>
                  <span className="text-sm font-bold text-stone-900 dark:text-white flex-shrink-0 w-24 text-right">
                    {order.total != null ? `$${order.total.toLocaleString("es-CL")}` : "—"}
                  </span>
                  <span className="text-[11px] text-stone-400 dark:text-slate-500 flex-shrink-0 w-11 text-right">
                    {time}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
