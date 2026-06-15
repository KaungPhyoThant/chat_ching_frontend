"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { RbacMatrix } from "@/features/rbac/components/RbacMatrix";
import { Can } from "@/lib/rbac/Can";

export default function RbacPage() {
  return (
    <>
      <PageHeader
        title="Roles & permissions"
        subtitle="Manage RBAC assignments (admin)"
      />
      <Can permission="settings:update">
        <RbacMatrix />
      </Can>
    </>
  );
}
