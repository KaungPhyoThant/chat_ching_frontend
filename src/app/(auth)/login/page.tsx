"use client";

import { Card } from "antd";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <Card
      style={{
        width: 380,
        maxWidth: "100%",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      }}
    >
      <LoginForm />
    </Card>
  );
}
