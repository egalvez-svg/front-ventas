"use client";

import { AuthProvider } from "@refinedev/core";
import { apiClient, clearAuthStorage, refreshAccessToken } from "@/lib/api-client";
import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  sub: string;
  branch_id: number | null;
  role: string;
  exp: number;
}

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", password);

      const { data } = await apiClient.post("/auth/login", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token);
        }
        if (data.shift_id != null) {
          localStorage.setItem("shift_id", data.shift_id.toString());
        }

        const decoded = jwtDecode<DecodedToken>(data.access_token);
        localStorage.setItem("user_role", decoded.role);
        if (decoded.branch_id != null) {
          localStorage.setItem("branch_id", decoded.branch_id.toString());
        }

        return { success: true, redirectTo: "/" };
      }

      // Multiple memberships — pending token, must select branch
      if (data.pending_token) {
        localStorage.setItem("pending_token", data.pending_token);
        localStorage.setItem("pending_memberships", JSON.stringify(data.memberships ?? []));
        return { success: true, redirectTo: "/select-branch" };
      }

      return { success: false, error: { name: "Login Error", message: "Error inesperado" } };
    } catch (error: any) {
      const message = error.response?.data?.detail || "Error de autenticación";
      return { success: false, error: { name: "Login Error", message } };
    }
  },

  logout: async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      try {
        await apiClient.post("/auth/logout", { refresh_token: refreshToken });
      } catch (e) {
        console.warn("Logout API call failed:", e);
      }
    }
    clearAuthStorage();
    return { success: true, redirectTo: "/login" };
  },

  check: async () => {
    if (typeof window === "undefined") return { authenticated: false };

    const token = localStorage.getItem("token");

    if (token) {
      const decoded = jwtDecode<DecodedToken>(token);
      if (decoded.exp > Date.now() / 1000) {
        return { authenticated: true };
      }
    }

    // Token ausente o expirado — intento de renovación silenciosa
    if (localStorage.getItem("refresh_token")) {
      try {
        await refreshAccessToken();
        return { authenticated: true };
      } catch {
        clearAuthStorage();
      }
    }

    return { authenticated: false, logout: true, redirectTo: "/login" };
  },

  getPermissions: async () => {
    if (typeof window === "undefined") return null;
    const role = localStorage.getItem("user_role");
    return role ? [role] : null;
  },

  getIdentity: async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const { data } = await apiClient.get("/auth/me");
      return data;
    } catch {
      return null;
    }
  },

  onError: async (error) => {
    if (error.status === 401 || error.status === 403) {
      clearAuthStorage();
      return { logout: true };
    }
    return { error };
  },
};
