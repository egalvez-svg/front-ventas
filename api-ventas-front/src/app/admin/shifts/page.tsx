"use client";

import { Authenticated } from "@refinedev/core";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Loader2,
  PlayCircle,
  StopCircle,
  CalendarClock,
  AlertCircle,
  Banknote,
} from "lucide-react";
import { useCurrentShift, useOpenShift, useCloseShift } from "@/hooks/useShifts";
import { useState, useEffect } from "react";

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

function ShiftsContent() {
  const [branchId, setBranchId] = useState<number | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setBranchId(Number(localStorage.getItem("branch_id")) || null);
    setRole(localStorage.getItem("user_role"));
  }, []);

  const isManager = role === "manager" || role === "admin";

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

  return (
    <div className="p-8 min-h-full text-stone-900 dark:text-slate-100">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin" className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors text-stone-400 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Clock className="w-8 h-8 text-amber-500" />
        <h1 className="text-3xl font-bold">Gestión de Turnos</h1>
      </div>

      {isLoading && (
        <div className="flex items-center gap-3 text-stone-400 dark:text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Consultando turno activo…</span>
        </div>
      )}

      {!isLoading && isError && (
        <div className="flex items-center gap-3 text-rose-500 dark:text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>No se pudo obtener el estado del turno.</span>
        </div>
      )}

      {!isLoading && !isError && (
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
      )}
    </div>
  );
}
