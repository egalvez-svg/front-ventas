"use client";

import { useState, useEffect } from "react";
import { useBranches } from "./useBranches";

export function useAdminBranchSelect() {
  const { data: allBranches, isLoading } = useBranches();
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

  const role = typeof window !== "undefined" ? localStorage.getItem("user_role") : null;
  const isManager = role === "manager";
  const storedBranchId =
    typeof window !== "undefined" ? Number(localStorage.getItem("branch_id")) || null : null;

  const branches =
    isManager && storedBranchId
      ? allBranches?.filter((b) => b.id === storedBranchId)
      : allBranches;

  useEffect(() => {
    if (!branches?.length || selectedBranchId !== null) return;
    setSelectedBranchId(isManager && storedBranchId ? storedBranchId : branches[0].id);
  }, [branches]);

  return { branches, selectedBranchId, setSelectedBranchId, isLoading, isManager };
}
