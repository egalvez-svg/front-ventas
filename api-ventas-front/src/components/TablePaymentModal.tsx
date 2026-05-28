"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle2, Users, AlertCircle } from "lucide-react";
import {
  useTableInvoice,
  usePayTable,
  type TableInvoice,
} from "@/hooks/useOrders";
import { useReleaseTable } from "@/hooks/useTables";

const TIP_OPTIONS = [
  { label: "Sin propina", value: 0 },
  { label: "10%", value: 10 },
  { label: "15%", value: 15 },
  { label: "20%", value: 20 },
];

interface Props {
  branchId: number;
  tableId: number;
  tableNumber?: number;
  onClose: () => void;
}

export function TablePaymentModal({ branchId, tableId, tableNumber, onClose }: Props) {
  const [tipPercent, setTipPercent] = useState(10);
  const [paidTotal, setPaidTotal] = useState<number | null>(null);

  const { data: invoice, isLoading, isError } = useTableInvoice(branchId, tableId);
  const payTable = usePayTable();
  const releaseTable = useReleaseTable();

  const base = invoice?.subtotal ?? 0;
  const tipAmount = Math.round(base * tipPercent / 100);
  const grandTotal = base + tipAmount;
  const tableLabel = tableNumber ?? tableId;

  const handlePay = () => {
    payTable.mutate(
      { branchId, tableId, tip: tipAmount || undefined },
      {
        onSuccess: () => {
          releaseTable.mutate({ branchId, tableId });
          setPaidTotal(grandTotal);
        },
      }
    );
  };

  if (paidTotal !== null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-xs bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl p-8 text-center">
          <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
          <p className="text-white font-bold text-lg">Mesa {tableLabel} cobrada</p>
          <p className="text-slate-400 text-sm mt-1">
            Total: ${paidTotal.toLocaleString("es-CL")}
          </p>
          <button
            onClick={onClose}
            className="mt-6 w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm transition-all active:scale-[0.98]"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-shrink-0">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Cobro de mesa</p>
            <h2 className="text-xl font-bold text-white">Mesa {tableLabel}</h2>
            {invoice && (
              <p className="text-sm text-slate-400">
                {invoice.orders.length} pedido{invoice.orders.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-violet-500/10 border border-violet-500/20 rounded-lg">
              <Users className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs text-violet-400 font-bold">Mesa</span>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Items — scrollable */}
        <div className="overflow-y-auto flex-1 min-h-0 pr-0.5">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            </div>
          ) : isError ? (
            <div className="flex items-center gap-2 py-6 justify-center text-slate-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              No se pudo cargar la factura de la mesa
            </div>
          ) : invoice ? (
            <TableInvoiceItems invoice={invoice} />
          ) : null}
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
          disabled={payTable.isPending || isLoading || !!isError}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-500/25 flex-shrink-0"
        >
          {payTable.isPending
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <CheckCircle2 className="w-4 h-4" />
          }
          Cobrar mesa ${grandTotal.toLocaleString("es-CL")}
        </button>
      </div>
    </div>
  );
}

function TableInvoiceItems({ invoice }: { invoice: TableInvoice }) {
  return (
    <div className="space-y-4">
      {invoice.orders.map((order, oi) => {
        const time = new Date(order.created_at).toLocaleTimeString("es-CL", {
          hour: "2-digit", minute: "2-digit",
        });
        return (
          <div key={order.order_id}>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                Pedido #{order.order_id}
              </p>
              <span className="text-[10px] text-slate-600">{time}</span>
            </div>
            <div className="space-y-1.5">
              {order.items.map((item, i) => (
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
              <div className="flex items-center justify-between py-1 px-1">
                <span className="text-slate-500 text-xs">Subtotal pedido</span>
                <span className="font-bold text-slate-300 text-sm">
                  ${order.order_total.toLocaleString("es-CL")}
                </span>
              </div>
            </div>
            {oi < invoice.orders.length - 1 && (
              <div className="border-t border-slate-700/40 mt-3" />
            )}
          </div>
        );
      })}
      <div className="flex items-center justify-between pt-2 border-t border-slate-700 px-1">
        <span className="text-slate-400 text-sm font-semibold">Total pedidos</span>
        <span className="font-black text-white text-lg">${invoice.subtotal.toLocaleString("es-CL")}</span>
      </div>
    </div>
  );
}
