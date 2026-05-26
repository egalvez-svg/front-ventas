"use client";

import { Authenticated, useLogout } from "@refinedev/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Store, UtensilsCrossed, Receipt, Loader2, LogOut, Building2, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <Authenticated
      key="home-page"
      loading={
        <div className="min-h-screen bg-stone-100 dark:bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        </div>
      }
    >
      <HomeContent />
    </Authenticated>
  );
}

const ROLE_DIRECT: Partial<Record<string, string>> = {
  waiter: "/pos",
  kitchen: "/kitchen",
};

function HomeContent() {
  const router = useRouter();
  const { mutate: logout } = useLogout();
  const [role, setRole] = useState<string | null>(null);
  const [branchId, setBranchId] = useState<string | null>(null);

  useEffect(() => {
    const r = localStorage.getItem("user_role");
    setRole(r);
    setBranchId(localStorage.getItem("branch_id"));
    if (r && ROLE_DIRECT[r]) {
      router.replace(ROLE_DIRECT[r]!);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (role && ROLE_DIRECT[role]) {
    return (
      <div className="min-h-screen bg-stone-100 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  const isAdmin = role === "admin";
  const isManager = role === "manager";
  const canAdmin = isAdmin || isManager;
  const canKitchen = ["admin", "manager", "kitchen"].includes(role ?? "");
  const canCashier = ["admin", "manager", "cashier"].includes(role ?? "");

  const ROLE_LABELS: Record<string, string> = {
    admin: "Administrador",
    manager: "Gerente",
    cashier: "Cajero",
    waiter: "Mesero",
    kitchen: "Cocina",
  };

  return (
    <main className="min-h-screen bg-stone-100 dark:bg-slate-950 text-stone-900 dark:text-slate-50 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[120px]" />

      {/* Header bar */}
      <div className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-stone-200 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-sm shadow-amber-500/20">
            <Store className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-stone-800 dark:text-slate-200">POS Restaurant</span>
          <span className="text-stone-400 dark:text-slate-600 text-xs font-mono">v0.1.0</span>
        </div>
        <div className="flex items-center gap-2">
          {role && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-lg text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-stone-700 dark:text-slate-300">{ROLE_LABELS[role] ?? role}</span>
              {branchId && (
                <>
                  <span className="text-stone-300 dark:text-slate-700">·</span>
                  <Building2 className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500" />
                  <span className="text-stone-400 dark:text-slate-500">Suc. #{branchId}</span>
                </>
              )}
            </div>
          )}
          <ThemeToggle />
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 dark:text-rose-400 hover:bg-rose-500/20 transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="pt-20 w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold tracking-tighter bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-3">
            POS Restaurant
          </h1>
          <p className="text-stone-500 dark:text-slate-400">Selecciona el módulo al que deseas acceder</p>
        </div>

        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto w-full">

          {canAdmin && (
            <Link
              href="/admin"
              className="group relative flex flex-col gap-4 p-6 bg-white dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 rounded-2xl hover:border-amber-400/60 dark:hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-amber-500/5 transition-all shadow-sm dark:shadow-none"
            >
              <div className="w-12 h-12 bg-amber-500/10 group-hover:bg-amber-500/20 rounded-xl flex items-center justify-center transition-colors">
                <LayoutDashboard className="w-7 h-7 text-amber-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-800 dark:text-white mb-1">Administración</h2>
                <p className="text-stone-500 dark:text-slate-500 text-sm leading-relaxed">
                  Usuarios, productos, inventario, stock, mesas y sucursales.
                </p>
              </div>
              <div className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest text-amber-500/70 border border-amber-500/20 rounded px-1.5 py-0.5">
                {isAdmin ? "Admin" : "Manager"}
              </div>
            </Link>
          )}

          <Link
            href="/pos"
            className="group flex flex-col gap-4 p-6 bg-white dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 rounded-2xl hover:border-emerald-400/60 dark:hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 transition-all shadow-sm dark:shadow-none"
          >
            <div className="w-12 h-12 bg-emerald-500/10 group-hover:bg-emerald-500/20 rounded-xl flex items-center justify-center transition-colors">
              <Store className="w-7 h-7 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800 dark:text-white mb-1">Ventas (POS)</h2>
              <p className="text-stone-500 dark:text-slate-500 text-sm leading-relaxed">
                Interfaz táctil para toma de pedidos por mesa.
              </p>
            </div>
          </Link>

          {canKitchen && (
            <Link
              href="/kitchen"
              className="group flex flex-col gap-4 p-6 bg-white dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 rounded-2xl hover:border-orange-400/60 dark:hover:border-amber-500/50 hover:bg-orange-50/50 dark:hover:bg-amber-500/5 transition-all shadow-sm dark:shadow-none"
            >
              <div className="w-12 h-12 bg-orange-500/10 group-hover:bg-orange-500/20 rounded-xl flex items-center justify-center transition-colors">
                <UtensilsCrossed className="w-7 h-7 text-orange-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-800 dark:text-white mb-1">Cocina</h2>
                <p className="text-stone-500 dark:text-slate-500 text-sm leading-relaxed">
                  Gestión de comandas y pedidos en tiempo real.
                </p>
              </div>
            </Link>
          )}

          {canCashier && (
            <Link
              href="/cashier"
              className="group flex flex-col gap-4 p-6 bg-white dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 rounded-2xl hover:border-sky-400/60 dark:hover:border-sky-500/50 hover:bg-sky-50/50 dark:hover:bg-sky-500/5 transition-all shadow-sm dark:shadow-none"
            >
              <div className="w-12 h-12 bg-sky-500/10 group-hover:bg-sky-500/20 rounded-xl flex items-center justify-center transition-colors">
                <Receipt className="w-7 h-7 text-sky-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-800 dark:text-white mb-1">Caja</h2>
                <p className="text-stone-500 dark:text-slate-500 text-sm leading-relaxed">
                  Cobro de pedidos servidos y emisión de boleta.
                </p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
