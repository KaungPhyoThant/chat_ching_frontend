"use client";

import { useMemo, useState } from "react";
import {
  App,
  Button,
  Checkbox,
  Flex,
  Select,
  Space,
  Table,
  Typography,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { ContentCard } from "@/components/ui/ContentCard";
import {
  CRUD_COLUMNS,
  RBAC_MODULES,
  permissionKey,
  type CrudAction,
} from "../rbac-modules";
import {
  useDeleteRole,
  useRbacPermissions,
  useRbacRoles,
  useSetRolePermissions,
} from "../hooks/useRbac";
import type { RbacPermission, RbacRole } from "../types";
import { RoleFormModal } from "./RoleFormModal";

const { Text } = Typography;

type ModuleRow = (typeof RBAC_MODULES)[number];

interface PermissionDraft {
  roleId: string;
  permissionIds: Set<string>;
  sourcePermissionIds: Set<string>;
}

function permissionIdSet(role: RbacRole | undefined): Set<string> {
  return new Set(role?.permissions.map((p) => p.id) ?? []);
}

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const id of a) {
    if (!b.has(id)) return false;
  }
  return true;
}

export function RbacMatrix() {
  const { message, modal } = App.useApp();
  const { data: permissions = [], isLoading: loadingPerms } = useRbacPermissions();
  const { data: roles = [], isLoading: loadingRoles } = useRbacRoles();
  const setPermissions = useSetRolePermissions();
  const deleteRole = useDeleteRole();

  const [selectedRoleId, setSelectedRoleId] = useState<string | undefined>();
  const [permissionDraft, setPermissionDraft] = useState<PermissionDraft | null>(
    null,
  );
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RbacRole | null>(null);

  const permissionByKey = useMemo(() => {
    const map = new Map<string, RbacPermission>();
    for (const p of permissions) {
      map.set(p.key, p);
    }
    return map;
  }, [permissions]);

  const activeRoleId = selectedRoleId ?? roles[0]?.id;
  const activeRole = roles.find((r) => r.id === activeRoleId);
  const savedPermissionIds = useMemo(
    () => permissionIdSet(activeRole),
    [activeRole],
  );
  const activeDraft =
    activeRole &&
    permissionDraft?.roleId === activeRole.id &&
    setsEqual(permissionDraft.sourcePermissionIds, savedPermissionIds)
      ? permissionDraft
      : null;
  const draftPermissionIds =
    activeDraft?.permissionIds ?? savedPermissionIds;
  const isDirty = activeRole
    ? !setsEqual(draftPermissionIds, savedPermissionIds)
    : false;
  const isLocked = activeRole?.code === "SUPER_ADMIN";

  const switchRole = (roleId: string) => {
    const selectRole = () => {
      setPermissionDraft(null);
      setSelectedRoleId(roleId);
    };

    if (isDirty) {
      modal.confirm({
        title: "Discard unsaved permission changes?",
        content: "You have unsaved changes for the current role.",
        okText: "Discard",
        okType: "danger",
        onOk: selectRole,
      });
      return;
    }
    selectRole();
  };

  const toggleDraftPermission = (permission: RbacPermission, enabled: boolean) => {
    if (!activeRole || isLocked) {
      message.warning("Super Admin always has full access.");
      return;
    }
    setPermissionDraft(() => {
      const next = new Set(draftPermissionIds);
      if (enabled) next.add(permission.id);
      else next.delete(permission.id);
      return {
        roleId: activeRole.id,
        permissionIds: next,
        sourcePermissionIds: new Set(savedPermissionIds),
      };
    });
  };

  const handleSavePermissions = async () => {
    if (!activeRole || isLocked) return;
    try {
      await setPermissions.mutateAsync({
        roleId: activeRole.id,
        permissionIds: [...draftPermissionIds],
      });
      message.success(`Permissions saved for ${activeRole.name}`);
    } catch (err) {
      const apiErr = err as { message?: string };
      message.error(apiErr.message ?? "Failed to save permissions");
    }
  };

  const handleDiscardPermissions = () => {
    setPermissionDraft(null);
  };

  const handleDeleteRole = () => {
    if (!activeRole || isLocked) return;
    modal.confirm({
      title: `Delete role "${activeRole.name}"?`,
      content: "This cannot be undone. The role must have no assigned users.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteRole.mutateAsync(activeRole.id);
          message.success("Role deleted");
          setPermissionDraft(null);
          setSelectedRoleId(undefined);
        } catch (err) {
          const apiErr = err as { message?: string };
          message.error(apiErr.message ?? "Failed to delete role");
        }
      },
    });
  };

  const columns: ColumnsType<ModuleRow> = [
    {
      title: "Resource",
      key: "resource",
      fixed: "left",
      width: 220,
      render: (_, row) => <Text strong>{row.label}</Text>,
    },
    ...CRUD_COLUMNS.map((col) => ({
      title: col.label,
      key: col.action,
      align: "center" as const,
      width: 100,
      render: (_: unknown, row: ModuleRow) => {
        if (!activeRole) return null;

        const key = permissionKey(row.module, col.action as CrudAction);
        const permission = permissionByKey.get(key);
        if (!permission) {
          return <Text type="secondary">—</Text>;
        }

        const checked = isLocked
          ? true
          : draftPermissionIds.has(permission.id);

        return (
          <Checkbox
            checked={checked}
            disabled={isLocked}
            onChange={(e) => toggleDraftPermission(permission, e.target.checked)}
            aria-label={`${row.label} ${col.label}`}
          />
        );
      },
    })),
  ];

  return (
    <ContentCard>
      <Flex
        wrap="wrap"
        gap={12}
        align="flex-end"
        justify="space-between"
        style={{ marginBottom: 16 }}
      >
        <div>
          <Text type="secondary" style={{ display: "block", marginBottom: 4 }}>
            Role
          </Text>
          <Select
            style={{ minWidth: 260 }}
            placeholder="Select role"
            loading={loadingRoles}
            value={activeRoleId}
            onChange={switchRole}
            options={roles.map((role) => ({
              value: role.id,
              label: role.name,
            }))}
          />
        </div>

        <Space wrap>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingRole(null);
              setRoleModalOpen(true);
            }}
          >
            Add role
          </Button>
          <Button
            icon={<EditOutlined />}
            disabled={!activeRole}
            onClick={() => {
              if (!activeRole) return;
              setEditingRole(activeRole);
              setRoleModalOpen(true);
            }}
          >
            Edit role
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            disabled={!activeRole || isLocked}
            onClick={handleDeleteRole}
          >
            Delete role
          </Button>
        </Space>
      </Flex>

      {activeRole?.description ? (
        <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
          {activeRole.description}
          {activeRole.userCount > 0 ? ` · ${activeRole.userCount} users` : ""}
        </Text>
      ) : activeRole && activeRole.userCount > 0 ? (
        <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
          {activeRole.userCount} users with this role
        </Text>
      ) : null}

      <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
        Grant List (read), Create, Edit (update), and Delete per resource. Click Save
        permissions when finished.
      </Text>

      <Table<ModuleRow>
        rowKey="module"
        size="middle"
        bordered
        loading={loadingPerms || loadingRoles}
        columns={columns}
        dataSource={[...RBAC_MODULES]}
        pagination={false}
      />

      <Flex justify="flex-end" gap={8} style={{ marginTop: 16 }}>
        <Button disabled={!isDirty || isLocked} onClick={handleDiscardPermissions}>
          Discard
        </Button>
        <Button
          type="primary"
          disabled={!isDirty || isLocked || setPermissions.isPending}
          loading={setPermissions.isPending}
          onClick={() => void handleSavePermissions()}
        >
          Save permissions
        </Button>
      </Flex>

      {isLocked ? (
        <Text type="secondary" style={{ display: "block", marginTop: 12, fontSize: 12 }}>
          Super Admin permissions are locked (server-enforced).
        </Text>
      ) : null}

      <RoleFormModal
        open={roleModalOpen}
        role={editingRole}
        onClose={() => {
          setRoleModalOpen(false);
          setEditingRole(null);
        }}
        onSaved={(role) => {
          setPermissionDraft(null);
          setSelectedRoleId(role.id);
        }}
      />
    </ContentCard>
  );
}
