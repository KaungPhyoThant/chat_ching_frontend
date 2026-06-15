"use client";

import { useMemo, useState } from "react";
import type { TableProps } from "antd";
import { App, Button, Popconfirm, Space, Tag } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { DataTable } from "@/components/common/DataTable";
import { ContentCard } from "@/components/ui/ContentCard";
import { PageToolbar } from "@/components/ui/PageToolbar";
import { SearchInput } from "@/components/ui/SearchInput";
import { useStaff, useDeleteUser } from "../hooks/useStaff";
import type { StaffStatus, StaffUser } from "../types";
import { AddUserModal } from "./AddUserModal";

const STATUS_COLOR: Record<StaffStatus, string> = {
  ACTIVE: "green",
  INACTIVE: "default",
  SUSPENDED: "red",
  PENDING: "gold",
};

interface UsersTableProps {
  readonly modalOpen: boolean;
  readonly onCloseModal: () => void;
}

export function UsersTable({ modalOpen, onCloseModal }: Readonly<UsersTableProps>) {
  const { data, isLoading } = useStaff();
  const deleteUserMutation = useDeleteUser();
  const { message } = App.useApp();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<StaffUser | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? [])
      .filter(
        (u) =>
          !q ||
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.employeeId.toLowerCase().includes(q) ||
          u.department?.toLowerCase().includes(q),
      );
  }, [data, search]);

  const columns: TableProps<StaffUser>["columns"] = [
    { title: "Name", dataIndex: "fullName", key: "fullName" },
    { title: "Employee ID", dataIndex: "employeeId", key: "employeeId" },
    { title: "Role", key: "role", render: (_, r) => <Tag>{r.role}</Tag> },
    { title: "Department", dataIndex: "department", key: "department" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Status",
      key: "status",
      render: (_, r) => <Tag color={STATUS_COLOR[r.status]}>{r.status}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => setEditing(r)} />
          <Popconfirm
            title="Deactivate this user?"
            onConfirm={async () => {
              try {
                await deleteUserMutation.mutateAsync(r.id);
                message.success("User deactivated successfully.");
              } catch (err: unknown) {
                const apiErr = err as { message?: string };
                message.error(apiErr.message || "Failed to deactivate user");
              }
            }}
            okText="Deactivate"
            okButtonProps={{ danger: true, loading: deleteUserMutation.isPending }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ContentCard
        toolbar={
          <PageToolbar
            search={
              <SearchInput
                wide
                placeholder="Search by name, email, or ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            }
          />
        }
      >
        <DataTable<StaffUser>
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          loading={isLoading}
        />
      </ContentCard>
      <AddUserModal open={modalOpen} onClose={onCloseModal} />
      <AddUserModal open={!!editing} user={editing} onClose={() => setEditing(null)} />
    </>
  );
}
