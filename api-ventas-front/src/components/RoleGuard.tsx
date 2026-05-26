"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldX } from "lucide-react";
import type { Role } from "@/lib/roles";

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

/**
 * Client-side role guard. Reads user_role from localStorage (set at login) and
 * redirects to /pos if the role is not in allowedRoles.
 * Must be rendered inside <Authenticated> so the token is already validated.
 */
export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "allowed" | "denied">("checking");

  useEffect(() => {
    const role = localStorage.getItem("user_role") as Role | null;
    if (role && allowedRoles.includes(role)) {
      setStatus("allowed");
    } else {
      setStatus("denied");
      router.replace("/pos");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "checking" || status === "denied") {
    return (
      <div className="min-h-screen bg-[#080c18] flex flex-col items-center justify-center gap-4">
        {status === "checking" ? (
          <Loader2 className="w-10 h-10 text-slate-500 animate-spin" />
        ) : (
          <>
            <ShieldX className="w-10 h-10 text-rose-500" />
            <p className="text-slate-400 text-sm">Sin permisos. Redirigiendo…</p>
          </>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
