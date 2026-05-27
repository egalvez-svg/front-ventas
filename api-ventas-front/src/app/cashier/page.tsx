"use client";

import { Authenticated } from "@refinedev/core";
import { useState, useMemo } from "react";
import {
  Receipt, Loader2, RefreshCw, X, Store, DollarSign,
  CheckCircle2, Printer, Users, ShoppingBag, Tag, Clock,
  TrendingUp,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import {
  useOrders,
  useUpdateOrderStatus,
  useOrderInvoice,
  ACTIVE_STATUSES,
  type Order,
  type Invoice,
  type OrderStatus,
} from "@/hooks/useOrders";
import { useCurrentShiftOrders } from "@/hooks/useShifts";
import { useValidateCoupon, type CouponValidation } from "@/hooks/useCoupons";
import { TablePaymentModal } from "@/components/TablePaymentModal";
import { useReleaseTable } from "@/hooks/useTables";
import { useProducts } from "@/hooks/useProducts";
import { RoleGuard } from "@/components/RoleGuard";
import { ROUTE_ROLES } from "@/lib/roles";

export default function CashierPage() {
  return (
    <Authenticated
      key="cashier-page"
      loading={
        <div className="min-h-screen bg-stone-50 dark:bg-[#080c18] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
      }
    >
      <RoleGuard allowedRoles={ROUTE_ROLES.cashier}>
        <CashierContent />
      </RoleGuard>
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

function CashierContent() {
  const branchId = useBranchId();
  const [tab, setTab] = useState<"pending" | "shift">("pending");
  const [selected, setSelected] = useState<Order | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [shiftOrderDetail, setShiftOrderDetail] = useState<Order | null>(null);

  const { data: servedOrders, isLoading, isFetching, isError } = useOrders(branchId, "served", 4_000);
  const { data: deliveredOrders } = useOrders(branchId, "delivered", 4_000);
  const orders = useMemo(
    () => [...(servedOrders ?? []), ...(deliveredOrders ?? [])],
    [servedOrders, deliveredOrders]
  );
  const { data: products } = useProducts(branchId, { active_only: true });
  const productMap = useMemo<Record<number, string>>(
    () => Object.fromEntries((products ?? []).map((p) => [p.id, p.name])),
    [products]
  );

  const tableOrderCounts = useMemo<Record<number, number>>(() => {
    const counts: Record<number, number> = {};
    for (const order of orders ?? []) {
      if (order.table_id == null) continue;
      counts[order.table_id] = (counts[order.table_id] ?? 0) + 1;
    }
    return counts;
  }, [orders]);

  const count = orders?.length ?? 0;

  return (
    <div className="h-screen bg-stone-50 dark:bg-[#080c18] text-stone-900 dark:text-slate-50 flex flex-col">
      <AppHeader
        icon={<Receipt className="w-5 h-5 text-emerald-400" />}
        title="Caja"
        subtitle={branchId ? `Sucursal #${branchId}` : "Sin sucursal"}
        actions={
          <div className="flex items-center gap-2">
            {count > 0 && tab === "pending" && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                <DollarSign className="w-3.5 h-3.5" />
                {count} listo{count !== 1 ? "s" : ""} para cobrar
              </div>
            )}
            {isFetching && <RefreshCw className="w-3.5 h-3.5 animate-spin text-stone-400 dark:text-slate-500" />}
          </div>
        }
      />

      {/* Tab bar */}
      {branchId !== null && (
        <div className="px-5 pt-4 pb-0 flex gap-2 border-b border-stone-200 dark:border-slate-800">
          <TabButton active={tab === "pending"} onClick={() => setTab("pending")}>
            <DollarSign className="w-3.5 h-3.5" />
            Por cobrar
            {count > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white leading-none">
                {count}
              </span>
            )}
          </TabButton>
          <TabButton active={tab === "shift"} onClick={() => setTab("shift")}>
            <Clock className="w-3.5 h-3.5" />
            Turno actual
          </TabButton>
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-5">
        {branchId === null ? (
          <div className="flex items-center justify-center h-full">
            <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl p-8 max-w-sm text-center">
              <Store className="w-10 h-10 text-stone-400 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-stone-500 dark:text-slate-400 text-sm">Tu cuenta no tiene una sucursal asignada.</p>
            </div>
          </div>
        ) : tab === "shift" ? (
          <ShiftOrdersPanel branchId={branchId} onSelect={setShiftOrderDetail} />
        ) : isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-full text-stone-400 dark:text-slate-500">
            <p>Error al cargar los pedidos</p>
          </div>
        ) : !orders?.length ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-24 h-24 rounded-full bg-stone-200 dark:bg-slate-900/60 flex items-center justify-center">
              <Receipt className="w-12 h-12 text-stone-400 dark:text-slate-700 opacity-40" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-stone-500 dark:text-slate-500">Sin pedidos para cobrar</p>
              <p className="text-sm text-stone-400 dark:text-slate-600 mt-1">Los pedidos servidos aparecerán aquí</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {orders
              .slice()
              .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
              .map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  productMap={productMap}
                  onClick={() => setSelected(order)}
                />
              ))}
          </div>
        )}
      </main>

      {selected && branchId && (
        <CheckoutModal
          branchId={branchId}
          order={selected}
          siblingCount={selected.table_id != null ? (tableOrderCounts[selected.table_id] ?? 1) - 1 : 0}
          onClose={() => setSelected(null)}
          onPayTable={() => {
            if (selected.table_id != null) {
              setSelectedTableId(selected.table_id);
              setSelected(null);
            }
          }}
        />
      )}

      {selectedTableId !== null && branchId && (
        <TablePaymentModal
          branchId={branchId}
          tableId={selectedTableId}
          tableNumber={orders?.find((o) => o.table_id === selectedTableId)?.table_number}
          onClose={() => setSelectedTableId(null)}
        />
      )}

      {shiftOrderDetail && branchId && (
        <ShiftOrderDetailModal
          branchId={branchId}
          order={shiftOrderDetail}
          onClose={() => setShiftOrderDetail(null)}
          onCheckout={(order) => {
            setShiftOrderDetail(null);
            setTab("pending");
            setSelected(order);
          }}
        />
      )}
    </div>
  );
}

function TabButton({
  active, onClick, children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-lg border-b-2 transition-all ${
        active
          ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
          : "border-transparent text-stone-400 dark:text-slate-500 hover:text-stone-600 dark:hover:text-slate-300"
      }`}
    >
      {children}
    </button>
  );
}

const ORDER_STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  pending:   { label: "Pendiente",  cls: "bg-stone-100 text-stone-600 dark:bg-slate-700 dark:text-slate-300" },
  cooking:   { label: "Cocinando",  cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
  served:    { label: "Servido",    cls: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400" },
  delivered: { label: "Entregado",  cls: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400" },
  paid:      { label: "Cobrado",    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
  cancelled: { label: "Cancelado",  cls: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400" },
};

function ShiftOrdersPanel({ branchId, onSelect }: { branchId: number; onSelect: (order: Order) => void }) {
  const { data: orders, isLoading } = useCurrentShiftOrders(branchId);

  const { totalCobrado, totalActivo, paidCount } = useMemo(() => {
    if (!orders) return { totalCobrado: 0, totalActivo: 0, paidCount: 0 };
    let cobrado = 0, activo = 0, paid = 0;
    for (const o of orders) {
      if (o.status === "paid") { cobrado += o.total ?? 0; paid++; }
      else if (o.status !== "cancelled") activo += o.total ?? 0;
    }
    return { totalCobrado: cobrado, totalActivo: activo, paidCount: paid };
  }, [orders]);

  const sorted = useMemo(
    () => [...(orders ?? [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [orders]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-3">
        <Clock className="w-10 h-10 text-stone-300 dark:text-slate-700" />
        <p className="text-sm text-stone-400 dark:text-slate-500">Sin pedidos en este turno</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-slate-500">Pedidos</p>
          <p className="text-2xl font-black text-stone-900 dark:text-white mt-1">{orders.length}</p>
          <p className="text-[11px] text-stone-400 dark:text-slate-500 mt-0.5">{paidCount} cobrado{paidCount !== 1 ? "s" : ""}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500">Cobrado</p>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
            ${totalCobrado.toLocaleString("es-CL")}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-[11px] text-emerald-600 dark:text-emerald-500">en el turno</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-slate-500">Pendiente</p>
          <p className="text-2xl font-black text-stone-900 dark:text-white mt-1">
            ${totalActivo.toLocaleString("es-CL")}
          </p>
          <p className="text-[11px] text-stone-400 dark:text-slate-500 mt-0.5">sin cobrar</p>
        </div>
      </div>

      {/* Orders list */}
      <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        {sorted.map((order, i) => {
          const style = ORDER_STATUS_STYLE[order.status] ?? ORDER_STATUS_STYLE.pending;
          const time = new Date(order.created_at).toLocaleTimeString("es-CL", {
            hour: "2-digit", minute: "2-digit",
          });
          const isDirect = order.table_id == null;
          return (
            <button
              key={order.id}
              onClick={() => onSelect(order)}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors hover:bg-stone-50 dark:hover:bg-slate-800/60 active:bg-stone-100 dark:active:bg-slate-800 ${
                i !== sorted.length - 1 ? "border-b border-stone-100 dark:border-slate-800" : ""
              }`}
            >
              <span className="text-sm font-black text-stone-500 dark:text-slate-400 w-10 flex-shrink-0">
                #{order.id}
              </span>
              <div className="flex-1 min-w-0">
                {isDirect ? (
                  <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                    <ShoppingBag className="w-3 h-3" />
                    Llevar
                  </div>
                ) : (
                  <p className="text-xs font-medium text-stone-600 dark:text-slate-300">
                    Mesa {order.table_number ?? order.table_id}
                  </p>
                )}
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${style.cls}`}>
                {style.label}
              </span>
              <span className="text-sm font-bold text-stone-900 dark:text-white flex-shrink-0 w-20 text-right">
                {order.total != null ? `$${order.total.toLocaleString("es-CL")}` : "—"}
              </span>
              <span className="text-[11px] text-stone-400 dark:text-slate-500 flex-shrink-0 w-11 text-right">
                {time}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OrderCard({
  order, productMap, onClick,
}: {
  order: Order;
  productMap: Record<number, string>;
  onClick: () => void;
}) {
  const time = new Date(order.created_at).toLocaleTimeString("es-CL", {
    hour: "2-digit", minute: "2-digit",
  });

  const isDirect = order.table_id == null;

  return (
    <button
      onClick={onClick}
      className={`text-left rounded-2xl border transition-all p-4 flex flex-col gap-3 active:scale-[0.98] ${
        isDirect
          ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-400/60 hover:bg-amber-500/10"
          : "border-sky-500/30 bg-sky-500/5 hover:border-sky-400/60 hover:bg-sky-500/10"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-stone-400 dark:text-slate-600">Pedido</p>
          <p className="text-2xl font-black text-stone-900 dark:text-white leading-none">#{order.id}</p>
        </div>
        {isDirect ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <ShoppingBag className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">Llevar</span>
          </div>
        ) : (
          <div className="text-right">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-stone-400 dark:text-slate-600">Mesa</p>
            <p className="text-2xl font-black text-stone-900 dark:text-white leading-none">
              {order.table_number ?? order.table_id}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-1">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="font-bold text-sky-500 dark:text-sky-400">×{item.quantity}</span>
            <span className="text-stone-700 dark:text-slate-300 truncate">
              {item.product_name ?? productMap[item.product_id] ?? `Producto #${item.product_id}`}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-white/5">
        {order.total != null ? (
          <span className="font-black text-stone-900 dark:text-white">${order.total.toLocaleString("es-CL")}</span>
        ) : (
          <span className="text-stone-400 dark:text-slate-600 text-sm">—</span>
        )}
        <span className="text-xs text-stone-400 dark:text-slate-500">{time}</span>
      </div>
    </button>
  );
}

const TIP_OPTIONS = [
  { label: "Sin propina", value: 0 },
  { label: "10%", value: 10 },
  { label: "15%", value: 15 },
  { label: "20%", value: 20 },
];

function CheckoutModal({
  branchId, order, onClose, siblingCount, onPayTable,
}: {
  branchId: number;
  order: Order;
  onClose: () => void;
  siblingCount: number;
  onPayTable: () => void;
}) {
  const [tipPercent, setTipPercent] = useState(10);
  const [receiptData, setReceiptData] = useState<{
    invoice: Invoice | null;
    tipAmount: number;
    grandTotal: number;
    discountAmount: number;
    couponCode: string | null;
  } | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const { data: invoice, isLoading } = useOrderInvoice(branchId, order.id);
  const updateStatus = useUpdateOrderStatus();
  const releaseTable = useReleaseTable();
  const validateCoupon = useValidateCoupon();

  const base = invoice?.subtotal ?? order.total ?? 0;
  const discountAmount = appliedCoupon
    ? (appliedCoupon.discount_amount ??
       (appliedCoupon.discount_type === "percentage"
         ? Math.round(base * appliedCoupon.discount_value / 100)
         : appliedCoupon.discount_value))
    : 0;
  const discountedBase = base - discountAmount;
  const tipAmount = Math.round(discountedBase * tipPercent / 100);
  const grandTotal = discountedBase + tipAmount;

  const handleValidateCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponError(null);
    validateCoupon.mutate(
      { branchId, code, orderTotal: base },
      {
        onSuccess: (data) => {
          setAppliedCoupon(data);
          setCouponInput("");
        },
        onError: (err) => {
          const e = err as { response?: { data?: { detail?: string } } };
          setCouponError(e.response?.data?.detail ?? "Cupón inválido");
        },
      }
    );
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponInput("");
  };

  const handlePay = () => {
    updateStatus.mutate(
      {
        branchId,
        orderId: order.id,
        status: "paid",
        tip: tipAmount || undefined,
        coupon_code: appliedCoupon?.code,
      },
      {
        onSuccess: () => {
          if (order.table_id !== null && siblingCount === 0) {
            releaseTable.mutate({ branchId, tableId: order.table_id });
          }
          setReceiptData({
            invoice: invoice ?? null,
            tipAmount,
            grandTotal,
            discountAmount,
            couponCode: appliedCoupon?.code ?? null,
          });
        },
      }
    );
  };

  if (receiptData) {
    return (
      <ReceiptModal
        order={order}
        invoice={receiptData.invoice}
        tipAmount={receiptData.tipAmount}
        grandTotal={receiptData.grandTotal}
        discountAmount={receiptData.discountAmount}
        couponCode={receiptData.couponCode}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-3xl shadow-2xl p-6 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-shrink-0">
          <div>
            <p className="text-[10px] text-stone-400 dark:text-slate-500 uppercase tracking-widest">Cobro</p>
            <h2 className="text-xl font-bold text-stone-900 dark:text-white">Pedido #{order.id}</h2>
            {order.table_id != null ? (
              <p className="text-sm text-stone-500 dark:text-slate-400">Mesa {order.table_number ?? order.table_id}</p>
            ) : (
              <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5" />
                Venta directa / Llevar
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-stone-400 dark:text-slate-500 hover:text-stone-700 dark:hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items — scrollable */}
        <div className="overflow-y-auto flex-1 min-h-0 pr-0.5">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            </div>
          ) : invoice ? (
            <InvoiceItems invoice={invoice} />
          ) : (
            <FallbackItems order={order} />
          )}
        </div>

        {/* Coupon */}
        <div className="mt-4 flex-shrink-0">
          {appliedCoupon ? (
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-widest">
                  {appliedCoupon.code}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400">
                  −${discountAmount.toLocaleString("es-CL")}
                </span>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(null); }}
                  onKeyDown={(e) => e.key === "Enter" && handleValidateCoupon()}
                  placeholder="Código de cupón"
                  className="flex-1 bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-stone-800 dark:text-slate-200 placeholder-stone-400 dark:placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono tracking-widest uppercase"
                />
                <button
                  onClick={handleValidateCoupon}
                  disabled={!couponInput.trim() || validateCoupon.isPending}
                  className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-600 dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {validateCoupon.isPending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Tag className="w-4 h-4" />
                  }
                </button>
              </div>
              {couponError && (
                <p className="text-xs text-red-500 dark:text-red-400 px-1">{couponError}</p>
              )}
            </div>
          )}
        </div>

        {/* Tip selector */}
        <div className="mt-4 space-y-2.5 flex-shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-slate-500">Propina sugerida</p>
          <div className="grid grid-cols-4 gap-2">
            {TIP_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTipPercent(opt.value)}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  tipPercent === opt.value
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    : "bg-stone-100 dark:bg-slate-800 text-stone-500 dark:text-slate-400 hover:bg-stone-200 dark:hover:bg-slate-700 hover:text-stone-700 dark:hover:text-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {tipPercent > 0 && (
            <div className="flex items-center justify-between text-sm px-1">
              <span className="text-stone-400 dark:text-slate-500">Propina ({tipPercent}%)</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                +${tipAmount.toLocaleString("es-CL")}
              </span>
            </div>
          )}
        </div>

        {/* Grand total */}
        <div className="mt-4 pt-4 border-t border-stone-200 dark:border-slate-700 flex-shrink-0 space-y-1">
          {discountAmount > 0 && (
            <div className="flex items-center justify-between text-sm px-1">
              <span className="text-stone-400 dark:text-slate-500">Descuento</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                −${discountAmount.toLocaleString("es-CL")}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-stone-700 dark:text-slate-300 font-semibold">Total a cobrar</span>
            <span className="text-3xl font-black text-stone-900 dark:text-white">${grandTotal.toLocaleString("es-CL")}</span>
          </div>
        </div>

        {/* Pay button */}
        <button
          onClick={handlePay}
          disabled={updateStatus.isPending}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
        >
          {updateStatus.isPending
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <CheckCircle2 className="w-4 h-4" />
          }
          Cobrar ${grandTotal.toLocaleString("es-CL")}
        </button>

        {siblingCount > 0 && (
          <button
            onClick={onPayTable}
            className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-violet-500/40 text-violet-600 dark:text-violet-400 text-xs font-bold hover:bg-violet-500/10 transition-all active:scale-[0.98]"
          >
            <Users className="w-3.5 h-3.5" />
            Cobrar mesa completa ({siblingCount + 1} pedidos)
          </button>
        )}
      </div>
    </div>
  );
}

type ReceiptItem = { product_name: string; quantity: number; price: number; subtotal: number };

function ReceiptModal({
  order, invoice, tipAmount, grandTotal, discountAmount, couponCode, onClose,
}: {
  order: Order;
  invoice: Invoice | null;
  tipAmount: number;
  grandTotal: number;
  discountAmount: number;
  couponCode: string | null;
  onClose: () => void;
}) {
  const items: ReceiptItem[] = invoice
    ? invoice.items.map((i) => ({
        product_name: i.product_name,
        quantity: i.quantity,
        price: i.price,
        subtotal: i.subtotal,
      }))
    : order.items.map((i) => ({
        product_name: i.product_name ?? `Producto #${i.product_id}`,
        quantity: i.quantity,
        price: i.unit_price,
        subtotal: i.unit_price * i.quantity,
      }));

  const base = invoice?.subtotal ?? order.total ?? 0;
  const dateStr = new Date(order.created_at).toLocaleString("es-CL", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:p-0">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm print:hidden" />

      <div className="relative w-full max-w-xs bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden print:rounded-none print:shadow-none print:max-w-none">

        {/* Toolbar — hidden on print */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir
          </button>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt body */}
        <div className="px-6 py-4 font-mono text-[12px] leading-relaxed">
          <div className="text-center mb-3">
            <p className="font-black text-sm tracking-widest uppercase">Boleta Electrónica</p>
            <p className="text-slate-500 text-[11px] mt-0.5">{dateStr}</p>
          </div>

          <div className="border-t border-dashed border-slate-300" />

          <div className="flex justify-between text-[11px] text-slate-500 mt-2 mb-0.5">
            <span>Pedido</span>
            <span className="font-bold text-slate-800">#{order.id}</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 mb-2">
            <span>Mesa</span>
            <span className="font-bold text-slate-800">{order.table_number ?? order.table_id}</span>
          </div>

          <div className="border-t border-dashed border-slate-300 mb-3" />

          {/* Items */}
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between">
                  <span className="flex-1 pr-2">{item.product_name}</span>
                  <span className="font-bold">${item.subtotal.toLocaleString("es-CL")}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {item.quantity} × ${item.price.toLocaleString("es-CL")}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-slate-300 mt-3 mb-2" />

          {/* Totals */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>${base.toLocaleString("es-CL")}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Descuento{couponCode ? ` (${couponCode})` : ""}</span>
                <span>−${discountAmount.toLocaleString("es-CL")}</span>
              </div>
            )}
            {tipAmount > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Propina</span>
                <span>${tipAmount.toLocaleString("es-CL")}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-[14px] pt-1">
              <span>TOTAL</span>
              <span>${grandTotal.toLocaleString("es-CL")}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-300 mt-3 mb-3" />

          <p className="text-center text-slate-400 text-[10px]">¡Gracias por su visita!</p>
        </div>
      </div>
    </div>
  );
}

function InvoiceItems({ invoice }: { invoice: Invoice }) {
  return (
    <div className="space-y-2">
      {invoice.items.map((item, i) => (
        <div key={i} className="bg-stone-100 dark:bg-slate-800/50 rounded-xl px-4 py-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-medium text-stone-800 dark:text-slate-200 text-sm leading-tight">{item.product_name}</p>
            <p className="text-xs text-stone-400 dark:text-slate-500 mt-0.5">
              ×{item.quantity} · ${item.price.toLocaleString("es-CL")} c/u
            </p>
          </div>
          <p className="font-bold text-stone-900 dark:text-white text-sm flex-shrink-0">
            ${item.subtotal.toLocaleString("es-CL")}
          </p>
        </div>
      ))}
      <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-slate-700/60 px-1">
        <span className="text-stone-500 dark:text-slate-400 text-sm">Subtotal</span>
        <span className="font-black text-stone-900 dark:text-white text-lg">${invoice.subtotal.toLocaleString("es-CL")}</span>
      </div>
    </div>
  );
}

function FallbackItems({ order }: { order: Order }) {
  return (
    <div className="space-y-2">
      {order.items.map((item, i) => (
        <div key={i} className="bg-stone-100 dark:bg-slate-800/50 rounded-xl px-4 py-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-medium text-stone-800 dark:text-slate-200 text-sm">{item.product_name}</p>
            {item.notes && <p className="text-xs text-stone-400 dark:text-slate-500 mt-0.5">{item.notes}</p>}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-stone-900 dark:text-white">×{item.quantity}</p>
            {item.unit_price > 0 && (
              <p className="text-xs text-stone-400 dark:text-slate-400">
                ${(item.unit_price * item.quantity).toLocaleString("es-CL")}
              </p>
            )}
          </div>
        </div>
      ))}
      {order.total != null && order.total > 0 && (
        <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-slate-700/60 px-1">
          <span className="text-stone-500 dark:text-slate-400 text-sm">Subtotal</span>
          <span className="font-black text-stone-900 dark:text-white text-lg">${order.total.toLocaleString("es-CL")}</span>
        </div>
      )}
    </div>
  );
}

function ShiftOrderDetailModal({
  branchId, order, onClose, onCheckout,
}: {
  branchId: number;
  order: Order;
  onClose: () => void;
  onCheckout: (order: Order) => void;
}) {
  const { data: invoice, isLoading } = useOrderInvoice(branchId, order.id);
  const style = ORDER_STATUS_STYLE[order.status] ?? ORDER_STATUS_STYLE.pending;
  const isPayable = order.status === "served" || order.status === "delivered";
  const isDirect = order.table_id == null;

  const dateStr = new Date(order.created_at).toLocaleString("es-CL", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-3xl shadow-2xl p-6 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between mb-5 flex-shrink-0">
          <div className="space-y-1">
            <p className="text-[10px] text-stone-400 dark:text-slate-500 uppercase tracking-widest">Pedido</p>
            <h2 className="text-xl font-bold text-stone-900 dark:text-white">#{order.id}</h2>
            {isDirect ? (
              <div className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400">
                <ShoppingBag className="w-3.5 h-3.5" />
                Venta directa / Llevar
              </div>
            ) : (
              <p className="text-sm text-stone-500 dark:text-slate-400">
                Mesa {order.table_number ?? order.table_id}
              </p>
            )}
            <p className="text-xs text-stone-400 dark:text-slate-500">{dateStr}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${style.cls}`}>
              {style.label}
            </span>
            <button onClick={onClose} className="text-stone-400 dark:text-slate-500 hover:text-stone-700 dark:hover:text-slate-300 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="overflow-y-auto flex-1 min-h-0 pr-0.5">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            </div>
          ) : invoice ? (
            <InvoiceItems invoice={invoice} />
          ) : (
            <FallbackItems order={order} />
          )}
        </div>

        {/* Breakdown + Total */}
        <div className="mt-4 pt-4 border-t border-stone-200 dark:border-slate-700 flex-shrink-0 space-y-1.5">
          {invoice ? (
            <>
              {invoice.discount != null && invoice.discount > 0 && (
                <div className="flex items-center justify-between text-sm px-1">
                  <span className="text-stone-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Tag className="w-3 h-3" />
                    Descuento{invoice.coupon_code ? ` (${invoice.coupon_code})` : ""}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    −${invoice.discount.toLocaleString("es-CL")}
                  </span>
                </div>
              )}
              {invoice.tip > 0 && (
                <div className="flex items-center justify-between text-sm px-1">
                  <span className="text-stone-500 dark:text-slate-400">Propina</span>
                  <span className="text-stone-700 dark:text-slate-300 font-semibold">
                    +${invoice.tip.toLocaleString("es-CL")}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1">
                <span className="text-stone-700 dark:text-slate-300 font-semibold">Total</span>
                <span className="text-3xl font-black text-stone-900 dark:text-white">
                  ${invoice.total.toLocaleString("es-CL")}
                </span>
              </div>
            </>
          ) : order.total != null ? (
            <div className="flex items-center justify-between">
              <span className="text-stone-700 dark:text-slate-300 font-semibold">Total</span>
              <span className="text-3xl font-black text-stone-900 dark:text-white">
                ${order.total.toLocaleString("es-CL")}
              </span>
            </div>
          ) : null}
        </div>

        {/* Action */}
        {isPayable && (
          <button
            onClick={() => onCheckout(order)}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            Cobrar este pedido
          </button>
        )}
      </div>
    </div>
  );
}
