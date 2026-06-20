"use client";

import { useEffect, useState } from "react";
import type { TableProps } from "antd";
import { Button, DatePicker, Select, Tag } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
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

const PAGE_SIZE = 25;

export function AuditTable() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>();
  const [actionFilter, setActionFilter] = useState<string>();
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [page, setPage] = useState(1);

  // Debounce the free-text search so we don't refetch on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isFetching, refetch } = useAuditLogs({
    search: search || undefined,
    module: moduleFilter,
    action: actionFilter,
    from: range?.[0]?.format("YYYY-MM-DD"),
    to: range?.[1]?.format("YYYY-MM-DD"),
    page,
    pageSize: PAGE_SIZE,
  });

  const columns: TableProps<AuditEntry>["columns"] = [
    {
      title: "Timestamp",
      dataIndex: "time",
      key: "time",
      render: (t: string) => {
        const d = dayjs(t);
        return t && d.isValid() ? d.format("YYYY-MM-DD HH:mm") : t || "";
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
              placeholder="Search user, module, action, resource…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          }
          filters={
            <>
              <Select
                allowClear
                placeholder="Module"
                style={{ minWidth: 160 }}
                value={moduleFilter}
                onChange={(v) => {
                  setModuleFilter(v);
                  setPage(1);
                }}
                options={(data?.modules ?? []).map((m) => ({ value: m, label: m }))}
              />
              <Select
                allowClear
                placeholder="Action"
                style={{ minWidth: 140 }}
                value={actionFilter}
                onChange={(v) => {
                  setActionFilter(v);
                  setPage(1);
                }}
                options={(data?.actions ?? []).map((a) => ({ value: a, label: a }))}
              />
              <DatePicker.RangePicker
                value={range}
                onChange={(v) => {
                  setRange(v as [Dayjs, Dayjs] | null);
                  setPage(1);
                }}
              />
            </>
          }
          actions={
            <Button
              icon={<ReloadOutlined />}
              loading={isFetching}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
          }
        />
      }
    >
      <DataTable<AuditEntry>
        rowKey="id"
        columns={columns}
        dataSource={data?.items ?? []}
        loading={isFetching}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total: data?.total ?? 0,
          hideOnSinglePage: false,
          showSizeChanger: false,
          onChange: setPage,
        }}
      />
    </ContentCard>
  );
}
