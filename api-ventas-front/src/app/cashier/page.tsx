"use client";

import { Authenticated } from "@refinedev/core";
import { useState, useMemo } from "react";
import {
  Receipt, Loader2, RefreshCw, X, Store, DollarSign,
  CheckCircle2, Printer, Users, ShoppingBag,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import {
  useOrders,
  useUpdateOrderStatus,
  useOrderInvoice,
  type Order,
  type Invoice,
} from "@/hooks/useOrders";
import { TablePaymentModal } from "@/components/TablePaymentModal";
import { useProducts } from "@/hooks/useProducts";
import { RoleGuard } from "@/components/RoleGuard";
import { ROUTE_ROLES } from "@/lib/roles";

export default function CashierPage() {
  return (
    <Authenticated
      key="cashier-page"
      loading={
        <div className="min-h-screen bg-[#080c18] flex items-center justify-center">
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
  const [selected, setSelected] = useState<Order | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);

  const { data: servedOrders, isLoading, isFetching, isError } = useOrders(branchId, "served", 4_000);
  const { data: deliveredOrders } = useOrders(branchId, "delivered", 4_000);
  const orders = useMemo(
    () => [...(servedOrders ?? []), ...(deliveredOrders ?? [])],
    [servedOrders, deliveredOrders]
  );
  const { data: products } = useProducts({ active_only: true });
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
    <div className="h-screen bg-[#080c18] text-slate-50 flex flex-col">
      <AppHeader
        icon={<Receipt className="w-5 h-5 text-emerald-400" />}
        title="Caja"
        subtitle={branchId ? `Sucursal #${branchId}` : "Sin sucursal"}
        actions={
          <div className="flex items-center gap-2">
            {count > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-400 font-bold">
                <DollarSign className="w-3.5 h-3.5" />
                {count} listo{count !== 1 ? "s" : ""} para cobrar
              </div>
            )}
            {isFetching && <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-500" />}
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto p-5">
        {branchId === null ? (
          <div className="flex items-center justify-center h-full">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-sm text-center">
              <Store className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Tu cuenta no tiene una sucursal asignada.</p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p>Error al cargar los pedidos</p>
          </div>
        ) : !orders?.length ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-700">
            <div className="w-24 h-24 rounded-full bg-slate-900/60 flex items-center justify-center">
              <Receipt className="w-12 h-12 opacity-40" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-500">Sin pedidos para cobrar</p>
              <p className="text-sm text-slate-600 mt-1">Los pedidos servidos aparecerán aquí</p>
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
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-600">Pedido</p>
          <p className="text-2xl font-black text-white leading-none">#{order.id}</p>
        </div>
        {isDirect ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-amber-400 font-bold">Llevar</span>
          </div>
        ) : (
          <div className="text-right">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-600">Mesa</p>
            <p className="text-2xl font-black text-white leading-none">
              {order.table_number ?? order.table_id}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-1">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="font-bold text-sky-400">×{item.quantity}</span>
            <span className="text-slate-300 truncate">
              {item.product_name ?? productMap[item.product_id] ?? `Producto #${item.product_id}`}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        {order.total != null ? (
          <span className="font-black text-white">${order.total.toLocaleString("es-CL")}</span>
        ) : (
          <span className="text-slate-600 text-sm">—</span>
        )}
        <span className="text-xs text-slate-500">{time}</span>
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
  const [receiptData, setReceiptData] = useState<{ invoice: Invoice | null; tipAmount: number; grandTotal: number } | null>(null);

  const { data: invoice, isLoading } = useOrderInvoice(branchId, order.id);
  const updateStatus = useUpdateOrderStatus();

  const base = invoice?.subtotal ?? order.total ?? 0;
  const tipAmount = Math.round(base * tipPercent / 100);
  const grandTotal = base + tipAmount;

  const handlePay = () => {
    updateStatus.mutate(
      { branchId, orderId: order.id, status: "paid", tip: tipAmount || undefined },
      {
        onSuccess: () =>
          setReceiptData({ invoice: invoice ?? null, tipAmount, grandTotal }),
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
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-shrink-0">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Cobro</p>
            <h2 className="text-xl font-bold text-white">Pedido #{order.id}</h2>
            {order.table_id != null ? (
              <p className="text-sm text-slate-400">Mesa {order.table_number ?? order.table_id}</p>
            ) : (
              <p className="text-sm text-amber-400 flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5" />
                Venta directa / Llevar
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
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

        {/* Tip selector */}
        <div className="mt-5 space-y-2.5 flex-shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Propina sugerida</p>
          <div className="grid grid-cols-4 gap-2">
            {TIP_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTipPercent(opt.value)}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  tipPercent === opt.value
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {tipPercent > 0 && (
            <div className="flex items-center justify-between text-sm px-1">
              <span className="text-slate-500">Propina ({tipPercent}%)</span>
              <span className="text-emerald-400 font-semibold">
                +${tipAmount.toLocaleString("es-CL")}
              </span>
            </div>
          )}
        </div>

        {/* Grand total */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-700 flex-shrink-0">
          <span className="text-slate-300 font-semibold">Total a cobrar</span>
          <span className="text-3xl font-black text-white">${grandTotal.toLocaleString("es-CL")}</span>
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
            className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-violet-500/40 text-violet-400 text-xs font-bold hover:bg-violet-500/10 transition-all active:scale-[0.98]"
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
  order, invoice, tipAmount, grandTotal, onClose,
}: {
  order: Order;
  invoice: Invoice | null;
  tipAmount: number;
  grandTotal: number;
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
        <div key={i} className="bg-slate-800/50 rounded-xl px-4 py-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-medium text-slate-200 text-sm leading-tight">{item.product_name}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              ×{item.quantity} · ${item.price.toLocaleString("es-CL")} c/u
            </p>
          </div>
          <p className="font-bold text-white text-sm flex-shrink-0">
            ${item.subtotal.toLocaleString("es-CL")}
          </p>
        </div>
      ))}
      <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 px-1">
        <span className="text-slate-400 text-sm">Subtotal</span>
        <span className="font-black text-white text-lg">${invoice.subtotal.toLocaleString("es-CL")}</span>
      </div>
    </div>
  );
}

function FallbackItems({ order }: { order: Order }) {
  return (
    <div className="space-y-2">
      {order.items.map((item, i) => (
        <div key={i} className="bg-slate-800/50 rounded-xl px-4 py-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-medium text-slate-200 text-sm">{item.product_name}</p>
            {item.notes && <p className="text-xs text-slate-500 mt-0.5">{item.notes}</p>}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-white">×{item.quantity}</p>
            {item.unit_price > 0 && (
              <p className="text-xs text-slate-400">
                ${(item.unit_price * item.quantity).toLocaleString("es-CL")}
              </p>
            )}
          </div>
        </div>
      ))}
      {order.total != null && order.total > 0 && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 px-1">
          <span className="text-slate-400 text-sm">Subtotal</span>
          <span className="font-black text-white text-lg">${order.total.toLocaleString("es-CL")}</span>
        </div>
      )}
    </div>
  );
}
