"use client";

import { Authenticated } from "@refinedev/core";
import { useState } from "react";
import {
  Users,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  User as UserIcon,
  Pencil,
  Trash2,
  Building2,
} from "lucide-react";

import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  type CreateUserPayload,
  type UpdateUserPayload,
  type MembershipPayload,
  type User,
} from "@/hooks/useUsers";
import { useBranches } from "@/hooks/useBranches";

const ROLES = [
  { value: "admin", label: "Administrador" },
  { value: "manager", label: "Gerente" },
  { value: "cashier", label: "Cajero" },
  { value: "waiter", label: "Mesero" },
  { value: "kitchen", label: "Cocina" },
];

const ROLE_COLORS: Record<string, string> = {
  admin: "text-rose-500 dark:text-rose-400 bg-rose-500/10 border-rose-500/30",
  manager: "text-violet-500 dark:text-violet-400 bg-violet-500/10 border-violet-500/30",
  cashier: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  waiter: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  kitchen: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30",
};

const ROLE_LABELS: Record<string, string> = Object.fromEntries(
  ROLES.map((r) => [r.value, r.label])
);

type ModalState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; user: User }
  | { mode: "delete"; user: User };

export default function UsersPage() {
  return (
    <Authenticated
      key="users-page"
      loading={
        <div className="min-h-screen bg-stone-100 dark:bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        </div>
      }
    >
      <UsersContent />
    </Authenticated>
  );
}

function UsersContent() {
  const { data: users, isLoading, isError } = useUsers();
  const { data: branches = [] } = useBranches();

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const [form, setForm] = useState<CreateUserPayload>({
    email: "",
    full_name: "",
    password: "",
    role: "waiter",
    branch_id: null,
  });
  const [memberships, setMemberships] = useState<MembershipPayload[]>([]);
  const [formError, setFormError] = useState("");

  const isPending = createUser.isPending || updateUser.isPending || deleteUser.isPending;

  const openCreate = () => {
    setForm({ email: "", full_name: "", password: "", role: "waiter", branch_id: null });
    setMemberships([]);
    setFormError("");
    setModal({ mode: "create" });
  };

  const openEdit = (user: User) => {
    setForm({ email: user.email, full_name: user.full_name, password: "", role: "", branch_id: null });
    setMemberships(user.memberships.map((m) => ({ branch_id: m.branch_id, role: m.role })));
    setFormError("");
    setModal({ mode: "edit", user });
  };

  const openDelete = (user: User) => setModal({ mode: "delete", user });

  const close = () => {
    if (isPending) return;
    setModal({ mode: "closed" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const handleApiError = (err: any) => {
      const detail = err.response?.data?.detail;
      setFormError(
        Array.isArray(detail)
          ? detail.map((d: any) => d.msg).join(", ")
          : detail || "Error en la operación"
      );
    };

    if (modal.mode === "create") {
      createUser.mutate(form, { onSuccess: close, onError: handleApiError });
    } else if (modal.mode === "edit") {
      const payload: UpdateUserPayload = {
        email: form.email,
        full_name: form.full_name,
        memberships,
      };
      if (form.password) payload.password = form.password;
      updateUser.mutate({ id: modal.user.id, payload }, { onSuccess: close, onError: handleApiError });
    }
  };

  const handleDelete = () => {
    if (modal.mode !== "delete") return;
    deleteUser.mutate(modal.user.id, { onSuccess: close });
  };

  return (
    <div className="min-h-full text-stone-900 dark:text-slate-50">
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-slate-800/70 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <Users className="w-5 h-5 text-amber-500" />
          <h1 className="text-base font-bold text-stone-900 dark:text-white">Usuarios</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95 text-sm shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </button>
      </div>

      <div className="p-6">
        <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-stone-400 dark:text-slate-500">
              <XCircle className="w-10 h-10 text-rose-500/50" />
              <p>Error al cargar los usuarios</p>
            </div>
          ) : !users?.length ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-stone-400 dark:text-slate-500">
              <UserIcon className="w-10 h-10 opacity-30" />
              <p>No hay usuarios registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-slate-800 text-stone-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                    <th className="text-left px-6 py-4 font-medium">Nombre</th>
                    <th className="text-left px-6 py-4 font-medium">Email</th>
                    <th className="text-left px-6 py-4 font-medium">Roles / Sucursales</th>
                    <th className="text-left px-6 py-4 font-medium">Estado</th>
                    <th className="px-6 py-4 font-medium w-24" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-slate-800/50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-stone-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 text-amber-500 font-bold">
                            {user.full_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-stone-800 dark:text-slate-200">{user.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-stone-500 dark:text-slate-400">{user.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {user.memberships.map((m) => (
                            <div
                              key={m.id}
                              className={`flex flex-col gap-0.5 px-2 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-tighter ${
                                ROLE_COLORS[m.role] ?? "text-stone-400 bg-stone-100 dark:bg-slate-700/50 border-stone-200 dark:border-slate-600"
                              }`}
                            >
                              <div className="flex items-center gap-1">
                                <ShieldCheck className="w-2.5 h-2.5" />
                                {ROLE_LABELS[m.role] ?? m.role}
                              </div>
                              <div className="flex items-center gap-1 opacity-70">
                                <Building2 className="w-2.5 h-2.5" />
                                {m.branch_name || "GLOBAL"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.is_active ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-stone-400 dark:text-slate-500 text-xs font-semibold">
                            <XCircle className="w-4 h-4" />
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(user)}
                            className="p-1.5 text-stone-400 dark:text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDelete(user)}
                            disabled={!user.is_active}
                            className="p-1.5 text-stone-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {(modal.mode === "create" || modal.mode === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 dark:bg-slate-950/80 backdrop-blur-sm" onClick={close} />
          <div className={`relative w-full ${modal.mode === "edit" ? "max-w-xl" : "max-w-md"} bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                {modal.mode === "create" ? "Nuevo Usuario" : "Editar Usuario"}
              </h2>
              <button onClick={close} className="text-stone-400 dark:text-slate-500 hover:text-stone-700 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-500 dark:text-slate-400 uppercase tracking-wider">Nombre completo</label>
                <input
                  type="text"
                  required
                  placeholder="Juan Pérez"
                  value={form.full_name}
                  onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-500 dark:text-slate-400 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  required
                  placeholder="juan@restaurant.com"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-500 dark:text-slate-400 uppercase tracking-wider">
                  {modal.mode === "edit" ? "Nueva contraseña (opcional)" : "Contraseña"}
                </label>
                <input
                  type="password"
                  required={modal.mode === "create"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  className={inputClass}
                />
              </div>

              {modal.mode === "create" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-stone-500 dark:text-slate-400 uppercase tracking-wider">Rol Inicial</label>
                    <select
                      value={form.role}
                      onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                      className={inputClass}
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-stone-500 dark:text-slate-400 uppercase tracking-wider">Sucursal (opcional)</label>
                    <select
                      value={form.branch_id ?? ""}
                      onChange={(e) => setForm((p) => ({ ...p, branch_id: e.target.value === "" ? null : Number(e.target.value) }))}
                      className={inputClass}
                    >
                      <option value="">Sin asignar</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Memberships — edit mode only */}
              {modal.mode === "edit" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-stone-500 dark:text-slate-400 uppercase tracking-wider">Roles y Sucursales</label>
                    <button
                      type="button"
                      onClick={() => setMemberships((p) => [...p, { branch_id: null, role: "waiter" }])}
                      className="flex items-center gap-1 text-xs text-amber-500 hover:text-amber-400 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Añadir
                    </button>
                  </div>
                  {memberships.length === 0 && (
                    <p className="text-stone-400 dark:text-slate-600 text-xs italic py-2">Sin membresías asignadas</p>
                  )}
                  {memberships.map((m, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select
                        value={m.role}
                        onChange={(e) => setMemberships((p) => p.map((x, idx) => idx === i ? { ...x, role: e.target.value } : x))}
                        className="flex-1 px-3 py-2 bg-stone-100 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                      <select
                        value={m.branch_id ?? ""}
                        onChange={(e) => setMemberships((p) => p.map((x, idx) => idx === i ? { ...x, branch_id: e.target.value === "" ? null : Number(e.target.value) } : x))}
                        className="flex-1 px-3 py-2 bg-stone-100 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="">Global</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setMemberships((p) => p.filter((_, idx) => idx !== i))}
                        className="p-1.5 text-stone-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {formError && (
                <div className="bg-rose-500/10 border border-rose-500/40 text-rose-500 dark:text-rose-400 px-4 py-2.5 rounded-xl text-sm">
                  {formError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={close}
                  disabled={isPending}
                  className="flex-1 py-3 rounded-xl border border-stone-200 dark:border-slate-700 text-stone-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (modal.mode === "create" ? "Crear Usuario" : "Guardar Cambios")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {modal.mode === "delete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 dark:bg-slate-950/80 backdrop-blur-sm" onClick={close} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-3xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-2">¿Desactivar a {modal.user.full_name}?</h2>
            <p className="text-stone-500 dark:text-slate-400 text-sm mb-8">
              El usuario ya no podrá iniciar sesión. Esta acción no se puede deshacer fácilmente.
            </p>
            <div className="flex gap-3">
              <button onClick={close} disabled={isPending} className="flex-1 py-3 border border-stone-200 dark:border-slate-700 rounded-xl text-stone-500 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Desactivar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3 bg-stone-100 dark:bg-slate-800/60 border border-stone-300 dark:border-slate-700 rounded-xl text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm";
