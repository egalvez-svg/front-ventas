"use client";

import { useState } from "react";
import { Authenticated } from "@refinedev/core";
import { Loader2 } from "lucide-react";
import { RoleGuard } from "@/components/RoleGuard";
import { ROUTE_ROLES } from "@/lib/roles";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Authenticated
      key="admin-layout"
      loading={
        <div className="min-h-screen bg-stone-100 dark:bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        </div>
      }
    >
      <RoleGuard allowedRoles={ROUTE_ROLES.admin}>
        <div className="flex h-screen bg-stone-50 dark:bg-slate-950 overflow-hidden">
          <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <AdminTopBar onMenuClick={() => setSidebarOpen(true)} />

            <main className="flex-1 overflow-y-auto bg-stone-50 dark:bg-slate-950">
              {children}
            </main>
          </div>
        </div>
      </RoleGuard>
    </Authenticated>
  );
}
