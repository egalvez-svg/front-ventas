"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useBranches } from "@/hooks/useBranches";

interface AdminBranchContextValue {
  selectedBranchId: number | null;
  setSelectedBranchId: (id: number | null) => void;
  role: string | null;
  branches: { id: number; name: string }[] | undefined;
  isLoading: boolean;
}

const AdminBranchContext = createContext<AdminBranchContextValue>({
  selectedBranchId: null,
  setSelectedBranchId: () => {},
  role: null,
  branches: undefined,
  isLoading: false,
});

const STORAGE_KEY = "admin_branch_id";

export function AdminBranchProvider({ children }: { children: React.ReactNode }) {
  const { data: allBranches, isLoading } = useBranches();
  const [selectedBranchId, _setSelectedBranchId] = useState<number | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("user_role");
    setRole(storedRole);

    // Prefer the explicit admin selection; fall back to the session branch
    const saved = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem("branch_id");
    if (saved) _setSelectedBranchId(Number(saved));
  }, []);

  function setSelectedBranchId(id: number | null) {
    _setSelectedBranchId(id);
    if (id !== null) {
      localStorage.setItem(STORAGE_KEY, id.toString());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  const branches =
    role === "manager"
      ? allBranches?.filter((b) => b.id === selectedBranchId)
      : allBranches;

  return (
    <AdminBranchContext.Provider value={{ selectedBranchId, setSelectedBranchId, role, branches, isLoading }}>
      {children}
    </AdminBranchContext.Provider>
  );
}

export function useAdminBranch() {
  return useContext(AdminBranchContext);
}
