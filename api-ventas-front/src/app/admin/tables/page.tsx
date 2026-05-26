"use client";

import { Authenticated } from "@refinedev/core";
import { useState, useEffect } from "react";
import { Grid3x3, Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import { useTables, useCreateTable, useUpdateTable, useDeleteTable, type Table, type TablePayload } from "@/hooks/useTables";
import { useBranches } from "@/hooks/useBranches";


type Modal =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit', item: Table }
  | { mode: 'delete', item: Table };

export default function TablesPage() {
  return (
    <Authenticated
      key="tables-page"
      loading={
        <div className="min-h-screen bg-stone-100 dark:bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        </div>
      }
    >
      <TablesContent />
    </Authenticated>
  );
}

function TablesContent() {
  const { data: branches, isLoading: branchesLoading } = useBranches();
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

  useEffect(() => {
    if (branches?.length && selectedBranchId === null) {
      setSelectedBranchId(branches[0].id);
    }
  }, [branches, selectedBranchId]);

  const { data: tables, isLoading: tablesLoading, isError } = useTables(selectedBranchId);
  const createTable = useCreateTable();
  const updateTable = useUpdateTable();
  const deleteTable = useDeleteTable();

  const [modal, setModal] = useState<Modal>({ mode: 'closed' });
  const [form, setForm] = useState<TablePayload>({ number: 0, status: "available" });

  const isPending = createTable.isPending || updateTable.isPending || deleteTable.isPending;

  const openCreate = () => { setForm({ number: 0, status: "available" }); setModal({ mode: 'create' }); };
  const openEdit = (item: Table) => { setForm({ number: item.number, status: item.status }); setModal({ mode: 'edit', item }); };
  const openDelete = (item: Table) => setModal({ mode: 'delete', item });
  const close = () => { if (isPending) return; setModal({ mode: 'closed' }); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBranchId === null) return;
    if (modal.mode === 'create') {
      await createTable.mutateAsync({ branchId: selectedBranchId, payload: form });
    } else if (modal.mode === 'edit') {
      await updateTable.mutateAsync({ branchId: selectedBranchId, tableId: modal.item.id, payload: form });
    }
    close();
  };

  const handleDelete = async () => {
    if (modal.mode !== 'delete' || selectedBranchId === null) return;
    await deleteTable.mutateAsync({ branchId: selectedBranchId, tableId: modal.item.id });
    close();
  };

  return (
    <div className="min-h-full text-stone-900 dark:text-slate-50">
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-slate-800/70 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <Grid3x3 className="w-5 h-5 text-amber-500" />
          <h1 className="text-base font-bold text-stone-900 dark:text-white">Gestión de Mesas</h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedBranchId || ""}
            onChange={(e) => setSelectedBranchId(Number(e.target.value))}
            className="appearance-none bg-stone-100 dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm text-stone-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
          >
            {!branches?.length && branchesLoading ? (
              <option>Cargando...</option>
            ) : (
              branches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)
            )}
          </select>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95 text-sm shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            Nueva Mesa
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {tablesLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-stone-400 dark:text-slate-500">
            <X className="w-12 h-12 text-rose-400/50" />
            <p>Error al cargar las mesas</p>
          </div>
        ) : !tables?.length ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-stone-400 dark:text-slate-500">
            <Grid3x3 className="w-12 h-12 opacity-20" />
            <p>No hay mesas configuradas en esta sucursal</p>
          </div>
        ) : (
          <>
            {/* Summary strip */}
            <div className="flex gap-3 flex-wrap">
              {[
                { label: 'Total', count: tables.length, color: 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300' },
                { label: 'Libres', count: tables.filter(t => t.status === 'available').length, color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
                { label: 'Ocupadas', count: tables.filter(t => t.status === 'occupied').length, color: 'bg-rose-500/10 text-rose-700 dark:text-rose-400' },
                { label: 'Reservadas', count: tables.filter(t => t.status === 'reserved').length, color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400' },
              ].map(({ label, count, color }) => (
                <div key={label} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${color}`}>
                  <span className="text-lg font-bold">{count}</span>
                  <span className="opacity-70">{label}</span>
                </div>
              ))}
            </div>

            {/* Table grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {tables.map((table) => {
                const cfg =
                  table.status === 'occupied'
                    ? { accent: 'bg-rose-500', ring: 'border-rose-200 dark:border-rose-900/60', icon: 'bg-rose-500/15 text-rose-600 dark:text-rose-400', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', label: 'Ocupada' }
                    : table.status === 'reserved'
                    ? { accent: 'bg-amber-500', ring: 'border-amber-200 dark:border-amber-900/60', icon: 'bg-amber-500/15 text-amber-600 dark:text-amber-400', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', label: 'Reservada' }
                    : { accent: 'bg-emerald-500', ring: 'border-stone-200 dark:border-slate-700/80', icon: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400', label: 'Libre' };

                return (
                  <div
                    key={table.id}
                    className={`group flex flex-col bg-white dark:bg-slate-900 border-2 ${cfg.ring} rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 dark:hover:shadow-slate-950/60`}
                  >
                    {/* Status accent bar */}
                    <div className={`h-1 w-full ${cfg.accent}`} />

                    {/* Content */}
                    <div className="flex flex-col items-center gap-2 px-4 pt-5 pb-4 flex-1">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.icon}`}>
                        <Grid3x3 className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-bold text-stone-800 dark:text-slate-100 text-center leading-tight line-clamp-2">
                        {table.number}
                      </p>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    </div>

                    {/* Action bar */}
                    <div className="flex border-t border-stone-100 dark:border-slate-800">
                      <button
                        onClick={() => openEdit(table)}
                        className="flex-1 py-2.5 flex items-center justify-center gap-1 text-stone-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-medium">Editar</span>
                      </button>
                      <div className="w-px bg-stone-100 dark:bg-slate-800" />
                      <button
                        onClick={() => openDelete(table)}
                        className="flex-1 py-2.5 flex items-center justify-center gap-1 text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-medium">Eliminar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Create / Edit Modal */}
      {(modal.mode === 'create' || modal.mode === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 dark:bg-slate-950/80 backdrop-blur-sm" onClick={close} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-3xl shadow-2xl p-8">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-6">
              {modal.mode === 'create' ? 'Nueva Mesa' : 'Editar Mesa'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-500 dark:text-slate-400 uppercase tracking-wider">Número / Nombre</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ej: 15 o Terraza 1"
                  value={form.number}
                  onChange={(e) => setForm(p => ({ ...p, number: Number(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 bg-stone-100 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-500 dark:text-slate-400 uppercase tracking-wider">Estado Inicial</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm(p => ({ ...p, status: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-stone-100 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                >
                  <option value="available">Disponible</option>
                  <option value="occupied">Ocupada</option>
                  <option value="reserved">Reservada</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={close} disabled={isPending} className="flex-1 py-3 border border-stone-200 dark:border-slate-700 rounded-xl text-stone-500 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isPending} className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {modal.mode === 'delete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 dark:bg-slate-950/80 backdrop-blur-sm" onClick={close} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-3xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-2">¿Eliminar mesa {modal.item.number}?</h2>
            <p className="text-stone-500 dark:text-slate-400 text-sm mb-8">Esta acción no se puede deshacer y puede afectar pedidos activos.</p>
            <div className="flex gap-3">
              <button onClick={close} disabled={isPending} className="flex-1 py-3 border border-stone-200 dark:border-slate-700 rounded-xl text-stone-500 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={isPending} className="flex-1 py-3 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
