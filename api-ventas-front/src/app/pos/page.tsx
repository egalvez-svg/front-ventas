"use client";

import { Authenticated } from "@refinedev/core";
import { useState, useMemo, useEffect } from "react";
import {
  Store, Loader2, ShoppingCart, Plus, Minus, Trash2, Send, X,
  UtensilsCrossed, ChefHat, AlertTriangle, MessageSquare, ShoppingBag,
  BellRing, CheckCircle2, Grid3x3, ArrowLeft, Ticket,
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
import { useValidateCoupon, type CouponValidation } from "@/hooks/useCoupons";

interface CartItem {
  product: Product;
  quantity: number;
  notes: string;
}

const TABLE_STATUS_CONFIG: Record<TableStatus, {
  label: string;
  accent: string;
  ring: string;
  icon: string;
  badge: string;
  selectedRing: string;
}> = {
  available: {
    label: "Libre",
    accent: "bg-emerald-500",
    ring: "border-stone-200 dark:border-slate-700/80",
    icon: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    selectedRing: "ring-emerald-500 dark:ring-emerald-400",
  },
  occupied: {
    label: "Ocupada",
    accent: "bg-rose-500",
    ring: "border-rose-200 dark:border-rose-900/60",
    icon: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    selectedRing: "ring-rose-500 dark:ring-rose-400",
  },
  reserved: {
    label: "Reservada",
    accent: "bg-amber-500",
    ring: "border-amber-200 dark:border-amber-900/60",
    icon: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    selectedRing: "ring-amber-500 dark:ring-amber-400",
  },
};

export default function POSPage() {
  return (
    <Authenticated
      key="pos-page"
      loading={
        <div className="min-h-screen bg-stone-50 dark:bg-[#0a0e1a] flex items-center justify-center">
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
  const [mobileView, setMobileView] = useState<"tables" | "order">("tables");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const { data: tables, isLoading: tablesLoading } = useTables(branchId);
  const { data: shift, isLoading: shiftLoading } = useCurrentShift(branchId);
  const { data: allOrders } = useOrders(branchId);
  const { data: servedOrders } = useOrders(branchId, "served", 4_000);
  const createOrder = useCreateOrder();
  const updateStatus = useUpdateOrderStatus();
  const validateCoupon = useValidateCoupon();

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
    setMobileView("tables");
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
  };

  const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  useEffect(() => {
    setAppliedCoupon(null);
    setCouponError(null);
  }, [total]);

  const handleValidateCoupon = (code: string) => {
    if (!branchId || !code.trim()) return;
    setCouponError(null);
    validateCoupon.mutate(
      { branchId, code: code.trim().toUpperCase(), orderTotal: total },
      {
        onSuccess: (data) => setAppliedCoupon(data),
        onError: (err: unknown) => {
          setAppliedCoupon(null);
          const e = err as { response?: { data?: { detail?: string } } };
          setCouponError(e.response?.data?.detail || "Cupón inválido o no aplicable");
        },
      }
    );
  };

  const handleClearCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
  };

  const handleSubmit = () => {
    if (!branchId || (!selectedTable && !isDirect) || cart.length === 0) return;
    const items: OrderItemPayload[] = cart.map((i) => ({
      product_id: i.product.id,
      quantity: i.quantity,
      notes: i.notes || undefined,
    }));
    createOrder.mutate(
      {
        branchId,
        payload: {
          table_id: selectedTable?.id ?? null,
          items,
          coupon_code: appliedCoupon?.code,
        },
      },
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
    setMobileView("order");
  };

  const selectDirect = () => {
    if (isDirect) return;
    setSelectedTable(null);
    setIsDirect(true);
    setCart([]);
    setMobileView("order");
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
    <div className="flex flex-col h-screen bg-stone-50 dark:bg-[#080c18] text-stone-900 dark:text-slate-50">
      <AppHeader
        icon={<ChefHat className="w-5 h-5 text-cyan-400" />}
        title="Terminal de Ventas"
        subtitle={branchId ? `Sucursal #${branchId}` : "Sin sucursal"}
        actions={
          tables && tables.length > 0 ? (
            <div className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-slate-500">
              <span className="text-emerald-500 dark:text-emerald-400 font-bold">{counts.available}</span>
              <span>libres</span>
              {counts.occupied > 0 && (
                <><span className="text-stone-300 dark:text-slate-700">·</span><span className="text-rose-500 dark:text-rose-400 font-bold">{counts.occupied}</span><span>ocupadas</span></>
              )}
            </div>
          ) : undefined
        }
      />

      {/* Sin turno activo */}
      {!shiftLoading && !shift && (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium flex-shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          No hay turno activo. Abre un turno desde Administración antes de crear pedidos.
        </div>
      )}

      {/* Pedidos listos para retirar */}
      {pendingPickups.length > 0 && (
        <button
          onClick={() => setShowDeliveryPanel(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-500/10 border-b border-sky-500/20 text-sky-600 dark:text-sky-300 text-xs font-bold flex-shrink-0 hover:bg-sky-500/15 transition-colors w-full text-left"
        >
          <BellRing className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" />
          {pendingPickups.length} pedido{pendingPickups.length !== 1 ? "s" : ""} listo{pendingPickups.length !== 1 ? "s" : ""} para retirar en cocina
          <span className="ml-auto text-sky-500 dark:text-sky-400 underline underline-offset-2">Ver →</span>
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
        <div className={`flex-1 flex-col overflow-hidden ${mobileView === "order" ? "hidden lg:flex" : "flex"}`}>
          {/* Filter bar */}
          {tables && tables.length > 0 && (
            <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-stone-200 dark:border-slate-800/40 flex-shrink-0 flex-wrap">
              {([
                { key: "all", label: "Total", count: tables.length, active: "bg-stone-700 dark:bg-slate-700 text-white", inactive: "bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700" },
                { key: "available", label: "Libres", count: counts.available, active: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/40", inactive: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20" },
                { key: "occupied", label: "Ocupadas", count: counts.occupied, active: "bg-rose-500/20 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/40", inactive: "bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20" },
                { key: "reserved", label: "Reservadas", count: counts.reserved, active: "bg-amber-500/20 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/40", inactive: "bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20" },
              ] as const).map(({ key, label, count, active, inactive }) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === key ? active : inactive}`}
                >
                  <span className="text-base font-bold">{count}</span>
                  <span className="opacity-80">{label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Tables grid */}
          <div className="flex-1 p-5 overflow-y-auto">
            {branchId === null ? (
              <div className="flex items-center justify-center h-full">
                <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl p-8 max-w-sm text-center">
                  <Store className="w-10 h-10 text-stone-400 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-stone-500 dark:text-slate-400 text-sm">Tu cuenta no tiene una sucursal asignada.</p>
                </div>
              </div>
            ) : tablesLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
              </div>
            ) : !tables?.length ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-stone-400 dark:text-slate-600">
                <UtensilsCrossed className="w-12 h-12 opacity-30" />
                <p>No hay mesas configuradas en esta sucursal</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {/* Venta directa */}
                <button
                  onClick={selectDirect}
                  className={`col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 xl:col-span-6 rounded-2xl border-2 flex items-center gap-3 px-5 py-3 transition-all duration-200 active:scale-[0.99] relative overflow-hidden ${isDirect
                    ? "border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                    : "border-amber-500/30 bg-amber-500/5 hover:border-amber-400/60 hover:bg-amber-500/10"
                    }`}
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isDirect ? "bg-amber-500/20" : "bg-amber-500/10"}`}>
                    <ShoppingBag className="w-4.5 h-4.5 text-amber-400 w-[18px] h-[18px]" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Venta directa</p>
                    <p className="text-[11px] text-stone-400 dark:text-slate-500 leading-tight">Sin mesa · Llevar · Mostrador</p>
                  </div>
                  {isDirect && (
                    <div className="ml-auto flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Activa</span>
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
                        group flex flex-col bg-white dark:bg-slate-900 border-2 ${cfg.ring} rounded-2xl overflow-hidden
                        transition-all duration-200 active:scale-95 hover:shadow-lg hover:-translate-y-0.5 relative
                        ${isSelected ? `ring-2 ring-offset-2 ring-offset-stone-50 dark:ring-offset-[#080c18] ${cfg.selectedRing}` : ""}
                      `}
                    >
                      {/* Status accent bar */}
                      <div className={`h-1 w-full ${cfg.accent}`} />

                      {/* Content */}
                      <div className="flex flex-col items-center gap-2 px-4 pt-5 pb-4 flex-1">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.icon}`}>
                          <Grid3x3 className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-bold text-stone-800 dark:text-slate-100">
                          Mesa {table.number}
                        </p>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${isSelected ? "bg-cyan-500 text-white" : cfg.badge}`}>
                          {isSelected ? "Activa" : cfg.label}
                        </span>
                      </div>

                      {/* Cart badge */}
                      {isSelected && cart.length > 0 && (
                        <div className="absolute top-3 right-3 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
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
        <aside className={`bg-white dark:bg-[#0c1020] border-l border-stone-200 dark:border-slate-800/70 flex-col flex-shrink-0 lg:w-80 xl:w-96 ${mobileView === "tables" ? "hidden lg:flex" : "flex w-full"}`}>
          {selectedTable === null && !isDirect ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-stone-200 dark:bg-slate-800/60 flex items-center justify-center">
                <ShoppingCart className="w-9 h-9 text-stone-400 dark:text-slate-600" />
              </div>
              <div>
                <p className="text-stone-500 dark:text-slate-400 font-medium text-sm">Sin mesa seleccionada</p>
                <p className="text-stone-400 dark:text-slate-600 text-xs mt-1">Elige una mesa o selecciona Venta directa</p>
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
                onBack={() => setMobileView("tables")}
                couponCode={couponCode}
                onCouponCodeChange={(code) => { setCouponCode(code); setCouponError(null); }}
                appliedCoupon={appliedCoupon}
                onValidateCoupon={handleValidateCoupon}
                onClearCoupon={handleClearCoupon}
                isValidatingCoupon={validateCoupon.isPending}
                couponError={couponError}
              />
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

function OrderPanel({
  table, cart, total, onAddProduct, onUpdateQty, onUpdateNotes, onRemove, onClear, onSubmit, isSubmitting, onBack,
  couponCode, onCouponCodeChange, appliedCoupon, onValidateCoupon, onClearCoupon, isValidatingCoupon, couponError,
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
  onBack: () => void;
  couponCode: string;
  onCouponCodeChange: (code: string) => void;
  appliedCoupon: CouponValidation | null;
  onValidateCoupon: (code: string) => void;
  onClearCoupon: () => void;
  isValidatingCoupon: boolean;
  couponError: string | null;
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
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-stone-200 dark:border-slate-800/70">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBack}
            className="lg:hidden flex-shrink-0 p-1.5 -ml-1 text-stone-400 dark:text-slate-500 hover:text-stone-700 dark:hover:text-slate-300 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="text-[10px] text-stone-400 dark:text-slate-500 uppercase tracking-widest font-medium">Pedido activo</p>
            {table ? (
              <p className="font-bold text-stone-900 dark:text-white">Mesa {table.number}</p>
            ) : (
              <p className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" />
                Venta directa
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {cart.length > 0 && (
            <span className="text-xs text-stone-400 dark:text-slate-500">{cart.reduce((s, i) => s + i.quantity, 0)} ítem{cart.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''}</span>
          )}
          <button
            onClick={onClear}
            disabled={isSubmitting}
            className="p-1.5 text-stone-400 dark:text-slate-600 hover:text-stone-700 dark:hover:text-slate-300 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 px-3 py-2.5 overflow-x-auto flex-shrink-0 border-b border-stone-200 dark:border-slate-800/40">
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
          <p className="text-center text-stone-400 dark:text-slate-600 text-sm py-10">Sin productos en esta categoría</p>
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
                      : "border-stone-200 dark:border-slate-700/60 bg-stone-50 dark:bg-slate-800/30 hover:border-stone-400 dark:hover:border-slate-600 hover:bg-stone-100 dark:hover:bg-slate-800/60"
                    }
                  `}
                >
                  {inCart && cartQty && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-[9px] font-black text-white">{cartQty}</span>
                    </div>
                  )}
                  <p className="text-xs font-semibold text-stone-800 dark:text-slate-200 leading-tight line-clamp-2 pr-4">{product.name}</p>
                  <p className="text-xs text-stone-400 dark:text-slate-500 mt-1.5 font-mono">${product.price.toLocaleString("es-CL")}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart items */}
      {cart.length > 0 && (
        <div className="border-t border-stone-200 dark:border-slate-800/70 max-h-52 overflow-y-auto flex-shrink-0">
          <div className="divide-y divide-stone-100 dark:divide-slate-800/50">
            {cart.map((item) => (
              <CartRow key={item.product.id} item={item} onUpdateQty={onUpdateQty} onUpdateNotes={onUpdateNotes} onRemove={onRemove} />
            ))}
          </div>
        </div>
      )}

      {/* Footer / Submit */}
      <div className="p-4 border-t border-stone-200 dark:border-slate-800/70 flex-shrink-0 bg-stone-50/50 dark:bg-[#0a0e1a]/50">
        {/* Cupón */}
        {cart.length > 0 && (() => {
          const discountAmt = appliedCoupon
            ? (appliedCoupon.discount_amount ??
                (appliedCoupon.discount_type === "percentage"
                  ? Math.round(total * appliedCoupon.discount_value / 100)
                  : appliedCoupon.discount_value))
            : 0;
          const finalTotal = appliedCoupon
            ? (appliedCoupon.final_total ?? Math.max(0, total - discountAmt))
            : total;

          return (
            <>
              <div className="mb-3">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Ticket className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">{appliedCoupon.code}</span>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 truncate">
                        −${discountAmt.toLocaleString("es-CL")}
                      </span>
                    </div>
                    <button
                      onClick={onClearCoupon}
                      className="text-emerald-500 hover:text-emerald-300 transition-colors ml-2 flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Código de cupón"
                      value={couponCode}
                      onChange={(e) => onCouponCodeChange(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && couponCode.trim() && onValidateCoupon(couponCode)}
                      disabled={isValidatingCoupon}
                      className="flex-1 px-3 py-2 bg-stone-100 dark:bg-slate-800/60 border border-stone-300 dark:border-slate-700 rounded-xl text-xs text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 font-mono tracking-wider disabled:opacity-50"
                    />
                    <button
                      onClick={() => onValidateCoupon(couponCode)}
                      disabled={!couponCode.trim() || isValidatingCoupon}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold rounded-xl transition-all active:scale-95 disabled:opacity-30 flex items-center gap-1"
                    >
                      {isValidatingCoupon
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Ticket className="w-3.5 h-3.5" />
                      }
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="mt-1.5 text-[11px] text-rose-500 dark:text-rose-400 pl-1">{couponError}</p>
                )}
              </div>

              {/* Total */}
              <div className="mb-3">
                {appliedCoupon ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400 dark:text-slate-500 text-xs">Subtotal</span>
                      <span className="font-semibold text-stone-600 dark:text-slate-400 text-sm">${total.toLocaleString("es-CL")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-500 text-xs">Descuento</span>
                      <span className="font-semibold text-emerald-500 text-sm">−${discountAmt.toLocaleString("es-CL")}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-stone-200 dark:border-slate-800/70 pt-1.5">
                      <span className="text-stone-500 dark:text-slate-400 text-sm">Total</span>
                      <span className="font-black text-stone-900 dark:text-white text-lg">${finalTotal.toLocaleString("es-CL")}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 dark:text-slate-500 text-sm">Total</span>
                    <span className="font-black text-stone-900 dark:text-white text-lg">${total.toLocaleString("es-CL")}</span>
                  </div>
                )}
              </div>
            </>
          );
        })()}

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
      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${active
        ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
        : "bg-stone-100 dark:bg-slate-800/70 text-stone-500 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-200 hover:bg-stone-200 dark:hover:bg-slate-800"
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
          <p className="text-sm font-medium text-stone-800 dark:text-slate-200 truncate">{item.product.name}</p>
          <p className="text-xs text-stone-400 dark:text-slate-500 font-mono">${(item.product.price * item.quantity).toLocaleString("es-CL")}</p>
        </div>
        <button
          onClick={() => setShowNotes((v) => !v)}
          title={hasNote ? item.notes : "Agregar nota"}
          className={`relative w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${hasNote || showNotes
            ? "bg-amber-500/15 text-amber-500 dark:text-amber-400 hover:bg-amber-500/25"
            : "bg-stone-100 dark:bg-slate-800 text-stone-400 dark:text-slate-600 hover:text-stone-600 dark:hover:text-slate-400 hover:bg-stone-200 dark:hover:bg-slate-700"
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
            className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 flex items-center justify-center text-stone-500 dark:text-slate-400 transition-colors"
          >
            {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-rose-500 dark:text-rose-400" /> : <Minus className="w-3 h-3" />}
          </button>
          <span className="w-7 text-center text-sm font-bold text-stone-900 dark:text-white">{item.quantity}</span>
          <button
            onClick={() => onUpdateQty(item.product.id, 1)}
            className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 flex items-center justify-center text-stone-500 dark:text-slate-400 transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
      {!showNotes && hasNote && (
        <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400/80 truncate pl-0.5">{item.notes}</p>
      )}
      {showNotes && (
        <input
          autoFocus
          type="text"
          placeholder="Ej: sin palta, extra salsa..."
          value={item.notes}
          onChange={(e) => onUpdateNotes(item.product.id, e.target.value)}
          onBlur={() => { if (!item.notes.trim()) setShowNotes(false); }}
          className="mt-1.5 w-full px-3 py-1.5 bg-stone-100 dark:bg-slate-800/60 border border-amber-500/30 rounded-lg text-xs text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500"
        />
      )}
    </div>
  );
}

const STATUS_DOT: Record<OrderStatus, string> = {
  pending: "bg-amber-400",
  cooking: "bg-orange-400",
  served: "bg-sky-400",
  delivered: "bg-emerald-400",
  paid: "bg-emerald-600",
  cancelled: "bg-slate-600",
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pendiente",
  cooking: "En cocina",
  served: "Listo en cocina",
  delivered: "Entregado",
  paid: "Pagado",
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
    <div className="border-b border-stone-200 dark:border-slate-800/70 flex-shrink-0">
      <div className="px-4 pt-3 pb-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-slate-500">
          Pedidos en curso
        </p>
      </div>
      <div className="max-h-52 overflow-y-auto divide-y divide-stone-100 dark:divide-slate-800/50">
        {orders.map((order) => (
          <div key={order.id} className="px-4 py-2.5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[order.status]}`} />
              <span className="text-xs font-bold text-stone-700 dark:text-slate-300">Pedido #{order.id}</span>
              <span className="text-[10px] text-stone-400 dark:text-slate-500 ml-auto">{STATUS_LABEL[order.status]}</span>
            </div>
            <div className="space-y-0.5">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-stone-400 dark:text-slate-500 w-5 text-right flex-shrink-0">
                    ×{item.quantity}
                  </span>
                  <span className="text-stone-700 dark:text-slate-300 truncate">
                    {item.product_name ?? productMap[item.product_id] ?? `#${item.product_id}`}
                  </span>
                </div>
              ))}
            </div>
            {order.total != null && order.total > 0 && (
              <p className="text-right text-xs font-bold text-stone-500 dark:text-slate-400 mt-1.5">
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
      <div className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-sky-400" />
            <h2 className="font-bold text-stone-900 dark:text-white text-sm">Listos para retirar</h2>
            <span className="px-2 py-0.5 bg-sky-500/20 text-sky-600 dark:text-sky-300 text-xs font-bold rounded-full">
              {orders.length}
            </span>
          </div>
          <button onClick={onClose} className="text-stone-400 dark:text-slate-500 hover:text-stone-700 dark:hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order list */}
        <div className="overflow-y-auto flex-1 divide-y divide-stone-100 dark:divide-slate-800/60">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-stone-400 dark:text-slate-600">
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
                      <span className="text-xs font-bold text-stone-500 dark:text-slate-400 uppercase tracking-wider">Mesa</span>
                      <span className="text-xl font-black text-stone-900 dark:text-white leading-none">
                        {order.table_number ?? order.table_id}
                      </span>
                      <span className="text-xs text-stone-400 dark:text-slate-600">· Pedido #{order.id}</span>
                    </div>
                    <div className="space-y-1">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="font-bold text-sky-500 dark:text-sky-400 w-5 text-right flex-shrink-0">×{item.quantity}</span>
                          <span className="text-stone-700 dark:text-slate-300 truncate">
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
