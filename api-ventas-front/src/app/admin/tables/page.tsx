"use client";

import { Authenticated } from "@refinedev/core";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Grid3x3, Plus, Pencil, Trash2, ArrowLeft, Loader2, Filter, X, Check, MoreVertical } from "lucide-react";
import { useTables, useCreateTable, useUpdateTable, useDeleteTable, type Table, type TablePayload } from "@/hooks/useTables";
import { useBranches } from "@/hooks/useBranches";
import { AppHeader } from "@/components/AppHeader";

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
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
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
  const [form, setForm] = useState<TablePayload>({ number: "", status: "available" });

  const isPending = createTable.isPending || updateTable.isPending || deleteTable.isPending;

  const openCreate = () => {
    setForm({ number: "", status: "available" });
    setModal({ mode: 'create' });
  };

  const openEdit = (item: Table) => {
    setForm({ number: item.number, status: item.status });
    setModal({ mode: 'edit', item });
  };

  const openDelete = (item: Table) => setModal({ mode: 'delete', item });

  const close = () => {
    if (isPending) return;
    setModal({ mode: 'closed' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBranchId === null) return;

    if (modal.mode === 'create') {
      await createTable.mutateAsync({ branchId: selectedBranchId, payload: form });
    } else if (modal.mode === 'edit') {
      await updateTable.mutateAsync({ 
        branchId: selectedBranchId, 
        tableId: modal.item.id, 
        payload: form 
      });
    }
    close();
  };

  const handleDelete = async () => {
    if (modal.mode !== 'delete' || selectedBranchId === null) return;
    await deleteTable.mutateAsync({ branchId: selectedBranchId, tableId: modal.item.id });
    close();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6">
      <AppHeader
        icon={<Grid3x3 className="w-5 h-5 text-indigo-400" />}
        title="Gestión de Mesas"
        back={{ label: "Admin", href: "/admin" }}
        actions={
          <div className="flex items-center gap-2">
            <select
              value={selectedBranchId || ""}
              onChange={(e) => setSelectedBranchId(Number(e.target.value))}
              className="appearance-none bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            >
              {!branches?.length && branchesLoading ? (
                <option>Cargando...</option>
              ) : (
                branches?.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))
              )}
            </select>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95 text-sm"
            >
              <Plus className="w-4 h-4" />
              Nueva Mesa
            </button>
          </div>
        }
      />

      {/* Grid of Tables */}
      {tablesLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-500">
          <X className="w-12 h-12 text-rose-500/50" />
          <p>Error al cargar las mesas</p>
        </div>
      ) : !tables?.length ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-500">
          <Grid3x3 className="w-12 h-12 opacity-20" />
          <p>No hay mesas configuradas en esta sucursal</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {tables.map((table) => (
            <div 
              key={table.id}
              className={`group relative bg-slate-900 border ${
                table.status === 'occupied' ? 'border-rose-500/50 bg-rose-500/5' : 
                table.status === 'reserved' ? 'border-amber-500/50 bg-amber-500/5' : 
                'border-slate-800'
              } rounded-3xl p-6 transition-all hover:scale-[1.02] hover:shadow-xl shadow-slate-950/50`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  table.status === 'occupied' ? 'bg-rose-500/20 text-rose-400' : 
                  table.status === 'reserved' ? 'bg-amber-500/20 text-amber-400' : 
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  <span className="text-xl font-bold">{table.number}</span>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                  table.status === 'occupied' ? 'bg-rose-500/10 text-rose-500' : 
                  table.status === 'reserved' ? 'bg-amber-500/10 text-amber-500' : 
                  'bg-emerald-500/10 text-emerald-500'
                }`}>
                  {table.status === 'occupied' ? 'Ocupada' : 
                   table.status === 'reserved' ? 'Reservada' : 
                   'Libre'}
                </span>
              </div>

              {/* Actions Overlay */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-1">
                  <button 
                    onClick={() => openEdit(table)}
                    className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => openDelete(table)}
                    className="p-1.5 bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {(modal.mode === 'create' || modal.mode === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={close} />
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-8">
            <h2 className="text-xl font-bold mb-6">
              {modal.mode === 'create' ? 'Nueva Mesa' : 'Editar Mesa'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Número / Nombre</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ej: 15 o Terraza 1"
                  value={form.number}
                  onChange={(e) => setForm(p => ({ ...p, number: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Estado Inicial</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm(p => ({ ...p, status: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                >
                  <option value="available">Disponible</option>
                  <option value="occupied">Ocupada</option>
                  <option value="reserved">Reservada</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={close}
                  disabled={isPending}
                  className="flex-1 py-3 border border-slate-700 rounded-xl text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
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
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={close} />
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">¿Eliminar mesa {modal.item.number}?</h2>
            <p className="text-slate-400 text-sm mb-8">Esta acción no se puede deshacer y puede afectar pedidos activos.</p>
            <div className="flex gap-3">
              <button
                onClick={close}
                disabled={isPending}
                className="flex-1 py-3 border border-slate-700 rounded-xl text-slate-400 hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
