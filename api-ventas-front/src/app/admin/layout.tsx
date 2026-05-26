"use client";

import { Authenticated } from "@refinedev/core";
import { Loader2 } from "lucide-react";
import { RoleGuard } from "@/components/RoleGuard";
import { ROUTE_ROLES } from "@/lib/roles";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Authenticated
      key="admin-layout"
      loading={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
      }
    >
      <RoleGuard allowedRoles={ROUTE_ROLES.admin}>{children}</RoleGuard>
    </Authenticated>
  );
}
