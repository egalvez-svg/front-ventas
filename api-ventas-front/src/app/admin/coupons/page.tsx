"use client";

import { Authenticated } from "@refinedev/core";
import { useState, useMemo } from "react";
import {
  Ticket,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Search,
  Copy,
  ToggleLeft,
  ToggleRight,
  FolderOpen,
  CalendarDays,
  BadgePercent,
  DollarSign,
} from "lucide-react";
import {
  useCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
  type Coupon,
  type CouponPayload,
} from "@/hooks/useCoupons";
import { useAdminBranch } from "@/providers/AdminBranchContext";
import { toast } from "sonner";

type Modal =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; item: Coupon }
  | { mode: "delete"; item: Coupon };

type Tab = "coupons" | "discounts";

const EMPTY: CouponPayload = {
  code: "",
  description: "",
  discount_type: "percentage",
  discount_value: 10,
  min_order_value: null,
  expiration_date: null,
  max_uses: null,
  is_active: true,
};

export default function CouponsPage() {
  return (
    <Authenticated
      key="coupons-page"
      loading={
        <div className="min-h-screen bg-stone-100 dark:bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        </div>
      }
    >
      <CouponsContent />
    </Authenticated>
  );
}

function CouponsContent() {
  const {
    selectedBranchId,
  } = useAdminBranch();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("coupons");
  const [modal, setModal] = useState<Modal>({ mode: "closed" });
  const [form, setForm] = useState<CouponPayload>(EMPTY);
  const [formError, setFormError] = useState("");

  const { data: coupons, isLoading, isError } = useCoupons(selectedBranchId);
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const isPending =
    createCoupon.isPending || updateCoupon.isPending || deleteCoupon.isPending;

  const filteredCoupons = useMemo(
    () =>
      (coupons ?? []).filter(
        (c) =>
          c.code.toLowerCase().includes(search.toLowerCase()) ||
          (c.description ?? "").toLowerCase().includes(search.toLowerCase())
      ),
    [coupons, search]
  );

  const openCreate = () => {
    setForm(EMPTY);
    setFormError("");
    setModal({ mode: "create" });
  };

  const openEdit = (item: Coupon) => {
    setForm({
      code: item.code,
      description: item.description ?? "",
      discount_type: item.discount_type,
      discount_value: item.discount_value,
      min_order_value: item.min_order_value,
      expiration_date: item.expiration_date ? item.expiration_date.slice(0, 16) : null,
      max_uses: item.max_uses,
      is_active: item.is_active,
    });
    setFormError("");
    setModal({ mode: "edit", item });
  };

  const openDelete = (item: Coupon) => setModal({ mode: "delete", item });
  const close = () => { if (isPending) return; setModal({ mode: "closed" }); };

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
    if (selectedBranchId === null) return;
    setFormError("");
    const payload: CouponPayload = {
      ...form,
      code: form.code.toUpperCase(),
      description: form.description || null,
      min_order_value: form.min_order_value || null,
      max_uses: form.max_uses || null,
      expiration_date: form.expiration_date
        ? new Date(form.expiration_date).toISOString()
        : null,
    };
    if (modal.mode === "create") {
      createCoupon.mutate(
        { branchId: selectedBranchId, payload },
        { onSuccess: close, onError: handleApiError }
      );
    } else if (modal.mode === "edit") {
      updateCoupon.mutate(
        { branchId: selectedBranchId, id: modal.item.id, payload },
        { onSuccess: close, onError: handleApiError }
      );
    }
  };

  const handleDelete = () => {
    if (modal.mode !== "delete" || selectedBranchId === null) return;
    deleteCoupon.mutate(
      { branchId: selectedBranchId, id: modal.item.id },
      { onSuccess: close }
    );
  };

  const handleToggleActive = (item: Coupon) => {
    if (selectedBranchId === null) return;
    updateCoupon.mutate({
      branchId: selectedBranchId,
      id: item.id,
      payload: { is_active: !item.is_active },
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Código "${code}" copiado`);
  };

  return (
    <div className="min-h-full text-stone-900 dark:text-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-slate-800/70 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <Ticket className="w-5 h-5 text-amber-500" />
          <h1 className="text-base font-bold text-stone-900 dark:text-white">Cupones</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95 text-sm shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Cupón</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-1 w-fit mb-6">
          <button
            onClick={() => setActiveTab("coupons")}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === "coupons"
                ? "bg-white dark:bg-slate-800 text-stone-900 dark:text-white shadow-sm"
                : "text-stone-500 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-300"
            }`}
          >
            Cupones
          </button>
          <button
            onClick={() => setActiveTab("discounts")}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === "discounts"
                ? "bg-white dark:bg-slate-800 text-stone-900 dark:text-white shadow-sm"
                : "text-stone-500 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-300"
            }`}
          >
            Descuentos
          </button>
        </div>

        {activeTab === "discounts" ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-stone-400 dark:text-slate-500">
            <BadgePercent className="w-10 h-10 opacity-30" />
            <p className="text-sm">Módulo de descuentos próximamente</p>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="mb-6">
              <div className="relative w-fit">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar cupón..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-stone-100 dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-xl text-sm text-stone-900 dark:text-slate-100 placeholder-stone-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all w-56"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-stone-400 dark:text-slate-500">
                <X className="w-10 h-10 text-rose-400/50" />
                <p className="text-sm">Error al cargar los cupones</p>
              </div>
            ) : !filteredCoupons.length ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-stone-400 dark:text-slate-500">
                <FolderOpen className="w-10 h-10 opacity-30" />
                <p className="text-sm">
                  {search ? "Sin resultados" : "No hay cupones registrados"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCoupons.map((coupon) => (
                  <CouponCard
                    key={coupon.id}
                    coupon={coupon}
                    onEdit={() => openEdit(coupon)}
                    onDelete={() => openDelete(coupon)}
                    onToggle={() => handleToggleActive(coupon)}
                    onCopy={() => handleCopyCode(coupon.code)}
                    isToggling={updateCoupon.isPending}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create / Edit Modal */}
      {(modal.mode === "create" || modal.mode === "edit") && (
        <ModalOverlay onClose={close}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white">
              {modal.mode === "create" ? "Nuevo Cupón" : "Editar Cupón"}
            </h2>
            <CloseBtn onClose={close} disabled={isPending} />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Código">
              <input
                type="text"
                required
                placeholder="Ej: VERANO20"
                value={form.code}
                onChange={(e) =>
                  setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))
                }
                className={inputClass}
              />
            </FormField>
            <FormField label="Descripción (opcional)">
              <input
                type="text"
                placeholder="Ej: 20% de descuento de verano"
                value={form.description ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className={inputClass}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Tipo de descuento">
                <select
                  value={form.discount_type}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      discount_type: e.target.value as "percentage" | "fixed",
                    }))
                  }
                  className={inputClass}
                >
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Monto fijo ($)</option>
                </select>
              </FormField>
              <FormField label={form.discount_type === "percentage" ? "Valor (%)" : "Valor ($)"}>
                <input
                  type="number"
                  required
                  min={0}
                  max={form.discount_type === "percentage" ? 100 : undefined}
                  step={form.discount_type === "percentage" ? 1 : 100}
                  placeholder={form.discount_type === "percentage" ? "20" : "1000"}
                  value={form.discount_value || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, discount_value: Number(e.target.value) }))
                  }
                  className={inputClass}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Compra mínima ($)">
                <input
                  type="number"
                  min={0}
                  step={100}
                  placeholder="Sin mínimo"
                  value={form.min_order_value ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      min_order_value: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  className={inputClass}
                />
              </FormField>
              <FormField label="Máx. usos">
                <input
                  type="number"
                  min={1}
                  placeholder="Ilimitado"
                  value={form.max_uses ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      max_uses: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  className={inputClass}
                />
              </FormField>
            </div>
            <FormField label="Fecha de vencimiento">
              <input
                type="datetime-local"
                value={form.expiration_date ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, expiration_date: e.target.value || null }))
                }
                className={inputClass}
              />
            </FormField>
            {modal.mode === "edit" && (
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={form.is_active ?? true}
                    onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-6 rounded-full transition-colors ${
                      form.is_active ? "bg-amber-500" : "bg-stone-300 dark:bg-slate-600"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow transition-transform mt-1 ${
                        form.is_active ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </div>
                </div>
                <span className="text-sm text-stone-700 dark:text-slate-300">Cupón activo</span>
              </label>
            )}
            {formError && <ErrorBanner message={formError} />}
            <ModalActions
              onCancel={close}
              disabled={isPending}
              pending={isPending}
              label={modal.mode === "create" ? "Crear cupón" : "Guardar cambios"}
            />
          </form>
        </ModalOverlay>
      )}

      {/* Delete Modal */}
      {modal.mode === "delete" && (
        <ModalOverlay onClose={close}>
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-rose-400" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-2">
              ¿Eliminar cupón?
            </h2>
            <p className="text-stone-500 dark:text-slate-400 text-sm mb-6">
              Se eliminará{" "}
              <span className="text-stone-900 dark:text-white font-semibold font-mono">
                {modal.item.code}
              </span>
              . Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={close}
                disabled={isPending}
                className="flex-1 py-3 rounded-xl border border-stone-200 dark:border-slate-700 text-stone-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleteCoupon.isPending ? (
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

function CouponCard({
  coupon,
  onEdit,
  onDelete,
  onToggle,
  onCopy,
  isToggling,
}: {
  coupon: Coupon;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onCopy: () => void;
  isToggling: boolean;
}) {
  const discountLabel =
    coupon.discount_type === "percentage"
      ? `${coupon.discount_value}%`
      : `$${coupon.discount_value.toLocaleString("es-CL")}`;

  const expiryLabel = coupon.expiration_date
    ? new Intl.DateTimeFormat("es-CL", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(coupon.expiration_date))
    : null;

  return (
    <div
      className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 flex flex-col gap-3 transition-all ${
        coupon.is_active
          ? "border-stone-200 dark:border-slate-700 shadow-sm"
          : "border-stone-100 dark:border-slate-800 opacity-60"
      }`}
    >
      {/* Top: name + discount */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold text-stone-900 dark:text-white text-sm font-mono tracking-wide">
            {coupon.code}
          </p>
          {coupon.description && (
            <p className="text-xs text-stone-400 dark:text-slate-500 mt-0.5 line-clamp-1">
              {coupon.description}
            </p>
          )}
        </div>
        <span
          className={`text-xl font-black flex-shrink-0 ${
            coupon.discount_type === "percentage" ? "text-amber-500" : "text-rose-500"
          }`}
        >
          {discountLabel}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onEdit}
          className="p-1.5 text-stone-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
          title="Editar"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-stone-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
          title="Eliminar"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onCopy}
          className="p-1.5 text-stone-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
          title="Copiar código"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onToggle}
          disabled={isToggling}
          title={coupon.is_active ? "Desactivar" : "Activar"}
          className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ml-auto ${
            coupon.is_active
              ? "text-amber-500 hover:bg-amber-500/10"
              : "text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-slate-800"
          }`}
        >
          {coupon.is_active ? (
            <ToggleRight className="w-4 h-4" />
          ) : (
            <ToggleLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      <hr className="border-stone-100 dark:border-slate-800" />

      {/* Details */}
      <div className="flex flex-col gap-1.5 text-xs text-stone-400 dark:text-slate-500">
        {expiryLabel && (
          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Vence {expiryLabel}</span>
          </div>
        )}
        {coupon.min_order_value != null && (
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Mínimo ${coupon.min_order_value.toLocaleString("es-CL")}</span>
          </div>
        )}
        {!expiryLabel && coupon.min_order_value == null && (
          <span className="text-xs italic">Sin restricciones</span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-stone-50 dark:bg-slate-800/60 rounded-xl px-3 py-2 text-center">
          <p className="text-[10px] font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-wider">
            Emitidos
          </p>
          <p className="text-sm font-bold text-stone-700 dark:text-slate-300 mt-0.5">
            {coupon.max_uses ?? "∞"}
          </p>
        </div>
        <div className="bg-stone-50 dark:bg-slate-800/60 rounded-xl px-3 py-2 text-center">
          <p className="text-[10px] font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-wider">
            Usados
          </p>
          <p
            className={`text-sm font-bold mt-0.5 ${
              coupon.used_count > 0 ? "text-amber-500" : "text-stone-700 dark:text-slate-300"
            }`}
          >
            {coupon.used_count}
          </p>
        </div>
      </div>
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
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
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
      className="text-stone-400 dark:text-slate-500 hover:text-stone-700 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
    >
      <X className="w-5 h-5" />
    </button>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-stone-500 dark:text-slate-400 uppercase tracking-wider">
        {label}
      </label>
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
        className="flex-1 py-3 rounded-xl border border-stone-200 dark:border-slate-700 text-stone-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={disabled}
        className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : label}
      </button>
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3 bg-stone-100 dark:bg-slate-800/60 border border-stone-300 dark:border-slate-700 rounded-xl text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm";
