"use client";

import { Authenticated } from "@refinedev/core";
import { useState } from "react";
import Link from "next/link";
import { Building2, Plus, Pencil, PowerOff, X, Loader2, ArrowLeft, FolderOpen, MapPin, CheckCircle, XCircle } from "lucide-react";
import {
  useBranches,
  useCreateBranch,
  useUpdateBranch,
  useDeleteBranch,
  type Branch,
  type BranchPayload,
} from "@/hooks/useBranches";

type Modal =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; item: Branch }
  | { mode: "delete"; item: Branch };

const EMPTY: BranchPayload = { name: "", address: "" };

export default function BranchesPage() {
  return (
    <Authenticated
      key="branches-page"
      loading={
        <div className="min-h-screen bg-stone-100 dark:bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        </div>
      }
    >
      <BranchesContent />
    </Authenticated>
  );
}

function BranchesContent() {
  const { data: branches, isLoading, isError } = useBranches();
  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();
  const deleteBranch = useDeleteBranch();

  const [modal, setModal] = useState<Modal>({ mode: "closed" });
  const [form, setForm] = useState<BranchPayload>(EMPTY);
  const [formError, setFormError] = useState("");

  const isPending = createBranch.isPending || updateBranch.isPending || deleteBranch.isPending;

  const openCreate = () => { setForm(EMPTY); setFormError(""); setModal({ mode: "create" }); };
  const openEdit = (item: Branch) => { setForm({ name: item.name, address: item.address }); setFormError(""); setModal({ mode: "edit", item }); };
  const openDelete = (item: Branch) => setModal({ mode: "delete", item });
  const close = () => { if (isPending) return; setModal({ mode: "closed" }); };

  const handleApiError = (err: any) => {
    const detail = err.response?.data?.detail;
    setFormError(Array.isArray(detail) ? detail.map((d: any) => d.msg).join(", ") : detail || "Error al guardar");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (modal.mode === "create") {
      createBranch.mutate(form, { onSuccess: close, onError: handleApiError });
    } else if (modal.mode === "edit") {
      updateBranch.mutate({ id: modal.item.id, payload: form }, { onSuccess: close, onError: handleApiError });
    }
  };

  const handleDeactivate = () => {
    if (modal.mode !== "delete") return;
    deleteBranch.mutate(modal.item.id, { onSuccess: close });
  };

  return (
    <div className="min-h-full text-stone-900 dark:text-slate-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-1.5 text-stone-400 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-200 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Admin
          </Link>
          <div className="w-px h-5 bg-stone-300 dark:bg-slate-700" />
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl font-bold">Sucursales</h1>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          Nueva Sucursal
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-stone-400 dark:text-slate-500">
            <X className="w-10 h-10 text-rose-400/50" />
            <p>Error al cargar las sucursales</p>
          </div>
        ) : !branches?.length ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-stone-400 dark:text-slate-500">
            <FolderOpen className="w-10 h-10 opacity-30" />
            <p>No hay sucursales registradas</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 dark:border-slate-800 text-stone-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="text-left px-6 py-4 font-medium">Nombre</th>
                <th className="text-left px-6 py-4 font-medium">Dirección</th>
                <th className="text-left px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-slate-800/50">
              {branches.map((branch) => (
                <tr key={branch.id} className="hover:bg-stone-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-stone-800 dark:text-slate-200">{branch.name}</td>
                  <td className="px-6 py-4 text-stone-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {branch.address}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {branch.is_active ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                        <CheckCircle className="w-3.5 h-3.5" /> Activa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-400 dark:text-slate-500 bg-stone-100 dark:bg-slate-700/40 px-2.5 py-1 rounded-full">
                        <XCircle className="w-3.5 h-3.5" /> Inactiva
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(branch)} className="p-1.5 text-stone-400 dark:text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => openDelete(branch)} disabled={!branch.is_active} className="p-1.5 text-stone-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                        <PowerOff className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      {(modal.mode === "create" || modal.mode === "edit") && (
        <ModalOverlay onClose={close}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white">
              {modal.mode === "create" ? "Nueva Sucursal" : "Editar Sucursal"}
            </h2>
            <CloseBtn onClose={close} disabled={isPending} />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Nombre">
              <input type="text" required placeholder="Ej: Sucursal Centro" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={inputClass} />
            </FormField>
            <FormField label="Dirección">
              <input type="text" required placeholder="Ej: Av. Principal 123" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} className={inputClass} />
            </FormField>
            {formError && <ErrorBanner message={formError} />}
            <ModalActions onCancel={close} disabled={isPending} pending={isPending} label={modal.mode === "create" ? "Crear" : "Guardar cambios"} />
          </form>
        </ModalOverlay>
      )}

      {/* Deactivate Modal */}
      {modal.mode === "delete" && (
        <ModalOverlay onClose={close}>
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
              <PowerOff className="w-7 h-7 text-rose-400" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-2">¿Desactivar sucursal?</h2>
            <p className="text-stone-500 dark:text-slate-400 text-sm mb-6">
              Se desactivará <span className="text-stone-900 dark:text-white font-semibold">{modal.item.name}</span>. Podrá reactivarla editándola.
            </p>
            <div className="flex gap-3">
              <button onClick={close} disabled={isPending} className="flex-1 py-3 rounded-xl border border-stone-200 dark:border-slate-700 text-stone-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={handleDeactivate} disabled={isPending} className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                {deleteBranch.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Desactivar"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-3xl shadow-2xl p-8">
        {children}
      </div>
    </div>
  );
}

function CloseBtn({ onClose, disabled }: { onClose: () => void; disabled: boolean }) {
  return (
    <button onClick={onClose} disabled={disabled} className="text-stone-400 dark:text-slate-500 hover:text-stone-700 dark:hover:text-slate-300 transition-colors disabled:opacity-50">
      <X className="w-5 h-5" />
    </button>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-stone-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="bg-rose-500/10 border border-rose-500/40 text-rose-500 dark:text-rose-400 px-4 py-2.5 rounded-xl text-sm">
      {message}
    </div>
  );
}

function ModalActions({ onCancel, disabled, pending, label }: { onCancel: () => void; disabled: boolean; pending: boolean; label: string }) {
  return (
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onCancel} disabled={disabled} className="flex-1 py-3 rounded-xl border border-stone-200 dark:border-slate-700 text-stone-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
        Cancelar
      </button>
      <button type="submit" disabled={disabled} className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
        {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : label}
      </button>
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3 bg-stone-100 dark:bg-slate-800/60 border border-stone-300 dark:border-slate-700 rounded-xl text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm";
