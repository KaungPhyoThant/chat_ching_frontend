"use client";

import { useEffect } from "react";
import { App, Form, Input, Modal } from "antd";
import { useCreateRole, useUpdateRole } from "../hooks/useRbac";
import type { RbacRole } from "../types";

interface RoleFormModalProps {
  open: boolean;
  role?: RbacRole | null;
  onClose: () => void;
  onSaved?: (role: RbacRole) => void;
}

export function RoleFormModal({ open, role, onClose, onSaved }: RoleFormModalProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<{ name: string; description?: string }>();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const isEdit = Boolean(role);
  const isSuperAdmin = role?.code === "SUPER_ADMIN";

  useEffect(() => {
    if (!open) return;
    if (role) {
      form.setFieldsValue({
        name: role.name,
        description: role.description ?? undefined,
      });
    } else {
      form.resetFields();
    }
  }, [open, role, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    try {
      if (isEdit && role) {
        const saved = await updateRole.mutateAsync({
          roleId: role.id,
          payload: values,
        });
        message.success("Role updated");
        onSaved?.(saved);
      } else {
        const saved = await createRole.mutateAsync(values);
        message.success("Role created");
        onSaved?.(saved);
      }
      form.resetFields();
      onClose();
    } catch (err) {
      const apiErr = err as { message?: string };
      message.error(apiErr.message ?? "Failed to save role");
    }
  };

  return (
    <Modal
      open={open}
      title={isEdit ? "Edit role" : "Create role"}
      okText={isEdit ? "Save" : "Create"}
      confirmLoading={createRole.isPending || updateRole.isPending}
      onOk={() => void handleOk()}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      forceRender
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Role name"
          rules={[{ required: true, message: "Role name is required" }]}
        >
          <Input placeholder="e.g. Ward Manager" disabled={isSuperAdmin} />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} placeholder="Optional description" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
