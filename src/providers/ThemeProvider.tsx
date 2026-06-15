"use client";

import { useEffect } from "react";
import { App, ConfigProvider } from "antd";
import { useUIStore } from "@/store/ui-store";
import { getThemeConfig } from "@/theme/tokens";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useUIStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", mode);
    root.style.colorScheme = mode;
  }, [mode]);

  return (
    <ConfigProvider theme={getThemeConfig(mode)} componentSize="middle">
      <App>{children}</App>
    </ConfigProvider>
  );
}
