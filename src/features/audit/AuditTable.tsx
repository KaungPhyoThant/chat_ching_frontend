"use client";

import { useMemo, useState } from "react";
import type { TableProps } from "antd";
import { Tag } from "antd";
import { DataTable } from "@/components/common/DataTable";
import { ContentCard } from "@/components/ui/ContentCard";
import { PageToolbar } from "@/components/ui/PageToolbar";
import { SearchInput } from "@/components/ui/SearchInput";
import { useAuditLogs } from "./hooks/useAuditLogs";
import type { AuditEntry } from "./api/audit-api";

const ACTION_COLOR: Record<string, string> = {
  READ: "blue",
  CREATE: "green",
  UPDATE: "gold",
  DELETE: "red",
  LOGIN: "purple",
  OVERRIDE: "volcano",
};

export function AuditTable() {
  const { data: auditLogs = [], isLoading } = useAuditLogs();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return auditLogs.filter(
      (e) =>
        !q ||
        e.user.toLowerCase().includes(q) ||
        e.module.toLowerCase().includes(q) ||
        e.resource.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q),
    );
  }, [auditLogs, search]);

  const columns: TableProps<AuditEntry>["columns"] = [
    {
      title: "Timestamp",
      dataIndex: "time",
      key: "time",
      render: (t: string) => {
        if (!t) return "";
        const d = new Date(t);
        return isNaN(d.getTime())
          ? t
          : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
              d.getDate(),
            ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
              d.getMinutes(),
            ).padStart(2, "0")}`;
      },
    },
    { title: "User", dataIndex: "user", key: "user" },
    {
      title: "Action",
      key: "action",
      render: (_, r) => <Tag color={ACTION_COLOR[r.action] ?? "default"}>{r.action}</Tag>,
    },
    { title: "Module", dataIndex: "module", key: "module" },
    { title: "Resource", dataIndex: "resource", key: "resource" },
    { title: "IP", dataIndex: "ip", key: "ip" },
  ];

  return (
    <ContentCard
      toolbar={
        <PageToolbar
          search={
            <SearchInput
              wide
              placeholder="Search user, module, action…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          }
        />
      }
    >
      <DataTable<AuditEntry>
        rowKey="id"
        columns={columns}
        dataSource={filtered}
        loading={isLoading}
      />
    </ContentCard>
  );
}
