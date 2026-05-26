"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Store, Building2, ShieldCheck, Loader2, ArrowRight, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient, clearAuthStorage } from "@/lib/api-client";
import { jwtDecode } from "jwt-decode";
import type { DecodedToken } from "@/providers/authProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

interface Membership {
  branch_id: number | null;
  branch_name: string | null;
  role: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  manager: "Gerente",
  cashier: "Cajero",
  waiter: "Mesero",
  kitchen: "Cocina",
};

const ROLE_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  admin: { bg: "bg-rose-500/10", border: "border-rose-500/40 hover:border-rose-500", text: "text-rose-500 dark:text-rose-400", icon: "bg-rose-500/20" },
  manager: { bg: "bg-violet-500/10", border: "border-violet-500/40 hover:border-violet-500", text: "text-violet-500 dark:text-violet-400", icon: "bg-violet-500/20" },
  cashier: { bg: "bg-cyan-500/10", border: "border-cyan-500/40 hover:border-cyan-500", text: "text-cyan-600 dark:text-cyan-400", icon: "bg-cyan-500/20" },
  waiter: { bg: "bg-emerald-500/10", border: "border-emerald-500/40 hover:border-emerald-500", text: "text-emerald-600 dark:text-emerald-400", icon: "bg-emerald-500/20" },
  kitchen: { bg: "bg-amber-500/10", border: "border-amber-500/40 hover:border-amber-500", text: "text-amber-600 dark:text-amber-400", icon: "bg-amber-500/20" },
};

export default function SelectBranchPage() {
  const router = useRouter();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("pending_token");
    const raw = localStorage.getItem("pending_memberships");
    if (!token || !raw) {
      const hasToken = localStorage.getItem("token");
      router.replace(hasToken ? "/" : "/login");
      return;
    }
    setPendingToken(token);
    setMemberships(JSON.parse(raw));
  }, [router]);

  const handleSelect = async (m: Membership, idx: number) => {
    if (!pendingToken) return;
    setLoading(idx);
    setError("");
    try {
      const { data } = await apiClient.post("/auth/select-branch", {
        pending_token: pendingToken,
        branch_id: m.branch_id,
        role: m.role,
      });

      localStorage.removeItem("pending_token");
      localStorage.removeItem("pending_memberships");

      localStorage.setItem("token", data.access_token);
      if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);
      if (data.shift_id != null) localStorage.setItem("shift_id", data.shift_id.toString());

      const decoded = jwtDecode<DecodedToken>(data.access_token);
      localStorage.setItem("user_role", decoded.role);
      if (decoded.branch_id != null) localStorage.setItem("branch_id", decoded.branch_id.toString());

      window.location.replace("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al seleccionar la sucursal");
      setLoading(null);
    }
  };

  const handleCancel = () => {
    clearAuthStorage();
    localStorage.removeItem("pending_token");
    localStorage.removeItem("pending_memberships");
    router.replace("/login");
  };

  if (!pendingToken) {
    return (
      <div className="min-h-screen bg-stone-100 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px] animate-pulse" />

      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg z-10"
      >
        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-stone-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
              <Store className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Seleccionar Sucursal</h1>
            <p className="text-stone-500 dark:text-slate-400 text-sm mt-2 text-center">
              Tu cuenta tiene acceso a múltiples sucursales. ¿Con cuál deseas ingresar?
            </p>
          </div>

          {/* Membership Cards */}
          <div className="space-y-3 mb-6">
            <AnimatePresence>
              {memberships.map((m, i) => {
                const colors = ROLE_COLORS[m.role] ?? ROLE_COLORS.waiter;
                const isLoading = loading === i;
                return (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => handleSelect(m, i)}
                    disabled={loading !== null}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border ${colors.border} ${colors.bg} transition-all group disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.icon}`}>
                      {isLoading ? (
                        <Loader2 className={`w-6 h-6 animate-spin ${colors.text}`} />
                      ) : (
                        <Building2 className={`w-6 h-6 ${colors.text}`} />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-stone-900 dark:text-white text-sm">
                        {m.branch_name || "Acceso Global"}
                      </p>
                      <div className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider mt-0.5 ${colors.text}`}>
                        <ShieldCheck className="w-3 h-3" />
                        {ROLE_LABELS[m.role] ?? m.role}
                      </div>
                    </div>
                    <ArrowRight className={`w-5 h-5 ${colors.text} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {error && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 px-4 py-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          {/* Cancel */}
          <button
            onClick={handleCancel}
            className="w-full flex items-center justify-center gap-2 py-3 border border-stone-200 dark:border-slate-800 rounded-2xl text-stone-500 dark:text-slate-500 hover:text-stone-700 dark:hover:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800/50 transition-all text-sm"
          >
            <LogOut className="w-4 h-4" />
            Volver al Login
          </button>
        </div>
      </motion.div>
    </div>
  );
}
