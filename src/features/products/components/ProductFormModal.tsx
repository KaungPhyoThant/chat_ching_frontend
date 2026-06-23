"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  App,
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Switch,
  Tabs,
  Upload,
} from "antd";
import type { UploadFile } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useFeature } from "@/lib/features/useFeature";
import { useCreateProduct, useUpdateProduct } from "../hooks/useProducts";
import { VariantTreeEditor } from "./VariantTreeEditor";
import { MarkdownEditor } from "./MarkdownEditor";
import type { Product, ProductOptionType, ProductVariant } from "../types";
import type { CurrencyCode, PriceTier } from "@/features/pricing/types";

interface Props {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
}

const CURRENCIES: CurrencyCode[] = ["MMK", "USD", "THB"];
const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 8)}`;

function attributesToText(attrs?: Record<string, string>): string {
  if (!attrs) return "";
  return Object.entries(attrs)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
}

function textToAttributes(text: string): Record<string, string> | undefined {
  if (!text.trim()) return undefined;
  const out: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const [k, ...rest] = line.split("=");
    if (k?.trim() && rest.length) out[k.trim()] = rest.join("=").trim();
  }
  return Object.keys(out).length ? out : undefined;
}

export function ProductFormModal({ open, onClose, product }: Props) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const isEdit = !!product;

  const showVariants = useFeature("productVariants");
  const showAttributes = useFeature("productAttributes");
  const showTiered = useFeature("tieredPricing");
  const showMultiCurrency = useFeature("multiCurrency");
  const showCustomerGroups = useFeature("customerGroups");
  const showMultiPriceList = useFeature("multiPriceList");
  const showPricing = showTiered || showMultiCurrency || showCustomerGroups || showMultiPriceList;

  const { data: categories = [] } = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));

  const [optionTypes, setOptionTypes] = useState<ProductOptionType[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [attributesText, setAttributesText] = useState("");
  const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>("MMK");
  const [baseTiers, setBaseTiers] = useState<PriceTier[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const MAX_IMAGES = 10;

  useEffect(() => {
    if (!open) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    if (product) {
      form.setFieldsValue(product);
      setOptionTypes(product.optionTypes ?? []);
      setVariants(product.variants ?? []);
      setAttributesText(attributesToText(product.attributes));
      setBaseCurrency(product.baseCurrency ?? "MMK");
      setBaseTiers(product.variants?.[0]?.tiers ?? []);
      setImages(product.images ?? []);
    } else {
      form.resetFields();
      form.setFieldsValue({ isActive: true, stock: 0, price: 0 });
      setOptionTypes([]);
      setVariants([]);
      setAttributesText("");
      setBaseCurrency("MMK");
      setBaseTiers([]);
      setImages([]);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open, product, form]);

  const hasExplicitVariants = showVariants && variants.length > 0;

  const handleOk = () => {
    form
      .validateFields()
      .then(async (values) => {
        // When the product has no explicit variants, keep a single default
        // variant so base price/stock/tiers always live on a variant.
        const defaultVariant: ProductVariant = {
          id: product?.variants?.[0]?.id ?? uid("var"),
          productId: product?.id ?? "",
          sku: values.sku,
          optionValueIds: [],
          price: Number(values.price ?? 0),
          stock: Number(values.stock ?? 0),
          isActive: true,
          tiers: showTiered ? baseTiers : [],
        };
        const payload: Partial<Product> = {
          ...values,
          images,
          variants: hasExplicitVariants ? variants : [defaultVariant],
          hasVariants: hasExplicitVariants,
          optionTypes: showVariants ? optionTypes : [],
          ...(showMultiCurrency ? { baseCurrency } : {}),
          ...(showAttributes ? { attributes: textToAttributes(attributesText) } : {}),
        };
        try {
          if (isEdit && product) {
            await updateMutation.mutateAsync({ id: product.id, payload });
            message.success("Product updated");
          } else {
            await createMutation.mutateAsync(payload);
            message.success("Product created");
          }
          onClose();
        } catch {
          message.error("Failed to save product");
        }
      })
      .catch(() => {
        // Validation errors are displayed inline under each input by Ant Design.
        // We catch here to prevent Next.js unhandledRejection error overlays.
      });
  };

  const generalTab = (
    <>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Product name" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
            <Input placeholder="SKU-0001" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="categoryId" label="Category" rules={[{ required: true }]}>
            <Select options={categoryOptions} placeholder="Select category" showSearch optionFilterProp="label" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="price" label={`Price (${showMultiCurrency ? baseCurrency : "Ks"})`} rules={[{ required: true }]}>
            <InputNumber min={0} step={500} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="stock" label="Stock" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="description" label="Description">
        <MarkdownEditor />
      </Form.Item>
    </>
  );

  const pricingTab = (
    <Space orientation="vertical" style={{ width: "100%" }} size="large">
      {showMultiCurrency && (
        <div>
          <div style={{ marginBottom: 6, fontWeight: 500 }}>Base currency</div>
          <Select
            value={baseCurrency}
            onChange={(v) => setBaseCurrency(v)}
            options={CURRENCIES.map((c) => ({ label: c, value: c }))}
            style={{ width: 160 }}
          />
        </div>
      )}

      {showTiered && (
        <div>
          <div style={{ marginBottom: 6, fontWeight: 500 }}>
            Volume price breaks {hasExplicitVariants ? "(base — per-variant tiers via Variants tab)" : ""}
          </div>
          <Space orientation="vertical" style={{ width: "100%" }}>
            {baseTiers.length === 0 && (
              <span style={{ color: "var(--app-text-muted)" }}>No tiers — buyers pay the base price.</span>
            )}
            {baseTiers.map((t) => (
              <Space key={t.id} align="center">
                <span style={{ color: "var(--app-text-muted)" }}>Qty ≥</span>
                <InputNumber
                  min={1}
                  value={t.minQty}
                  onChange={(n) =>
                    setBaseTiers((prev) => prev.map((x) => (x.id === t.id ? { ...x, minQty: n ?? 1 } : x)))
                  }
                />
                <span style={{ color: "var(--app-text-muted)" }}>Price</span>
                <InputNumber
                  min={0}
                  value={t.price}
                  onChange={(n) =>
                    setBaseTiers((prev) => prev.map((x) => (x.id === t.id ? { ...x, price: n ?? 0 } : x)))
                  }
                />
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => setBaseTiers((prev) => prev.filter((x) => x.id !== t.id))}
                />
              </Space>
            ))}
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setBaseTiers((prev) => [...prev, { id: uid("tier"), minQty: 10, price: 0 }])}
            >
              Add tier
            </Button>
          </Space>
        </div>
      )}

      {(showCustomerGroups || showMultiPriceList) && (
        <Alert
          type="info"
          showIcon
          title="Wholesale & price lists"
          description="Customer-group and multi-currency price lists span all products and are managed on the Price Lists page (separate area). The pricing engine applies them automatically at checkout."
        />
      )}
    </Space>
  );

  const uploadFileList: UploadFile[] = images.map((url, i) => ({
    uid: String(i),
    name: `image-${i + 1}`,
    status: "done",
    url,
  }));

  const imagesTab = (
    <div>
      <div style={{ marginBottom: 12, color: "var(--app-text-muted)" }}>
        Up to {MAX_IMAGES} images. The first one is the cover.
      </div>
      <Upload
        listType="picture-card"
        accept="image/*"
        multiple
        fileList={uploadFileList}
        beforeUpload={(file) => {
          const reader = new FileReader();
          reader.onload = () =>
            setImages((prev) =>
              prev.length < MAX_IMAGES ? [...prev, reader.result as string] : prev,
            );
          reader.readAsDataURL(file);
          return false;
        }}
        onRemove={(file) => {
          setImages((prev) => prev.filter((_, i) => String(i) !== file.uid));
          return true;
        }}
      >
        {images.length < MAX_IMAGES && <div>+ Upload</div>}
      </Upload>
    </div>
  );

  const tabItems = [
    { key: "general", label: "General", children: generalTab },
    { key: "images", label: "Images", children: imagesTab },
    ...(showVariants
      ? [
          {
            key: "variants",
            label: "Variants",
            children: (
              <VariantTreeEditor
                optionTypes={optionTypes}
                variants={variants}
                onChange={({ optionTypes: ot, variants: vs }) => {
                  setOptionTypes(ot);
                  setVariants(vs);
                }}
              />
            ),
          },
        ]
      : []),
    ...(showPricing ? [{ key: "pricing", label: "Pricing", children: pricingTab }] : []),
    ...(showAttributes
      ? [
          {
            key: "attributes",
            label: "Attributes",
            children: (
              <div>
                <div style={{ marginBottom: 8 }}>Attributes (key=value per line)</div>
                <Input.TextArea
                  rows={4}
                  placeholder={"material=cotton\norigin=MM"}
                  value={attributesText}
                  onChange={(e) => setAttributesText(e.target.value)}
                />
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <Modal
      open={open}
      title={isEdit ? "Edit product" : "Add product"}
      okText={isEdit ? "Save" : "Create"}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      width={tabItems.length > 1 ? 640 : undefined}
      forceRender
    >
      <Form form={form} layout="vertical">
        <Tabs items={tabItems} />
      </Form>
    </Modal>
  );
}
