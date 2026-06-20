import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { GlobalMessageListener } from "@/components/notifications/GlobalMessageListener";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <GlobalMessageListener />
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
