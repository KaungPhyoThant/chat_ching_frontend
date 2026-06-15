"use client";

import { theme } from "antd";
import type { ReactNode } from "react";
import { GuestGuard } from "@/components/auth/GuestGuard";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { token } = theme.useToken();
  return (
    <GuestGuard>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          background: token.colorBgLayout,
        }}
      >
        {children}
      </div>
    </GuestGuard>
  );
}
