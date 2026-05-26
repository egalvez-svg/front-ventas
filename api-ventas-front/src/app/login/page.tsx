"use client";

import { useLogin, useIsAuthenticated } from "@refinedev/core";
import { useState, useEffect } from "react";
import { Store, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  const { mutate: login, isPending } = useLogin();
  const { data: authData, isLoading: authLoading } = useIsAuthenticated();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (authData?.authenticated) {
      router.push("/");
    }
  }, [authData, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-100 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login({ email, password }, {
      onError: (err) => {
        toast.error(err.message || "Credenciales inválidas");
      },
    });
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-400/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-400/10 rounded-full blur-[120px] animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-stone-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl dark:shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-amber-500/25">
              <Store className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-white">Garage Restaurant</h1>
            <p className="text-stone-500 dark:text-slate-400 text-sm mt-2">Bienvenido de nuevo, ingresa tus credenciales</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-600 dark:text-slate-300 ml-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-stone-400 dark:text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-stone-100 dark:bg-slate-800/50 border border-stone-300 dark:border-slate-700 rounded-2xl text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  placeholder="ejemplo@restaurant.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-600 dark:text-slate-300 ml-1">Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-stone-400 dark:text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-stone-100 dark:bg-slate-800/50 border border-stone-300 dark:border-slate-700 rounded-2xl text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/25"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  Entrar al Sistema
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-stone-200 dark:border-slate-800 text-center text-xs text-stone-400 dark:text-slate-500">
            &copy; 2026 Garage Restaurant. Todos los derechos reservados.
          </div>
        </div>
      </motion.div>
    </div>
  );
}
