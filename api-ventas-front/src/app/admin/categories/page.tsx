"use client";

import { Authenticated } from "@refinedev/core";
import { useState } from "react";
import Link from "next/link";
import { Tag, Plus, Pencil, Trash2, X, Loader2, ArrowLeft, FolderOpen } from "lucide-react";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  type Category,
  type CategoryPayload,
} from "@/hooks/useCategories";

type Modal =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; item: Category }
  | { mode: "delete"; item: Category };

const EMPTY: CategoryPayload = { name: "", description: "" };

export default function CategoriesPage() {
  return (
    <Authenticated
      key="categories-page"
      loading={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
      }
    >
      <CategoriesContent />
    </Authenticated>
  );
}

function CategoriesContent() {
  const { data: categories, isLoading, isError } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [modal, setModal] = useState<Modal>({ mode: "closed" });
  const [form, setForm] = useState<CategoryPayload>(EMPTY);
  const [formError, setFormError] = useState("");

  const isPending =
    createCategory.isPending || updateCategory.isPending || deleteCategory.isPending;

  const openCreate = () => {
    setForm(EMPTY);
    setFormError("");
    setModal({ mode: "create" });
  };

  const openEdit = (item: Category) => {
    setForm({ name: item.name, description: item.description ?? "" });
    setFormError("");
    setModal({ mode: "edit", item });
  };

  const openDelete = (item: Category) => setModal({ mode: "delete", item });

  const close = () => {
    if (isPending) return;
    setModal({ mode: "closed" });
  };

  const handleApiError = (err: any) => {
    const detail = err.response?.data?.detail;
    setFormError(
      Array.isArray(detail)
        ? detail.map((d: any) => d.msg).join(", ")
        : detail || "Error al guardar"
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const payload: CategoryPayload = {
      name: form.name,
      description: form.description || null,
    };

    if (modal.mode === "create") {
      createCategory.mutate(payload, {
        onSuccess: close,
        onError: handleApiError,
      });
    } else if (modal.mode === "edit") {
      updateCategory.mutate(
        { id: modal.item.id, payload },
        { onSuccess: close, onError: handleApiError }
      );
    }
  };

  const handleDelete = () => {
    if (modal.mode !== "delete") return;
    deleteCategory.mutate(modal.item.id, { onSuccess: close });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Admin
          </Link>
          <div className="w-px h-5 bg-slate-700" />
          <div className="flex items-center gap-2">
            <Tag className="w-6 h-6 text-violet-400" />
            <h1 className="text-2xl font-bold">Categorías</h1>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 text-white font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-violet-500/20"
        >
          <Plus className="w-4 h-4" />
          Nueva Categoría
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
            <X className="w-10 h-10 text-rose-500/50" />
            <p>Error al cargar las categorías</p>
          </div>
        ) : !categories?.length ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
            <FolderOpen className="w-10 h-10 opacity-30" />
            <p>No hay categorías registradas</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="text-left px-6 py-4 font-medium">Nombre</th>
                <th className="text-left px-6 py-4 font-medium">Descripción</th>
                <th className="px-6 py-4 font-medium w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-200">{cat.name}</td>
                  <td className="px-6 py-4 text-slate-400">{cat.description ?? "—"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-1.5 text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDelete(cat)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
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
            <h2 className="text-xl font-bold text-white">
              {modal.mode === "create" ? "Nueva Categoría" : "Editar Categoría"}
            </h2>
            <CloseBtn onClose={close} disabled={isPending} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Nombre">
              <input
                type="text"
                required
                placeholder="Ej: Entradas"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className={inputClass}
              />
            </FormField>

            <FormField label="Descripción (opcional)">
              <input
                type="text"
                placeholder="Breve descripción"
                value={form.description ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className={inputClass}
              />
            </FormField>

            {formError && <ErrorBanner message={formError} />}

            <ModalActions
              onCancel={close}
              disabled={isPending}
              pending={isPending}
              label={modal.mode === "create" ? "Crear" : "Guardar cambios"}
            />
          </form>
        </ModalOverlay>
      )}

      {/* Delete Confirmation Modal */}
      {modal.mode === "delete" && (
        <ModalOverlay onClose={close}>
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-rose-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">¿Eliminar categoría?</h2>
            <p className="text-slate-400 text-sm mb-6">
              Se eliminará <span className="text-white font-semibold">{modal.item.name}</span>.
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={close}
                disabled={isPending}
                className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleteCategory.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Eliminar"
                )}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ---- Shared sub-components ----

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-8">
        {children}
      </div>
    </div>
  );
}

function CloseBtn({ onClose, disabled }: { onClose: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClose}
      disabled={disabled}
      className="text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50"
    >
      <X className="w-5 h-5" />
    </button>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="bg-rose-500/10 border border-rose-500/40 text-rose-400 px-4 py-2.5 rounded-xl text-sm">
      {message}
    </div>
  );
}

function ModalActions({
  onCancel,
  disabled,
  pending,
  label,
}: {
  onCancel: () => void;
  disabled: boolean;
  pending: boolean;
  label: string;
}) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        type="button"
        onClick={onCancel}
        disabled={disabled}
        className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={disabled}
        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 text-white font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : label}
      </button>
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-sm";
