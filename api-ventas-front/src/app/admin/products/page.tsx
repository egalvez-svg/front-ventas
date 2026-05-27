"use client";

import { Authenticated } from "@refinedev/core";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  ShoppingBag,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  BookOpen,
  CheckCircle2,
  XCircle,
  PlusCircle,
  MinusCircle,
  Search,
} from "lucide-react";
import {
  useProducts,
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeactivateProduct,
  useSetRecipe,
  type Product,
  type ProductPayload,
  type ProductsParams,
  type RecipeItem,
} from "@/hooks/useProducts";
import { useCategories, type Category } from "@/hooks/useCategories";
import { useIngredients, type Ingredient } from "@/hooks/useIngredients";
import { useAdminBranch } from "@/providers/AdminBranchContext";

type Modal =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; item: Product }
  | { mode: "deactivate"; item: Product }
  | { mode: "confirm-recipe"; item: Product }
  | { mode: "recipe"; item: Product };

const EMPTY_FORM: ProductPayload = {
  name: "",
  description: "",
  price: 0,
  category_id: 0,
  is_active: true,
};

export default function ProductsPage() {
  return (
    <Authenticated
      key="products-page"
      loading={
        <div className="min-h-screen bg-stone-100 dark:bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        </div>
      }
    >
      <ProductsContent />
    </Authenticated>
  );
}

function ProductsContent() {
  const { selectedBranchId } = useAdminBranch();
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState<ProductsParams>({});
  const { data: products, isLoading, isError } = useProducts(selectedBranchId, filters);

  const filteredProducts = useMemo(
    () => (products ?? []).filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );
  const { data: categories = [] } = useCategories(selectedBranchId);
  const { data: ingredients = [] } = useIngredients(selectedBranchId);

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deactivateProduct = useDeactivateProduct();

  const [modal, setModal] = useState<Modal>({ mode: "closed" });
  const [form, setForm] = useState<ProductPayload>(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const isPendingForm = createProduct.isPending || updateProduct.isPending;
  const isPendingDeactivate = deactivateProduct.isPending;

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, category_id: categories[0]?.id ?? 0 });
    setFormError("");
    setModal({ mode: "create" });
  };

  const openEdit = (item: Product) => {
    setForm({
      name: item.name,
      description: item.description ?? "",
      price: item.price,
      category_id: item.category_id,
      is_active: item.is_active,
    });
    setFormError("");
    setModal({ mode: "edit", item });
  };

  const close = () => {
    if (isPendingForm || isPendingDeactivate) return;
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
    if (selectedBranchId === null) return;
    setFormError("");
    const payload: ProductPayload = {
      ...form,
      description: form.description || null,
      price: Number(form.price),
      category_id: Number(form.category_id),
    };
    if (modal.mode === "create") {
      createProduct.mutate(
        { branchId: selectedBranchId, payload },
        {
          onSuccess: (created) => setModal({ mode: "confirm-recipe", item: created }),
          onError: handleApiError,
        }
      );
    } else if (modal.mode === "edit") {
      updateProduct.mutate({ branchId: selectedBranchId, id: modal.item.id, payload }, { onSuccess: close, onError: handleApiError });
    }
  };

  const handleDeactivate = () => {
    if (modal.mode !== "deactivate" || selectedBranchId === null) return;
    deactivateProduct.mutate({ branchId: selectedBranchId, id: modal.item.id }, { onSuccess: close });
  };

  const categoryName = (id: number) =>
    categories.find((c) => c.id === id)?.name ?? `#${id}`;

  return (
    <div className="min-h-full text-stone-900 dark:text-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-slate-800/70 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <ShoppingBag className="w-5 h-5 text-amber-500" />
          <h1 className="text-base font-bold text-stone-900 dark:text-white">Productos</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95 text-sm shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            Nuevo Producto
          </button>
        </div>
      </div>

      <div className="p-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-stone-100 dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-xl text-sm text-stone-900 dark:text-slate-100 placeholder-stone-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all w-56"
          />
        </div>
        <select
          value={filters.category_id ?? ""}
          onChange={(e) =>
            setFilters((p) => ({
              ...p,
              category_id: e.target.value === "" ? undefined : Number(e.target.value),
            }))
          }
          className="appearance-none bg-stone-100 dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm text-stone-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-stone-400 dark:text-slate-500">
            <XCircle className="w-10 h-10 text-rose-500/50" />
            <p>Error al cargar los productos</p>
          </div>
        ) : !filteredProducts.length ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-stone-400 dark:text-slate-500">
            <ShoppingBag className="w-10 h-10 opacity-30" />
            <p>{search ? "Sin resultados" : "No hay productos registrados"}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 dark:border-slate-800 text-stone-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="text-left px-6 py-4 font-medium">Nombre</th>
                <th className="text-left px-6 py-4 font-medium">Categoría</th>
                <th className="text-right px-6 py-4 font-medium">Precio</th>
                <th className="text-left px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium w-32" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-slate-800/50">
              {filteredProducts.map((prod) => (
                <tr
                  key={prod.id}
                  className={`hover:bg-stone-50 dark:hover:bg-slate-800/30 transition-colors ${
                    !prod.is_active ? "opacity-50" : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-stone-800 dark:text-slate-200">{prod.name}</p>
                    {prod.description && (
                      <p className="text-xs text-stone-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                        {prod.description}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                      {categoryName(prod.category_id)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-stone-700 dark:text-slate-300">
                    ${prod.price.toLocaleString("es-CL")}
                  </td>
                  <td className="px-6 py-4">
                    {prod.is_active ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-stone-400 dark:text-slate-500 text-xs font-semibold">
                        <XCircle className="w-3.5 h-3.5" />
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setModal({ mode: "recipe", item: prod })}
                        title="Editar receta"
                        className="p-1.5 text-stone-400 dark:text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                      >
                        <BookOpen className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(prod)}
                        title="Editar producto"
                        className="p-1.5 text-stone-400 dark:text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {prod.is_active && (
                        <button
                          onClick={() => setModal({ mode: "deactivate", item: prod })}
                          title="Desactivar"
                          className="p-1.5 text-stone-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      </div>

      {/* Create / Edit Modal */}
      {(modal.mode === "create" || modal.mode === "edit") && (
        <ModalOverlay onClose={close}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white">
              {modal.mode === "create" ? "Nuevo Producto" : "Editar Producto"}
            </h2>
            <CloseBtn onClose={close} disabled={isPendingForm} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Nombre">
              <input
                type="text"
                required
                placeholder="Ej: Lomo saltado"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className={inputClass}
              />
            </FormField>

            <FormField label="Descripción (opcional)">
              <input
                type="text"
                placeholder="Breve descripción visible al cliente"
                value={form.description ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className={inputClass}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Precio ($)">
                <input
                  type="number"
                  required
                  min={0}
                  step="1"
                  placeholder="0"
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Categoría">
                <select
                  required
                  value={form.category_id}
                  onChange={(e) => setForm((p) => ({ ...p, category_id: Number(e.target.value) }))}
                  className={inputClass}
                >
                  <option value={0} disabled>Seleccionar…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="flex items-center gap-3 p-3 bg-stone-100 dark:bg-slate-800/50 rounded-xl border border-stone-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  form.is_active ? "bg-emerald-500" : "bg-stone-300 dark:bg-slate-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    form.is_active ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-sm text-stone-700 dark:text-slate-300">
                {form.is_active ? "Producto activo (visible en POS)" : "Producto inactivo"}
              </span>
            </div>

            {formError && <ErrorBanner message={formError} />}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={close}
                disabled={isPendingForm}
                className="flex-1 py-3 rounded-xl border border-stone-200 dark:border-slate-700 text-stone-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPendingForm}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPendingForm ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : modal.mode === "create" ? (
                  "Crear"
                ) : (
                  "Guardar cambios"
                )}
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* Deactivate Confirmation */}
      {modal.mode === "deactivate" && (
        <ModalOverlay onClose={close}>
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-rose-500 dark:text-rose-400" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-2">¿Desactivar producto?</h2>
            <p className="text-stone-500 dark:text-slate-400 text-sm mb-6">
              <span className="text-stone-900 dark:text-white font-semibold">{modal.item.name}</span> dejará de
              aparecer en el POS. Puedes reactivarlo editándolo.
            </p>
            <div className="flex gap-3">
              <button
                onClick={close}
                disabled={isPendingDeactivate}
                className="flex-1 py-3 rounded-xl border border-stone-200 dark:border-slate-700 text-stone-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeactivate}
                disabled={isPendingDeactivate}
                className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPendingDeactivate ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Desactivar"
                )}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* Confirm Recipe after Create */}
      {modal.mode === "confirm-recipe" && (
        <ModalOverlay onClose={close}>
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-7 h-7 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-2">¿Tiene receta?</h2>
            <p className="text-stone-500 dark:text-slate-400 text-sm mb-6">
              <span className="text-stone-900 dark:text-white font-semibold">{modal.item.name}</span> fue creado exitosamente.
              ¿Deseas agregar su receta ahora?
            </p>
            <div className="flex gap-3">
              <button
                onClick={close}
                className="flex-1 py-3 rounded-xl border border-stone-200 dark:border-slate-700 text-stone-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
              >
                No, omitir
              </button>
              <button
                onClick={() => setModal({ mode: "recipe", item: modal.item })}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Sí, agregar receta
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* Recipe Editor */}
      {modal.mode === "recipe" && selectedBranchId !== null && (
        <RecipeModal
          product={modal.item}
          ingredients={ingredients}
          onClose={close}
          branchId={selectedBranchId}
        />
      )}
    </div>
  );
}

function RecipeModal({
  product,
  ingredients,
  onClose,
  branchId,
}: {
  product: Product;
  ingredients: Ingredient[];
  onClose: () => void;
  branchId: number;
}) {
  const { data: detail, isLoading } = useProduct(branchId, product.id);
  const setRecipe = useSetRecipe();

  const [rows, setRows] = useState<RecipeItem[]>([]);
  const initialized = useRef(false);

  useEffect(() => {
    if (detail && !initialized.current) {
      setRows(detail.recipe ?? []);
      initialized.current = true;
    }
  }, [detail]);

  const addRow = () => {
    if (!ingredients.length) return;
    setRows((prev) => [...prev, { ingredient_id: ingredients[0].id, quantity: 1 }]);
  };

  const removeRow = (i: number) =>
    setRows((prev) => prev.filter((_, idx) => idx !== i));

  const updateRow = (i: number, field: keyof RecipeItem, value: number) =>
    setRows((prev) =>
      prev.map((row, idx) => (idx === i ? { ...row, [field]: value } : row))
    );

  const handleSave = () => {
    setRecipe.mutate({ branchId, id: product.id, recipe: rows }, { onSuccess: onClose });
  };

  const ingredientUnit = (id: number) =>
    ingredients.find((ing) => ing.id === id)?.unit ?? "";

  return (
    <ModalOverlay onClose={setRecipe.isPending ? () => {} : onClose} wide>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-white">Receta</h2>
          <p className="text-sm text-stone-500 dark:text-slate-400 mt-0.5">{product.name}</p>
        </div>
        <CloseBtn onClose={onClose} disabled={setRecipe.isPending} />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : (
        <>
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-stone-400 dark:text-slate-500 gap-2">
              <BookOpen className="w-10 h-10 opacity-30" />
              <p className="text-sm">Sin ingredientes. Agrega uno para comenzar.</p>
            </div>
          ) : (
            <div className="space-y-2 mb-4 max-h-72 overflow-y-auto pr-1">
              {rows.map((row, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-stone-100 dark:bg-slate-800/50 rounded-xl border border-stone-200 dark:border-slate-700"
                >
                  <select
                    value={row.ingredient_id}
                    onChange={(e) => updateRow(i, "ingredient_id", Number(e.target.value))}
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-lg text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {ingredients.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} ({ing.unit})
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <input
                      type="number"
                      min={0.01}
                      step="0.01"
                      value={row.quantity}
                      onChange={(e) => updateRow(i, "quantity", parseFloat(e.target.value) || 0)}
                      className="w-24 px-3 py-2 bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-lg text-sm text-stone-900 dark:text-white text-right focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <span className="text-xs text-stone-400 dark:text-slate-500 w-6 text-left">
                      {ingredientUnit(row.ingredient_id)}
                    </span>
                  </div>
                  <button
                    onClick={() => removeRow(i)}
                    className="p-1 text-stone-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors flex-shrink-0"
                  >
                    <MinusCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={addRow}
            disabled={!ingredients.length}
            className="flex items-center gap-2 text-sm text-amber-500 hover:text-amber-400 transition-colors mb-6 disabled:opacity-30"
          >
            <PlusCircle className="w-4 h-4" />
            Agregar ingrediente
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={setRecipe.isPending}
              className="flex-1 py-3 rounded-xl border border-stone-200 dark:border-slate-700 text-stone-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={setRecipe.isPending}
              className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {setRecipe.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Guardar receta"
              )}
            </button>
          </div>
        </>
      )}
    </ModalOverlay>
  );
}

function ModalOverlay({
  children,
  onClose,
  wide = false,
}: {
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-3xl shadow-2xl p-8 w-full ${
          wide ? "max-w-lg" : "max-w-md"
        }`}
      >
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

const inputClass =
  "w-full px-4 py-3 bg-stone-100 dark:bg-slate-800/60 border border-stone-300 dark:border-slate-700 rounded-xl text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm";
