"use client";

import { Authenticated } from "@refinedev/core";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  AlertTriangle,
  Loader2,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { useStock, useUpdateStock, type StockItem } from "@/hooks/useStock";
import { useBranches } from "@/hooks/useBranches";
import { AppHeader } from "@/components/AppHeader";

export default function StockPage() {
  return (
    <Authenticated
      key="stock-page"
      loading={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
      }
    >
      <StockContent />
    </Authenticated>
  );
}

function StockContent() {
  const { data: branches, isLoading: branchesLoading } = useBranches();
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [criticalOnly, setCriticalOnly] = useState(false);

  // Set default branch when loaded
  useEffect(() => {
    if (branches?.length && selectedBranchId === null) {
      setSelectedBranchId(branches[0].id);
    }
  }, [branches, selectedBranchId]);

  const {
    data: stock,
    isLoading: stockLoading,
    isError,
  } = useStock(selectedBranchId, criticalOnly);

  const updateStock = useUpdateStock();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ quantity: 0, min_stock: 0 });

  const filteredStock = useMemo(() => {
    if (!stock) return [];
    return stock.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [stock, search]);

  const handleEdit = (item: StockItem) => {
    setEditingId(item.ingredient_id);
    setEditForm({ quantity: item.quantity, min_stock: item.min_stock });
  };

  const handleSave = async (ingredientId: number) => {
    if (selectedBranchId === null) return;

    await updateStock.mutateAsync({
      branchId: selectedBranchId,
      ingredientId,
      payload: editForm,
    });

    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6">
      <AppHeader
        icon={<Package className="w-5 h-5 text-orange-400" />}
        title="Gestión de Stock"
        back={{ label: "Admin", href: "/admin" }}
        actions={
          <div className="flex items-center gap-3">
            <select
              value={selectedBranchId || ""}
              onChange={(e) => setSelectedBranchId(Number(e.target.value))}
              className="appearance-none bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
            >
              {!branches?.length && branchesLoading ? (
                <option>Cargando...</option>
              ) : (
                branches?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))
              )}
            </select>

            <button
              onClick={() => setCriticalOnly(!criticalOnly)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm transition-all ${criticalOnly
                  ? "bg-rose-500/20 border-rose-500 text-rose-400"
                  : "bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Solo Críticos
            </button>
          </div>
        }
      />

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-3 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar ingrediente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
          />
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <span className="text-slate-400 text-sm">Total ítems</span>
          <span className="text-xl font-bold">{stock?.length || 0}</span>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {stockLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-500">
            <X className="w-12 h-12 text-rose-500/50" />
            <p>Error al cargar el inventario</p>
          </div>
        ) : !filteredStock.length ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-500">
            <Package className="w-12 h-12 opacity-20" />
            <p>No se encontraron ingredientes en esta sucursal</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-5 font-medium">
                    Ingrediente
                  </th>
                  <th className="text-center px-6 py-5 font-medium">
                    Stock Actual
                  </th>
                  <th className="text-center px-6 py-5 font-medium">
                    Mínimo Requerido
                  </th>
                  <th className="text-center px-6 py-5 font-medium">Estado</th>
                  <th className="px-6 py-5 font-medium w-32" />
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/50">
                {filteredStock.map((item) => {
                  const isCritical = item.quantity <= item.min_stock;
                  const isEditing = editingId === item.ingredient_id;

                  return (
                    <tr
                      key={item.ingredient_id}
                      className={`hover:bg-slate-800/30 transition-colors ${isCritical ? "bg-rose-500/[0.02]" : ""
                        }`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-200">
                          {item.name}
                        </div>
                        <div className="text-xs text-slate-500 uppercase tracking-tighter">
                          {item.unit}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm.quantity}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                quantity:
                                  parseFloat(e.target.value) || 0,
                              }))
                            }
                            className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-center focus:ring-1 focus:ring-orange-500 outline-none"
                          />
                        ) : (
                          <span
                            className={`font-mono text-base ${isCritical
                                ? "text-rose-400 font-bold"
                                : "text-slate-300"
                              }`}
                          >
                            {item.quantity}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm.min_stock}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                min_stock:
                                  parseFloat(e.target.value) || 0,
                              }))
                            }
                            className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-center focus:ring-1 focus:ring-orange-500 outline-none"
                          />
                        ) : (
                          <span className="font-mono text-slate-500">
                            {item.min_stock}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
                            <AlertTriangle className="w-3 h-3" />
                            CRÍTICO
                          </span>
                        ) : (
                          <span className="inline-flex px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                            OK
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() =>
                                  handleSave(item.ingredient_id)
                                }
                                disabled={updateStock.isPending}
                                className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                              >
                                {updateStock.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Check className="w-5 h-5" />
                                )}
                              </button>

                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1.5 text-slate-500 hover:bg-slate-700 rounded-lg transition-colors"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1.5 text-slate-500 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}