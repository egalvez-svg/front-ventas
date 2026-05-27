"use client";

import { usePathname } from "next/navigation";
import { useLogout } from "@refinedev/core";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Tag,
  FlaskConical,
  ShoppingBag,
  Package,
  Grid3x3,
  ClipboardList,
  Clock,
  Building2,
  Store,
  UtensilsCrossed,
  LogOut,
  ShieldCheck,
  X,
  DollarSign,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  manager: "Gerente",
  cashier: "Cajero",
  waiter: "Mesero",
  kitchen: "Cocina",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "text-rose-500 dark:text-rose-400",
  manager: "text-violet-500 dark:text-violet-400",
  cashier: "text-cyan-500 dark:text-cyan-400",
  waiter: "text-emerald-500 dark:text-emerald-400",
  kitchen: "text-amber-500 dark:text-amber-400",
};

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Principal",
    items: [
      { href: "/admin", icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard" },
    ],
  },
  {
    title: "Gestión",
    items: [
      { href: "/admin/users", icon: <Users className="w-4 h-4" />, label: "Usuarios" },
      { href: "/admin/categories", icon: <Tag className="w-4 h-4" />, label: "Categorías" },
      { href: "/admin/ingredients", icon: <FlaskConical className="w-4 h-4" />, label: "Ingredientes" },
      { href: "/admin/products", icon: <ShoppingBag className="w-4 h-4" />, label: "Productos" },
      { href: "/admin/stock", icon: <Package className="w-4 h-4" />, label: "Stock" },
      { href: "/admin/tables", icon: <Grid3x3 className="w-4 h-4" />, label: "Mesas" },
    ],
  },
  {
    title: "Operaciones",
    items: [
      { href: "/admin/orders", icon: <ClipboardList className="w-4 h-4" />, label: "Pedidos" },
      { href: "/admin/shifts", icon: <Clock className="w-4 h-4" />, label: "Turnos" },
      { href: "/admin/branches", icon: <Building2 className="w-4 h-4" />, label: "Sucursales" },
    ],
  },
  {
    title: "Accesos rápidos",
    items: [
      { href: "/pos", icon: <Store className="w-4 h-4" />, label: "Punto de Venta" },
      { href: "/kitchen", icon: <UtensilsCrossed className="w-4 h-4" />, label: "Vista Cocina" },
      { href: "/cashier", icon: <DollarSign className="w-4 h-4" />, label: "Caja" },
    ],
  },
];

export function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { mutate: logout } = useLogout();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem("user_role"));
  }, []);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-40 flex flex-col
          w-56 bg-white dark:bg-[#080c17]
          border-r border-stone-200 dark:border-slate-800/50
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-stone-200 dark:border-slate-800/50 flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-md shadow-amber-500/20 flex-shrink-0">
            <Store className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-stone-900 dark:text-white text-sm truncate">Panel Admin</span>
          <button
            onClick={onClose}
            className="ml-auto lg:hidden p-1 rounded text-stone-400 dark:text-slate-500 hover:text-stone-700 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="text-[10px] font-semibold text-stone-400 dark:text-slate-600 uppercase tracking-widest px-2 mb-2">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active
                          ? "bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          : "text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-800/50"
                        }`}
                    >
                      <span className={`flex-shrink-0 transition-colors ${active ? "text-amber-500 dark:text-amber-400" : "text-stone-400 dark:text-slate-600"}`}>
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-stone-200 dark:border-slate-800/50 p-3 flex-shrink-0 space-y-0.5">
          {role && (
            <div className="flex items-center gap-2 px-3 py-2">
              <ShieldCheck className={`w-3.5 h-3.5 flex-shrink-0 ${ROLE_COLORS[role] ?? "text-stone-400 dark:text-slate-400"}`} />
              <span className={`text-xs font-medium truncate ${ROLE_COLORS[role] ?? "text-stone-400 dark:text-slate-400"}`}>
                {ROLE_LABELS[role] ?? role}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <button
              onClick={() => logout()}
              className="flex-1 flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-500 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              Cerrar sesión
            </button>
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}
