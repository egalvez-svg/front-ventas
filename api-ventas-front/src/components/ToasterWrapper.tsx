"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/providers/ThemeProvider";

export function ToasterWrapper() {
  const { theme } = useTheme();
  return <Toaster theme={theme} richColors position="top-right" />;
}
