"use client";

import { Authenticated, useLogout } from "@refinedev/core";
import Link from "next/link";
import { LayoutDashboard, Users, Tag, FlaskConical, ShoppingBag, Package, Grid3x3, ClipboardList, Clock, Loader2, Home, Store, UtensilsCrossed, LogOut, Building2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

export default function AdminDashboard() {
  return (
    <Authenticated
      key="admin-page"
      loading={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
      }
    >
      <AdminContent />
    </Authenticated>
  );
}

function AdminContent() {
  return (
    <div className="p-8 bg-slate-950 min-h-screen text-slate-100">
      <AppHeader
        icon={<LayoutDashboard className="w-5 h-5 text-emerald-400" />}
        title="Panel de Administración"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-slate-400 text-sm font-medium mb-1">Ventas Hoy</h3>
          <p className="text-2xl font-bold">$1.240.000</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-slate-400 text-sm font-medium mb-1">Pedidos Activos</h3>
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-slate-400 text-sm font-medium mb-1">Stock Crítico</h3>
          <p className="text-2xl font-bold text-rose-400">5 ítems</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-slate-400 text-sm font-medium mb-1">Sucursales</h3>
          <p className="text-2xl font-bold">3</p>
        </div>
      </div>

      {/* Navigation */}
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">
        Gestión
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NavCard
          href="/admin/users"
          icon={<Users className="w-5 h-5 text-emerald-400" />}
          iconBg="bg-emerald-500/10 group-hover:bg-emerald-500/20"
          title="Usuarios"
          description="Crear y gestionar cuentas del sistema"
          borderHover="hover:border-emerald-500/50"
        />
        <NavCard
          href="/admin/categories"
          icon={<Tag className="w-5 h-5 text-violet-400" />}
          iconBg="bg-violet-500/10 group-hover:bg-violet-500/20"
          title="Categorías"
          description="Organizar productos del menú por tipo"
          borderHover="hover:border-violet-500/50"
        />
        <NavCard
          href="/admin/ingredients"
          icon={<FlaskConical className="w-5 h-5 text-amber-400" />}
          iconBg="bg-amber-500/10 group-hover:bg-amber-500/20"
          title="Ingredientes"
          description="Stock base y costos por unidad"
          borderHover="hover:border-amber-500/50"
        />
        <NavCard
          href="/admin/products"
          icon={<ShoppingBag className="w-5 h-5 text-cyan-400" />}
          iconBg="bg-cyan-500/10 group-hover:bg-cyan-500/20"
          title="Productos"
          description="Menú, precios y recetas por producto"
          borderHover="hover:border-cyan-500/50"
        />
        <NavCard
          href="/admin/stock"
          icon={<Package className="w-5 h-5 text-orange-400" />}
          iconBg="bg-orange-500/10 group-hover:bg-orange-500/20"
          title="Stock"
          description="Inventario y alertas de stock crítico"
          borderHover="hover:border-orange-500/50"
        />
        <NavCard
          href="/admin/tables"
          icon={<Grid3x3 className="w-5 h-5 text-indigo-400" />}
          iconBg="bg-indigo-500/10 group-hover:bg-indigo-500/20"
          title="Mesas"
          description="Configurar mesas y estados por sucursal"
          borderHover="hover:border-indigo-500/50"
        />
        <NavCard
          href="/admin/orders"
          icon={<ClipboardList className="w-5 h-5 text-amber-400" />}
          iconBg="bg-amber-500/10 group-hover:bg-amber-500/20"
          title="Pedidos"
          description="Ver y gestionar pedidos por estado"
          borderHover="hover:border-amber-500/50"
        />
        <NavCard
          href="/admin/shifts"
          icon={<Clock className="w-5 h-5 text-teal-400" />}
          iconBg="bg-teal-500/10 group-hover:bg-teal-500/20"
          title="Turnos"
          description="Abrir y cerrar turnos de trabajo por sucursal"
          borderHover="hover:border-teal-500/50"
        />
        <NavCard
          href="/admin/branches"
          icon={<Building2 className="w-5 h-5 text-sky-400" />}
          iconBg="bg-sky-500/10 group-hover:bg-sky-500/20"
          title="Sucursales"
          description="Crear y gestionar sucursales del negocio"
          borderHover="hover:border-sky-500/50"
        />
      </div>

      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mt-12 mb-4">
        Accesos Directos
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NavCard
          href="/pos"
          icon={<Store className="w-5 h-5 text-cyan-400" />}
          iconBg="bg-cyan-500/10 group-hover:bg-cyan-500/20"
          title="Punto de Venta (POS)"
          description="Ir a la interfaz de toma de pedidos"
          borderHover="hover:border-cyan-500/50"
        />
        <NavCard
          href="/kitchen"
          icon={<UtensilsCrossed className="w-5 h-5 text-amber-400" />}
          iconBg="bg-amber-500/10 group-hover:bg-amber-500/20"
          title="Vista de Cocina"
          description="Ir a la gestión de comandas en tiempo real"
          borderHover="hover:border-amber-500/50"
        />
      </div>
    </div>
  );
}

function NavCard({
  href,
  icon,
  iconBg,
  title,
  description,
  borderHover,
}: {
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  borderHover: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-start gap-4 p-5 bg-slate-900 border border-slate-800 rounded-2xl ${borderHover} hover:bg-slate-800/50 transition-all`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="font-semibold text-slate-200 group-hover:text-white transition-colors">
          {title}
        </p>
        <p className="text-sm text-slate-500 mt-0.5">{description}</p>
      </div>
    </Link>
  );
}
