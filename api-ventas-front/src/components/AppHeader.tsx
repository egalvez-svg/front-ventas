"use client";

import { useLogout } from "@refinedev/core";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Store, ShieldCheck, Building2, LogOut, Home, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  manager: "Gerente",
  cashier: "Cajero",
  waiter: "Mesero",
  kitchen: "Cocina",
};

const ROLE_COLORS: Record<string, string> = {
  admin:   "text-rose-500 dark:text-rose-400 border-rose-400/30 dark:border-rose-500/30 bg-rose-500/8 dark:bg-rose-500/10",
  manager: "text-violet-500 dark:text-violet-400 border-violet-400/30 dark:border-violet-500/30 bg-violet-500/8 dark:bg-violet-500/10",
  cashier: "text-cyan-500 dark:text-cyan-400 border-cyan-400/30 dark:border-cyan-500/30 bg-cyan-500/8 dark:bg-cyan-500/10",
  waiter:  "text-emerald-500 dark:text-emerald-400 border-emerald-400/30 dark:border-emerald-500/30 bg-emerald-500/8 dark:bg-emerald-500/10",
  kitchen: "text-amber-500 dark:text-amber-400 border-amber-400/30 dark:border-amber-500/30 bg-amber-500/8 dark:bg-amber-500/10",
};

export interface AppHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  back?: { label: string; href: string };
}

export function AppHeader({ icon, title, subtitle, actions, back }: AppHeaderProps) {
  const { mutate: logout } = useLogout();
  const [role, setRole] = useState<string | null>(null);
  const [branchId, setBranchId] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem("user_role"));
    setBranchId(localStorage.getItem("branch_id"));
  }, []);

  const roleColor = role
    ? (ROLE_COLORS[role] ?? "text-stone-500 dark:text-slate-400 border-stone-300 dark:border-slate-600 bg-stone-100 dark:bg-slate-800")
    : "";

  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-stone-200 dark:border-slate-800/70 bg-white/90 dark:bg-[#0a0e1a]/90 backdrop-blur-md flex-shrink-0 z-10">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <Link href="/" className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-md shadow-amber-500/20 hover:scale-105 transition-transform">
            <Store className="w-4 h-4 text-white" />
          </div>
        </Link>

        {back && (
          <>
            <Link
              href={back.href}
              className="text-stone-400 dark:text-slate-500 hover:text-stone-700 dark:hover:text-slate-300 text-sm transition-colors hidden sm:block"
            >
              {back.label}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-300 dark:text-slate-700 flex-shrink-0 hidden sm:block" />
          </>
        )}

        <div className="flex items-center gap-2 min-w-0">
          <span className="flex-shrink-0 text-stone-500 dark:text-slate-300">{icon}</span>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-stone-900 dark:text-white leading-none truncate">{title}</h1>
            {subtitle && (
              <p className="text-[10px] text-stone-400 dark:text-slate-500 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {actions}

        {role && (
          <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${roleColor}`}>
            <ShieldCheck className="w-3 h-3" />
            {ROLE_LABELS[role] ?? role}
            {branchId && (
              <>
                <span className="opacity-40">·</span>
                <Building2 className="w-3 h-3 opacity-70" />
                <span className="opacity-70">Suc. #{branchId}</span>
              </>
            )}
          </div>
        )}

        <ThemeToggle />

        <Link
          href="/"
          className="p-2 rounded-lg text-stone-400 dark:text-slate-600 hover:text-stone-600 dark:hover:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800/70 transition-colors"
          title="Inicio"
        >
          <Home className="w-4 h-4" />
        </Link>

        <button
          onClick={() => logout()}
          className="p-2 rounded-lg text-stone-400 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
