"use client";

import { useLogout } from "@refinedev/core";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Store,
  ShieldCheck,
  Building2,
  LogOut,
  Home,
  ChevronRight,
} from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  manager: "Gerente",
  cashier: "Cajero",
  waiter: "Mesero",
  kitchen: "Cocina",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "text-rose-400 border-rose-500/30 bg-rose-500/10",
  manager: "text-violet-400 border-violet-500/30 bg-violet-500/10",
  cashier: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
  waiter: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  kitchen: "text-amber-400 border-amber-500/30 bg-amber-500/10",
};

export interface AppHeaderProps {
  /** Icon shown next to the page title */
  icon: React.ReactNode;
  /** Main page title */
  title: string;
  /** Optional subtitle shown below title */
  subtitle?: string;
  /** Extra elements on the right side (e.g., refresh button, filter count) */
  actions?: React.ReactNode;
  /** Back link config: if provided, shows breadcrumb */
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

  const roleColor = role ? (ROLE_COLORS[role] ?? "text-slate-400 border-slate-600 bg-slate-800") : "";

  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-slate-800/70 bg-[#0a0e1a]/90 backdrop-blur-md flex-shrink-0 z-10">
      {/* Left: Logo + breadcrumb + title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* App logo */}
        <Link href="/" className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-md shadow-emerald-500/20 hover:scale-105 transition-transform">
            <Store className="w-4 h-4 text-slate-950" />
          </div>
        </Link>

        {/* Breadcrumb */}
        {back && (
          <>
            <Link
              href={back.href}
              className="text-slate-500 hover:text-slate-300 text-sm transition-colors hidden sm:block"
            >
              {back.label}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-700 flex-shrink-0 hidden sm:block" />
          </>
        )}

        {/* Page identity */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex-shrink-0 text-slate-300">{icon}</span>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white leading-none truncate">{title}</h1>
            {subtitle && (
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* Right: actions + session info */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Custom page actions */}
        {actions}

        {/* Session badge */}
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

        {/* Home shortcut */}
        <Link
          href="/"
          className="p-2 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-800/70 transition-colors"
          title="Inicio"
        >
          <Home className="w-4 h-4" />
        </Link>

        {/* Logout */}
        <button
          onClick={() => logout()}
          className="p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
