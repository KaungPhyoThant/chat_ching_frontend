"use client";

import { useState } from "react";
import { Button, Card, Input, InputNumber, Space, Typography } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ProductOptionType, ProductVariant } from "../types";

interface Props {
  optionTypes: ProductOptionType[];
  variants: ProductVariant[];
  onChange: (next: { optionTypes: ProductOptionType[]; variants: ProductVariant[] }) => void;
}

const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 8)}`;

export function VariantTreeEditor({ optionTypes, variants, onChange }: Props) {
  // Show Level 1 by default; reveal more with "Add level" (max 3).
  const [levelCount, setLevelCount] = useState(Math.max(1, optionTypes.length));

  const removeLevel = (level: number) => {
    const newCount = Math.max(1, levelCount - 1);
    setLevelCount(newCount);
    onChange({
      optionTypes: optionTypes.filter((o) => o.level !== level),
      variants: variants.map((v) => ({
        ...v,
        optionValueIds: v.optionValueIds.slice(0, newCount),
      })),
    });
  };

  const setLevelName = (level: number, name: string) => {
    const exists = optionTypes.find((o) => o.level === level);
    const next = exists
      ? optionTypes.map((o) => (o.level === level ? { ...o, name } : o))
      : [...optionTypes, { id: uid("ot"), name, level, sortOrder: level, values: [] }];
    onChange({ optionTypes: next, variants });
  };

  const addLeaf = () => {
    const variant: ProductVariant = {
      id: uid("var"),
      productId: variants[0]?.productId ?? "",
      sku: uid("SKU"),
      optionValueIds: [],
      price: 0,
      stock: 0,
      isActive: true,
      tiers: [],
    };
    onChange({ optionTypes, variants: [...variants, variant] });
  };

  const updateVariant = (id: string, patch: Partial<ProductVariant>) =>
    onChange({ optionTypes, variants: variants.map((v) => (v.id === id ? { ...v, ...patch } : v)) });

  const removeVariant = (id: string) =>
    onChange({ optionTypes, variants: variants.filter((v) => v.id !== id) });

  return (
    <Space orientation="vertical" style={{ width: "100%" }} size="middle">
      <Card
        size="small"
        title="Levels (max 3)"
        extra={
          levelCount < 3 ? (
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setLevelCount((c) => Math.min(3, c + 1))}
            >
              Add level
            </Button>
          ) : null
        }
      >
        <Space orientation="vertical" style={{ width: "100%" }}>
          {Array.from({ length: levelCount }, (_, i) => i + 1).map((level) => (
            <div key={level} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Typography.Text type="secondary" style={{ width: 64, flexShrink: 0 }}>
                {`Level ${level}`}
              </Typography.Text>
              <Input
                placeholder={level === 1 ? "e.g. Color" : level === 2 ? "e.g. Size" : "e.g. Material"}
                value={optionTypes.find((o) => o.level === level)?.name ?? ""}
                onChange={(e) => setLevelName(level, e.target.value)}
              />
              {level > 1 && level === levelCount && (
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeLevel(level)}
                />
              )}
            </div>
          ))}
        </Space>
      </Card>

      <Card
        size="small"
        title="Variants"
        extra={
          <Button size="small" icon={<PlusOutlined />} onClick={addLeaf}>
            Add variant
          </Button>
        }
      >
        <Space orientation="vertical" style={{ width: "100%" }}>
          {variants.length === 0 && (
            <Typography.Text type="secondary">No variants yet.</Typography.Text>
          )}
          {variants.map((v) => (
            <Space key={v.id} wrap>
              <Input
                style={{ width: 120 }}
                placeholder="SKU"
                value={v.sku}
                onChange={(e) => updateVariant(v.id, { sku: e.target.value })}
              />
              {Array.from({ length: levelCount }, (_, i) => i).map((idx) => {
                const levelName = optionTypes.find((o) => o.level === idx + 1)?.name;
                return (
                  <Input
                    key={idx}
                    style={{ width: 120 }}
                    placeholder={levelName || `Level ${idx + 1}`}
                    value={v.optionValueIds[idx] ?? ""}
                    onChange={(e) => {
                      const next = [...v.optionValueIds];
                      next[idx] = e.target.value;
                      updateVariant(v.id, { optionValueIds: next });
                    }}
                  />
                );
              })}
              <InputNumber
                placeholder="Price"
                value={v.price}
                min={0}
                onChange={(n) => updateVariant(v.id, { price: n ?? 0 })}
              />
              <InputNumber
                placeholder="Stock"
                value={v.stock}
                min={0}
                onChange={(n) => updateVariant(v.id, { stock: n ?? 0 })}
              />
              <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeVariant(v.id)} />
            </Space>
          ))}
        </Space>
      </Card>
    </Space>
  );
}
