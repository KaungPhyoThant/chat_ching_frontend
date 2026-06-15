"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { AuditTable } from "@/features/audit/AuditTable";

export default function AuditLogsPage() {
  return (
    <>
      <PageHeader title="Audit logs" subtitle="Append-only · PHI access & sensitive actions" />
      <AuditTable />
    </>
  );
}
