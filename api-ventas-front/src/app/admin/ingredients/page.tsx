"use client";

import { Authenticated } from "@refinedev/core";
import { useState } from "react";
import Link from "next/link";
import { FlaskConical, Plus, Pencil, Trash2, X, Loader2, ArrowLeft } from "lucide-react";
import {
  useIngredients,
  useCreateIngredient,
  useUpdateIngredient,
  useDeleteIngredient,
  UNITS,
  type Ingredient,
  type IngredientPayload,
  type Unit,
} from "@/hooks/useIngredients";

type Modal =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; item: Ingredient }
  | { mode: "delete"; item: Ingredient };

const EMPTY: IngredientPayload = { name: "", unit: "gr", cost_per_unit: 0 };

const UNIT_LABELS: Record<Unit, string> = {
  gr: "Gramos (gr)",
  ml: "Mililitros (ml)",
  un: "Unidades (un)",
  kg: "Kilogramos (kg)",
};

export default function IngredientsPage() {
  return (
    <Authenticated
      key="ingredients-page"
      loading={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
      }
    >
      <IngredientsContent />
    </Authenticated>
  );
}

function IngredientsContent() {
  const { data: ingredients, isLoading, isError } = useIngredients();
  const createIngredient = useCreateIngredient();
  const updateIngredient = useUpdateIngredient();
  const deleteIngredient = useDeleteIngredient();

  const [modal, setModal] = useState<Modal>({ mode: "closed" });
  const [form, setForm] = useState<IngredientPayload>(EMPTY);
  const [formError, setFormError] = useState("");

  const isPending =
    createIngredient.isPending || updateIngredient.isPending || deleteIngredient.isPending;

  const openCreate = () => {
    setForm(EMPTY);
    setFormError("");
    setModal({ mode: "create" });
  };

  const openEdit = (item: Ingredient) => {
    setForm({ name: item.name, unit: item.unit, cost_per_unit: item.cost_per_unit });
    setFormError("");
    setModal({ mode: "edit", item });
  };

  const openDelete = (item: Ingredient) => setModal({ mode: "delete", item });

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
    if (modal.mode === "create") {
      createIngredient.mutate(form, {
        onSuccess: close,
        onError: handleApiError,
      });
    } else if (modal.mode === "edit") {
      updateIngredient.mutate(
        { id: modal.item.id, payload: form },
        { onSuccess: close, onError: handleApiError }
      );
    }
  };

  const handleDelete = () => {
    if (modal.mode !== "delete") return;
    deleteIngredient.mutate(modal.item.id, { onSuccess: close });
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
            <FlaskConical className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-bold">Ingredientes</h1>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          Nuevo Ingrediente
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
            <X className="w-10 h-10 text-rose-500/50" />
            <p>Error al cargar los ingredientes</p>
          </div>
        ) : !ingredients?.length ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
            <FlaskConical className="w-10 h-10 opacity-30" />
            <p>No hay ingredientes registrados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="text-left px-6 py-4 font-medium">Nombre</th>
                <th className="text-left px-6 py-4 font-medium">Unidad</th>
                <th className="text-right px-6 py-4 font-medium">Costo / unidad</th>
                <th className="px-6 py-4 font-medium w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {ingredients.map((ing) => (
                <tr key={ing.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-200">{ing.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                      {ing.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-300 font-mono">
                    ${ing.cost_per_unit.toLocaleString("es-CL")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(ing)}
                        className="p-1.5 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDelete(ing)}
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
              {modal.mode === "create" ? "Nuevo Ingrediente" : "Editar Ingrediente"}
            </h2>
            <CloseBtn onClose={close} disabled={isPending} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Nombre">
              <input
                type="text"
                required
                placeholder="Ej: Harina"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className={inputClass}
              />
            </FormField>

            <FormField label="Unidad">
              <select
                value={form.unit}
                onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value as Unit }))}
                className={inputClass}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {UNIT_LABELS[u]}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Costo por unidad ($)">
              <input
                type="number"
                required
                min={0}
                step="0.01"
                placeholder="0"
                value={form.cost_per_unit}
                onChange={(e) =>
                  setForm((p) => ({ ...p, cost_per_unit: parseFloat(e.target.value) || 0 }))
                }
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
            <h2 className="text-xl font-bold text-white mb-2">¿Eliminar ingrediente?</h2>
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
                {deleteIngredient.isPending ? (
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
        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : label}
      </button>
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm";
