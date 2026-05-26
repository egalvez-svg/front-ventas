"use client";

import { Authenticated } from "@refinedev/core";
import { useState, useMemo } from "react";
import {
  Store, Loader2, ShoppingCart, Plus, Minus, Trash2, Send, X,
  UtensilsCrossed, ChefHat, AlertTriangle, MessageSquare, ShoppingBag,
  BellRing, CheckCircle2,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { useTables, type Table, type TableStatus } from "@/hooks/useTables";
import { useProducts, type Product } from "@/hooks/useProducts";
import { useCategories, type Category } from "@/hooks/useCategories";
import {
  useCreateOrder, useUpdateOrderStatus, useOrders,
  ACTIVE_STATUSES, type OrderItemPayload, type Order, type OrderStatus,
} from "@/hooks/useOrders";
import { useCurrentShift } from "@/hooks/useShifts";

interface CartItem {
  product: Product;
  quantity: number;
  notes: string;
}

const TABLE_STATUS_CONFIG: Record<TableStatus, { 
  label: string; 
  bg: string;
  border: string; 
  selectedBg: string;
  selectedBorder: string;
  dot: string;
}> = {
  available: {
    label: "Disponible",
    bg: "bg-slate-900",
    border: "border-slate-700/60 hover:border-emerald-500/60",
    selectedBg: "bg-emerald-500/10",
    selectedBorder: "border-emerald-400 shadow-emerald-500/20",
    dot: "bg-emerald-400",
  },
  occupied: {
    label: "Ocupada",
    bg: "bg-rose-500/5",
    border: "border-rose-500/40 hover:border-rose-400/70",
    selectedBg: "bg-rose-500/10",
    selectedBorder: "border-rose-400 shadow-rose-500/20",
    dot: "bg-rose-400",
  },
  reserved: {
    label: "Reservada",
    bg: "bg-amber-500/5",
    border: "border-amber-500/40 hover:border-amber-400/70",
    selectedBg: "bg-amber-500/10",
    selectedBorder: "border-amber-400 shadow-amber-500/20",
    dot: "bg-amber-400",
  },
};

export default function POSPage() {
  return (
    <Authenticated
      key="pos-page"
      loading={
        <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
        </div>
      }
    >
      <POSContent />
    </Authenticated>
  );
}

function useBranchId() {
  const [branchId] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const id = localStorage.getItem("branch_id");
    return id ? Number(id) : null;
  });
  return branchId;
}

function POSContent() {
  const branchId = useBranchId();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isDirect, setIsDirect] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<TableStatus | "all">("all");
  const [showDeliveryPanel, setShowDeliveryPanel] = useState(false);

  const { data: tables, isLoading: tablesLoading } = useTables(branchId);
  const { data: shift, isLoading: shiftLoading } = useCurrentShift(branchId);
  const { data: allOrders } = useOrders(branchId);
  const { data: servedOrders } = useOrders(branchId, "served", 4_000);
  const createOrder = useCreateOrder();
  const updateStatus = useUpdateOrderStatus();

  const pendingPickups = useMemo(
    () => (servedOrders ?? []).filter((o) => o.table_id !== null),
    [servedOrders]
  );

  const handleDeliver = (orderId: number) => {
    if (!branchId) return;
    updateStatus.mutate({ branchId, orderId, status: "delivered" });
  };

  const tableOrders = useMemo<Order[]>(() => {
    if (!allOrders || !selectedTable) return [];
    return allOrders.filter(
      (o) => o.table_id === selectedTable.id && ACTIVE_STATUSES.includes(o.status)
    );
  }, [allOrders, selectedTable]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1, notes: "" }];
    });
  };

  const updateQty = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const updateNotes = (productId: number, notes: string) => {
    setCart((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, notes } : i))
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedTable(null);
    setIsDirect(false);
  };

  const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const handleSubmit = () => {
    if (!branchId || (!selectedTable && !isDirect) || cart.length === 0) return;
    const items: OrderItemPayload[] = cart.map((i) => ({
      product_id: i.product.id,
      quantity: i.quantity,
      notes: i.notes || undefined,
    }));
    createOrder.mutate(
      { branchId, payload: { table_id: selectedTable?.id ?? null, items } },
      {
        onSuccess: (order) => {
          updateStatus.mutate(
            { branchId, orderId: order.id, status: "cooking" },
            { onSuccess: clearCart }
          );
        },
      }
    );
  };

  const selectTable = (table: Table) => {
    if (selectedTable?.id === table.id && !isDirect) return;
    setSelectedTable(table);
    setIsDirect(false);
    setCart([]);
  };

  const selectDirect = () => {
    if (isDirect) return;
    setSelectedTable(null);
    setIsDirect(true);
    setCart([]);
  };

  const filteredTables = useMemo(() => {
    if (!tables) return [];
    const sorted = [...tables].sort((a, b) => String(a.number).localeCompare(String(b.number), undefined, { numeric: true }));
    if (statusFilter === "all") return sorted;
    return sorted.filter((t) => t.status === statusFilter);
  }, [tables, statusFilter]);

  const counts = useMemo(() => {
    if (!tables) return { available: 0, occupied: 0, reserved: 0 };
    return {
      available: tables.filter((t) => t.status === "available").length,
      occupied: tables.filter((t) => t.status === "occupied").length,
      reserved: tables.filter((t) => t.status === "reserved").length,
    };
  }, [tables]);

  return (
    <div className="flex flex-col h-screen bg-[#080c18] text-slate-50">
      <AppHeader
        icon={<ChefHat className="w-5 h-5 text-cyan-400" />}
        title="Terminal de Ventas"
        subtitle={branchId ? `Sucursal #${branchId}` : "Sin sucursal"}
        actions={
          tables && tables.length > 0 ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-emerald-400 font-bold">{counts.available}</span>
              <span>libres</span>
              {counts.occupied > 0 && (
                <><span className="text-slate-700">·</span><span className="text-rose-400 font-bold">{counts.occupied}</span><span>ocupadas</span></>
              )}
            </div>
          ) : undefined
        }
      />

      {/* Sin turno activo */}
      {!shiftLoading && !shift && (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-amber-400 text-xs font-medium flex-shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          No hay turno activo. Abre un turno desde Administración antes de crear pedidos.
        </div>
      )}

      {/* Pedidos listos para retirar */}
      {pendingPickups.length > 0 && (
        <button
          onClick={() => setShowDeliveryPanel(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-500/10 border-b border-sky-500/20 text-sky-300 text-xs font-bold flex-shrink-0 hover:bg-sky-500/15 transition-colors w-full text-left"
        >
          <BellRing className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" />
          {pendingPickups.length} pedido{pendingPickups.length !== 1 ? "s" : ""} listo{pendingPickups.length !== 1 ? "s" : ""} para retirar en cocina
          <span className="ml-auto text-sky-400 underline underline-offset-2">Ver →</span>
        </button>
      )}

      {showDeliveryPanel && (
        <DeliveryPanel
          orders={pendingPickups}
          onDeliver={handleDeliver}
          onClose={() => setShowDeliveryPanel(false)}
          deliveringId={updateStatus.isPending ? (updateStatus.variables?.orderId ?? null) : null}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Tables panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Filter bar */}
          {tables && tables.length > 0 && (
            <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-slate-800/40 flex-shrink-0">
              <FilterChip label="Todas" count={tables.length} active={statusFilter === "all"} onClick={() => setStatusFilter("all")} color="slate" />
              <FilterChip label="Libres" count={counts.available} active={statusFilter === "available"} onClick={() => setStatusFilter("available")} color="emerald" />
              <FilterChip label="Ocupadas" count={counts.occupied} active={statusFilter === "occupied"} onClick={() => setStatusFilter("occupied")} color="rose" />
              <FilterChip label="Reservadas" count={counts.reserved} active={statusFilter === "reserved"} onClick={() => setStatusFilter("reserved")} color="amber" />
            </div>
          )}

          {/* Tables grid */}
          <div className="flex-1 p-5 overflow-y-auto">
            {branchId === null ? (
              <div className="flex items-center justify-center h-full">
                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-sm text-center">
                  <Store className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Tu cuenta no tiene una sucursal asignada.</p>
                </div>
              </div>
            ) : tablesLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
              </div>
            ) : !tables?.length ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-600">
                <UtensilsCrossed className="w-12 h-12 opacity-30" />
                <p>No hay mesas configuradas en esta sucursal</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {/* Venta directa */}
                <button
                  onClick={selectDirect}
                  className={`col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 xl:col-span-6 rounded-2xl border-2 flex items-center gap-3 px-5 py-3 transition-all duration-200 active:scale-[0.99] relative overflow-hidden ${
                    isDirect
                      ? "border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                      : "border-amber-500/30 bg-amber-500/5 hover:border-amber-400/60 hover:bg-amber-500/10"
                  }`}
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isDirect ? "bg-amber-500/20" : "bg-amber-500/10"}`}>
                    <ShoppingBag className="w-4.5 h-4.5 text-amber-400 w-[18px] h-[18px]" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-black uppercase tracking-widest text-amber-400">Venta directa</p>
                    <p className="text-[11px] text-slate-500 leading-tight">Sin mesa · Llevar · Mostrador</p>
                  </div>
                  {isDirect && (
                    <div className="ml-auto flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Activa</span>
                      {cart.length > 0 && (
                        <div className="ml-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                          <span className="text-[9px] font-black text-white">{cart.length}</span>
                        </div>
                      )}
                    </div>
                  )}
                </button>

                {filteredTables.map((table) => {
                  const cfg = TABLE_STATUS_CONFIG[table.status];
                  const isSelected = selectedTable?.id === table.id;
                  return (
                    <button
                      key={table.id}
                      onClick={() => selectTable(table)}
                      className={`
                        aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-1 
                        transition-all duration-200 active:scale-95 group relative overflow-hidden
                        ${isSelected
                          ? `${cfg.selectedBg} ${cfg.selectedBorder} shadow-lg`
                          : `${cfg.bg} ${cfg.border}`
                        }
                      `}
                    >
                      {/* Subtle gradient top */}
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      
                      <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-600 group-hover:text-slate-500 transition-colors">
                        Mesa
                      </span>
                      <span className="text-3xl font-black text-white leading-none">
                        {table.number}
                      </span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${isSelected ? 'animate-pulse' : ''}`} />
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                          {isSelected ? "Activa" : cfg.label}
                        </span>
                      </div>

                      {/* Cart badge */}
                      {isSelected && cart.length > 0 && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                          <span className="text-[9px] font-black text-white">{cart.length}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Order Sidebar */}
        <aside className="w-80 xl:w-96 bg-[#0c1020] border-l border-slate-800/70 flex flex-col flex-shrink-0">
          {selectedTable === null && !isDirect ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-slate-800/60 flex items-center justify-center">
                <ShoppingCart className="w-9 h-9 text-slate-600" />
              </div>
              <div>
                <p className="text-slate-400 font-medium text-sm">Sin mesa seleccionada</p>
                <p className="text-slate-600 text-xs mt-1">Elige una mesa o selecciona Venta directa</p>
              </div>
            </div>
          ) : (
            <>
              {!isDirect && tableOrders.length > 0 && (
                <TableActiveOrders orders={tableOrders} />
              )}
              <OrderPanel
                table={isDirect ? null : selectedTable}
                cart={cart}
                total={total}
                onAddProduct={addToCart}
                onUpdateQty={updateQty}
                onUpdateNotes={updateNotes}
                onRemove={removeFromCart}
                onClear={clearCart}
                onSubmit={handleSubmit}
                isSubmitting={createOrder.isPending || updateStatus.isPending}
              />
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

function FilterChip({ label, count, active, onClick, color }: { 
  label: string; count: number; active: boolean; onClick: () => void; color: string 
}) {
  const colors: Record<string, string> = {
    slate: active ? "bg-slate-700 text-white border-slate-600" : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600",
    emerald: active ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50" : "bg-slate-900 text-slate-400 border-slate-800 hover:border-emerald-500/30",
    rose: active ? "bg-rose-500/20 text-rose-300 border-rose-500/50" : "bg-slate-900 text-slate-400 border-slate-800 hover:border-rose-500/30",
    amber: active ? "bg-amber-500/20 text-amber-300 border-amber-500/50" : "bg-slate-900 text-slate-400 border-slate-800 hover:border-amber-500/30",
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${colors[color]}`}
    >
      {label}
      <span className={`text-[10px] font-bold px-1 rounded ${active ? 'opacity-80' : 'opacity-50'}`}>{count}</span>
    </button>
  );
}

function OrderPanel({
  table, cart, total, onAddProduct, onUpdateQty, onUpdateNotes, onRemove, onClear, onSubmit, isSubmitting,
}: {
  table: Table | null;
  cart: CartItem[];
  total: number;
  onAddProduct: (p: Product) => void;
  onUpdateQty: (id: number, delta: number) => void;
  onUpdateNotes: (id: number, notes: string) => void;
  onRemove: (id: number) => void;
  onClear: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const branchId = useBranchId();
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const { data: categories } = useCategories(branchId);
  const { data: products, isLoading: productsLoading } = useProducts(branchId, {
    active_only: true,
    category_id: categoryId ?? undefined,
  });

  const cartProductIds = useMemo(() => new Set(cart.map((i) => i.product.id)), [cart]);

  return (
    <>
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800/70">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Pedido activo</p>
          {table ? (
            <p className="font-bold text-white">Mesa {table.number}</p>
          ) : (
            <p className="font-bold text-amber-400 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5" />
              Venta directa
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {cart.length > 0 && (
            <span className="text-xs text-slate-500">{cart.reduce((s, i) => s + i.quantity, 0)} ítem{cart.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''}</span>
          )}
          <button
            onClick={onClear}
            disabled={isSubmitting}
            className="p-1.5 text-slate-600 hover:text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 px-3 py-2.5 overflow-x-auto flex-shrink-0 border-b border-slate-800/40">
        <CategoryTab label="Todo" active={categoryId === null} onClick={() => setCategoryId(null)} />
        {categories?.map((cat: Category) => (
          <CategoryTab key={cat.id} label={cat.name} active={categoryId === cat.id} onClick={() => setCategoryId(cat.id)} />
        ))}
      </div>

      {/* Products grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {productsLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 text-cyan-500 animate-spin" />
          </div>
        ) : !products?.length ? (
          <p className="text-center text-slate-600 text-sm py-10">Sin productos en esta categoría</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {products.map((product: Product) => {
              const inCart = cartProductIds.has(product.id);
              const cartQty = cart.find((i) => i.product.id === product.id)?.quantity;
              return (
                <button
                  key={product.id}
                  onClick={() => onAddProduct(product)}
                  className={`
                    relative p-3 rounded-xl border text-left transition-all duration-150 active:scale-95 group
                    ${inCart
                      ? "border-cyan-500/60 bg-cyan-500/10"
                      : "border-slate-700/60 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/60"
                    }
                  `}
                >
                  {inCart && cartQty && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-[9px] font-black text-white">{cartQty}</span>
                    </div>
                  )}
                  <p className="text-xs font-semibold text-slate-200 leading-tight line-clamp-2 pr-4">{product.name}</p>
                  <p className="text-xs text-slate-500 mt-1.5 font-mono">${product.price.toLocaleString("es-CL")}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart items */}
      {cart.length > 0 && (
        <div className="border-t border-slate-800/70 max-h-52 overflow-y-auto flex-shrink-0">
          <div className="divide-y divide-slate-800/50">
            {cart.map((item) => (
              <CartRow key={item.product.id} item={item} onUpdateQty={onUpdateQty} onUpdateNotes={onUpdateNotes} onRemove={onRemove} />
            ))}
          </div>
        </div>
      )}

      {/* Footer / Submit */}
      <div className="p-4 border-t border-slate-800/70 flex-shrink-0 bg-[#0a0e1a]/50">
        {cart.length > 0 && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 text-sm">Total</span>
            <span className="font-black text-white text-lg">${total.toLocaleString("es-CL")}</span>
          </div>
        )}
        <button
          onClick={onSubmit}
          disabled={cart.length === 0 || isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Enviar a cocina
        </button>
      </div>
    </>
  );
}

function CategoryTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
        active ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20" : "bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
      }`}
    >
      {label}
    </button>
  );
}

function CartRow({ item, onUpdateQty, onUpdateNotes, onRemove }: {
  item: CartItem;
  onUpdateQty: (id: number, delta: number) => void;
  onUpdateNotes: (id: number, notes: string) => void;
  onRemove: (id: number) => void;
}) {
  const [showNotes, setShowNotes] = useState(false);
  const hasNote = item.notes.trim().length > 0;

  return (
    <div className="px-4 py-2.5">
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">{item.product.name}</p>
          <p className="text-xs text-slate-500 font-mono">${(item.product.price * item.quantity).toLocaleString("es-CL")}</p>
        </div>
        <button
          onClick={() => setShowNotes((v) => !v)}
          title={hasNote ? item.notes : "Agregar nota"}
          className={`relative w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
            hasNote || showNotes
              ? "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25"
              : "bg-slate-800 text-slate-600 hover:text-slate-400 hover:bg-slate-700"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          {hasNote && !showNotes && (
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-amber-400 rounded-full" />
          )}
        </button>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={() => item.quantity === 1 ? onRemove(item.product.id) : onUpdateQty(item.product.id, -1)}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors"
          >
            {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-rose-400" /> : <Minus className="w-3 h-3" />}
          </button>
          <span className="w-7 text-center text-sm font-bold">{item.quantity}</span>
          <button
            onClick={() => onUpdateQty(item.product.id, 1)}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
      {!showNotes && hasNote && (
        <p className="mt-1 text-[11px] text-amber-400/80 truncate pl-0.5">{item.notes}</p>
      )}
      {showNotes && (
        <input
          autoFocus
          type="text"
          placeholder="Ej: sin palta, extra salsa..."
          value={item.notes}
          onChange={(e) => onUpdateNotes(item.product.id, e.target.value)}
          onBlur={() => { if (!item.notes.trim()) setShowNotes(false); }}
          className="mt-1.5 w-full px-3 py-1.5 bg-slate-800/60 border border-amber-500/30 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500"
        />
      )}
    </div>
  );
}

const STATUS_DOT: Record<OrderStatus, string> = {
  pending:   "bg-amber-400",
  cooking:   "bg-orange-400",
  served:    "bg-sky-400",
  delivered: "bg-emerald-400",
  paid:      "bg-emerald-600",
  cancelled: "bg-slate-600",
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending:   "Pendiente",
  cooking:   "En cocina",
  served:    "Listo en cocina",
  delivered: "Entregado",
  paid:      "Pagado",
  cancelled: "Cancelado",
};

function TableActiveOrders({ orders }: { orders: Order[] }) {
  const branchId = useBranchId();
  const { data: products } = useProducts(branchId, { active_only: true });
  const productMap = useMemo<Record<number, string>>(
    () => Object.fromEntries((products ?? []).map((p) => [p.id, p.name])),
    [products]
  );

  return (
    <div className="border-b border-slate-800/70 flex-shrink-0">
      <div className="px-4 pt-3 pb-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Pedidos en curso
        </p>
      </div>
      <div className="max-h-52 overflow-y-auto divide-y divide-slate-800/50">
        {orders.map((order) => (
          <div key={order.id} className="px-4 py-2.5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[order.status]}`} />
              <span className="text-xs font-bold text-slate-300">Pedido #{order.id}</span>
              <span className="text-[10px] text-slate-500 ml-auto">{STATUS_LABEL[order.status]}</span>
            </div>
            <div className="space-y-0.5">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-500 w-5 text-right flex-shrink-0">
                    ×{item.quantity}
                  </span>
                  <span className="text-slate-300 truncate">
                    {item.product_name ?? productMap[item.product_id] ?? `#${item.product_id}`}
                  </span>
                </div>
              ))}
            </div>
            {order.total != null && order.total > 0 && (
              <p className="text-right text-xs font-bold text-slate-400 mt-1.5">
                ${order.total.toLocaleString("es-CL")}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DeliveryPanel({
  orders, onDeliver, onClose, deliveringId,
}: {
  orders: Order[];
  onDeliver: (orderId: number) => void;
  onClose: () => void;
  deliveringId: number | null;
}) {
  const branchId = useBranchId();
  const { data: products } = useProducts(branchId, { active_only: true });
  const productMap = useMemo<Record<number, string>>(
    () => Object.fromEntries((products ?? []).map((p) => [p.id, p.name])),
    [products]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-sky-400" />
            <h2 className="font-bold text-white text-sm">Listos para retirar</h2>
            <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 text-xs font-bold rounded-full">
              {orders.length}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order list */}
        <div className="overflow-y-auto flex-1 divide-y divide-slate-800/60">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-600">
              <CheckCircle2 className="w-10 h-10 opacity-30" />
              <p className="text-sm">Todo entregado</p>
            </div>
          ) : (
            orders
              .slice()
              .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
              .map((order) => (
                <div key={order.id} className="px-5 py-4 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mesa</span>
                      <span className="text-xl font-black text-white leading-none">
                        {order.table_number ?? order.table_id}
                      </span>
                      <span className="text-xs text-slate-600">· Pedido #{order.id}</span>
                    </div>
                    <div className="space-y-1">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="font-bold text-sky-400 w-5 text-right flex-shrink-0">×{item.quantity}</span>
                          <span className="text-slate-300 truncate">
                            {item.product_name ?? productMap[item.product_id] ?? `Producto #${item.product_id}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => onDeliver(order.id)}
                    disabled={deliveringId === order.id}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all active:scale-95 shadow-md shadow-sky-500/20 disabled:opacity-50"
                  >
                    {deliveringId === order.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <CheckCircle2 className="w-3.5 h-3.5" />
                    }
                    Entregar
                  </button>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
