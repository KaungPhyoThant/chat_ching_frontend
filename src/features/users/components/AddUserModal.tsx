"use client";

import { useEffect } from "react";
import { App, Form, Input, Modal, Select } from "antd";
import type { StaffUser } from "../types";
import { useCreateUser, useUpdateUser } from "../hooks/useStaff";
import { useRbacRoles } from "../../rbac/hooks/useRbac";

export function AddUserModal({
  open,
  onClose,
  user,
}: Readonly<{
  open: boolean;
  onClose: () => void;
  user?: StaffUser | null;
}>) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const isEdit = !!user;

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const { data: roles = [], isLoading: loadingRoles } = useRbacRoles();

  const roleOptions = roles.map((r) => ({
    label: r.name,
    value: r.code,
  }));

  useEffect(() => {
    if (!open) return;
    if (user) form.setFieldsValue(user);
    else form.resetFields();
  }, [open, user, form]);

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      try {
        if (isEdit && user) {
          await updateUserMutation.mutateAsync({
            id: user.id,
            payload: values,
          });
          message.success("Staff user updated successfully.");
        } else {
          await createUserMutation.mutateAsync(values);
          message.success("Staff user created. Default password is 'Welcome123!'.");
        }
        form.resetFields();
        onClose();
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        message.error(apiErr.message || "Failed to save staff user");
      }
    });
  };

  return (
    <Modal
      open={open}
      title={isEdit ? "Edit staff user" : "Add staff user"}
      okText={isEdit ? "Save" : "Create"}
      confirmLoading={createUserMutation.isPending || updateUserMutation.isPending}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="fullName" label="Full name" rules={[{ required: true }]}>
          <Input placeholder="Full name" />
        </Form.Item>
        {isEdit && (
          <Form.Item name="employeeId" label="Employee ID">
            <Input disabled />
          </Form.Item>
        )}
        <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
          <Input placeholder="name@example.com" />
        </Form.Item>
        <Form.Item name="role" label="Role" rules={[{ required: true }]}>
          <Select
            options={roleOptions}
            loading={loadingRoles}
            placeholder="Select role"
          />
        </Form.Item>
        <Form.Item name="department" label="Department">
          <Input placeholder="e.g. Operations" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
