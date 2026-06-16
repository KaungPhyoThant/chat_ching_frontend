"use client";

import { useMemo, useState } from "react";
import type { TableProps } from "antd";
import { App, Button, Popconfirm, Select, Space, Tag } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { DataTable } from "@/components/common/DataTable";
import { ContentCard } from "@/components/ui/ContentCard";
import { PageToolbar } from "@/components/ui/PageToolbar";
import { SearchInput } from "@/components/ui/SearchInput";
import {
  useStaff,
  useDeleteUser,
  useUpdateUserStatus,
} from "../hooks/useStaff";
import type { StaffStatus, StaffUser } from "../types";
import { AddUserModal } from "./AddUserModal";

const STATUS_COLOR: Record<StaffStatus, string> = {
  ACTIVE: "green",
  INACTIVE: "default",
  SUSPENDED: "red",
  PENDING: "gold",
};
const STAFF_STATUSES: StaffStatus[] = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "PENDING",
];

interface UsersTableProps {
  readonly modalOpen: boolean;
  readonly onCloseModal: () => void;
}

export function UsersTable({ modalOpen, onCloseModal }: Readonly<UsersTableProps>) {
  const { data, isLoading } = useStaff();
  const deleteUserMutation = useDeleteUser();
  const updateStatusMutation = useUpdateUserStatus();
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
          u.phone?.toLowerCase().includes(q) ||
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
    { title: "Phone", dataIndex: "phone", key: "phone" },
    {
      title: "Status",
      key: "status",
      render: (_, r) => (
        <Select
          size="small"
          value={r.status}
          style={{ width: 130 }}
          disabled={updateStatusMutation.isPending}
          options={STAFF_STATUSES.map((status) => ({
            value: status,
            label: (
              <Tag color={STATUS_COLOR[status]} style={{ margin: 0 }}>
                {status}
              </Tag>
            ),
          }))}
          onChange={async (status: StaffStatus) => {
            try {
              await updateStatusMutation.mutateAsync({ id: r.id, status });
              message.success(`User status updated to ${status}.`);
            } catch (err: unknown) {
              const apiErr = err as { message?: string };
              message.error(apiErr.message || "Failed to update user status");
            }
          }}
        />
      ),
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
