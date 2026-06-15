"use client";

import { useEffect } from "react";
import { App, Form, Input, InputNumber, Modal, Select, Switch } from "antd";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useCreateProduct, useUpdateProduct } from "../hooks/useProducts";
import type { Product } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
}

export function ProductFormModal({ open, onClose, product }: Props) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const isEdit = !!product;

  const { data: categories = [] } = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));

  useEffect(() => {
    if (!open) return;
    if (product) {
      form.setFieldsValue(product);
    } else {
      form.resetFields();
      form.setFieldsValue({ isActive: true, stock: 0, price: 0 });
    }
  }, [open, product, form]);

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      try {
        if (isEdit && product) {
          await updateMutation.mutateAsync({ id: product.id, payload: values });
          message.success("Product updated");
        } else {
          await createMutation.mutateAsync(values);
          message.success("Product created");
        }
        onClose();
      } catch {
        message.error("Failed to save product");
      }
    });
  };

  return (
    <Modal
      open={open}
      title={isEdit ? "Edit product" : "Add product"}
      okText={isEdit ? "Save" : "Create"}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input placeholder="Product name" />
        </Form.Item>
        <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
          <Input placeholder="SKU-0001" />
        </Form.Item>
        <Form.Item name="categoryId" label="Category" rules={[{ required: true }]}>
          <Select options={categoryOptions} placeholder="Select category" showSearch optionFilterProp="label" />
        </Form.Item>
        <Form.Item name="price" label="Price (Ks)" rules={[{ required: true }]}>
          <InputNumber min={0} step={500} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="stock" label="Stock" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} placeholder="Short description" />
        </Form.Item>
        <Form.Item name="isActive" label="Active" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
