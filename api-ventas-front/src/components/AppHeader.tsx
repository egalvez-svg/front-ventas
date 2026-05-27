"use client";

import { useGetIdentity, useLogout } from "@refinedev/core";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Store, Building2, ShieldCheck, LogOut, CircleUser } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useBranches } from "@/hooks/useBranches";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  manager: "Gerente",
  cashier: "Cajero",
  waiter: "Mesero",
  kitchen: "Cocina",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "text-rose-500 dark:text-rose-400 border-rose-400/30 dark:border-rose-500/30 bg-rose-500/8 dark:bg-rose-500/10",
  manager: "text-violet-500 dark:text-violet-400 border-violet-400/30 dark:border-violet-500/30 bg-violet-500/8 dark:bg-violet-500/10",
  cashier: "text-cyan-500 dark:text-cyan-400 border-cyan-400/30 dark:border-cyan-500/30 bg-cyan-500/8 dark:bg-cyan-500/10",
  waiter: "text-emerald-500 dark:text-emerald-400 border-emerald-400/30 dark:border-emerald-500/30 bg-emerald-500/8 dark:bg-emerald-500/10",
  kitchen: "text-amber-500 dark:text-amber-400 border-amber-400/30 dark:border-amber-500/30 bg-amber-500/8 dark:bg-amber-500/10",
};

interface UserIdentity {
  id?: number;
  email?: string;
  name?: string;
  full_name?: string;
  username?: string;
}

export interface AppHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  back?: { label: string; href: string };
}

export function AppHeader({ icon, title, subtitle, actions, back }: AppHeaderProps) {
  const { mutate: logout } = useLogout();
  const { data: identity } = useGetIdentity<UserIdentity>();
  const { data: branches } = useBranches();
  const [role, setRole] = useState<string | null>(null);
  const [branchId, setBranchId] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem("user_role"));
    setBranchId(localStorage.getItem("branch_id"));
  }, []);

  const userName = identity?.full_name || identity?.name || identity?.email || identity?.username;
  const branch = branches?.find((b) => b.id.toString() === branchId);
  const branchName = branch?.name ?? (branchId ? `Suc. #${branchId}` : null);

  const roleColor = role
    ? (ROLE_COLORS[role] ?? "text-stone-500 dark:text-slate-400 border-stone-300 dark:border-slate-600 bg-stone-100 dark:bg-slate-800")
    : "";

  return (
    <header className="flex items-center gap-3 px-4 py-3 border-b border-stone-200 dark:border-slate-800/50 bg-white/90 dark:bg-[#080c17]/90 backdrop-blur-sm flex-shrink-0 z-10">
      {/* Hamburger — mobile only */}
      <button
        onClick={() => { }}
        className="lg:hidden p-2 rounded-lg text-stone-500 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-800/60 transition-colors"
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-md flex items-center justify-center shadow shadow-amber-500/20">
          <Store className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sm font-semibold text-stone-800 dark:text-slate-200 hidden sm:block">
          Panel Admin
        </span>
      </Link>

      <div className="flex-1" />

      {/* Right section */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* User name */}
        {userName && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-slate-800/60 text-sm">
            <CircleUser className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500 flex-shrink-0" />
            <span className="font-medium text-stone-700 dark:text-slate-200 truncate max-w-36">
              {userName}
            </span>
          </div>
        )}

        {/* Branch */}
        {branchName && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-slate-800/60 text-sm text-stone-500 dark:text-slate-400">
            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate max-w-28">{branchName}</span>
          </div>
        )}

        {/* Role badge */}
        {role && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${roleColor}`}>
            <ShieldCheck className="w-3 h-3 flex-shrink-0" />
            <span className="hidden sm:block">{ROLE_LABELS[role] ?? role}</span>
          </div>
        )}

        <ThemeToggle />

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
