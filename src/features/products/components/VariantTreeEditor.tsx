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

/** Cartesian product of per-level value lists → every combination. */
const cartesian = (lists: string[][]): string[][] =>
  lists.reduce<string[][]>(
    (acc, list) => acc.flatMap((combo) => list.map((v) => [...combo, v])),
    [[]],
  );

const parseValues = (text: string) =>
  text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export function VariantTreeEditor({ optionTypes, variants, onChange }: Props) {
  // Show Level 1 by default; reveal more with "Add level" (max 3).
  const [levelCount, setLevelCount] = useState(Math.max(1, optionTypes.length));
  // Comma-separated value lists per level, used by "Generate combinations".
  const [valuesText, setValuesText] = useState<Record<number, string>>({});

  const levelLists = Array.from({ length: levelCount }, (_, i) =>
    parseValues(valuesText[i + 1] ?? ""),
  );
  const canGenerate = levelLists.every((l) => l.length > 0);

  // Build a variant per combination; keep existing rows (price/stock) when the
  // same combo already exists, so re-generating never wipes entered data.
  const generateCombinations = () => {
    const combos = cartesian(levelLists);
    const next: ProductVariant[] = combos.map((combo) => {
      const existing = variants.find(
        (v) =>
          v.optionValueIds.length === combo.length &&
          combo.every((c, i) => v.optionValueIds[i] === c),
      );
      return (
        existing ?? {
          id: uid("var"),
          productId: variants[0]?.productId ?? "",
          sku: uid("SKU"),
          optionValueIds: combo,
          price: 0,
          stock: 0,
          isActive: true,
          tiers: [],
        }
      );
    });
    onChange({ optionTypes, variants: next });
  };

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

  const setTiers = (v: ProductVariant, tiers: ProductVariant["tiers"]) =>
    updateVariant(v.id, { tiers });

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

      <Card size="small" title="Generate combinations">
        <Space orientation="vertical" style={{ width: "100%" }}>
          {Array.from({ length: levelCount }, (_, i) => i + 1).map((level) => (
            <div key={level} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Typography.Text type="secondary" style={{ width: 64, flexShrink: 0 }}>
                {optionTypes.find((o) => o.level === level)?.name || `Level ${level}`}
              </Typography.Text>
              <Input
                placeholder={
                  level === 1 ? "White, Black, Brown" : "Small, Medium, Large"
                }
                value={valuesText[level] ?? ""}
                onChange={(e) =>
                  setValuesText((prev) => ({ ...prev, [level]: e.target.value }))
                }
              />
            </div>
          ))}
          <Button
            type="dashed"
            block
            disabled={!canGenerate}
            onClick={generateCombinations}
          >
            Generate {canGenerate ? levelLists.reduce((n, l) => n * l.length, 1) : ""}{" "}
            variants
          </Button>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Comma-separated values per level. Existing combos keep their price/stock.
          </Typography.Text>
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
            <div
              key={v.id}
              style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", paddingBottom: 8 }}
            >
              <Space wrap>
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
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeVariant(v.id)}
                />
              </Space>

              {/* Per-variant volume tiers — "buy N+ for X". */}
              <div style={{ marginTop: 6, paddingLeft: 8 }}>
                {v.tiers.map((t) => (
                  <Space key={t.id} wrap style={{ marginBottom: 4 }}>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Qty ≥
                    </Typography.Text>
                    <InputNumber
                      size="small"
                      min={2}
                      value={t.minQty}
                      onChange={(n) =>
                        setTiers(
                          v,
                          v.tiers.map((x) =>
                            x.id === t.id ? { ...x, minQty: n ?? 2 } : x,
                          ),
                        )
                      }
                    />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Price
                    </Typography.Text>
                    <InputNumber
                      size="small"
                      min={0}
                      value={t.price}
                      onChange={(n) =>
                        setTiers(
                          v,
                          v.tiers.map((x) =>
                            x.id === t.id ? { ...x, price: n ?? 0 } : x,
                          ),
                        )
                      }
                    />
                    <Button
                      size="small"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() =>
                        setTiers(
                          v,
                          v.tiers.filter((x) => x.id !== t.id),
                        )
                      }
                    />
                  </Space>
                ))}
                <Button
                  size="small"
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() =>
                    setTiers(v, [
                      ...v.tiers,
                      { id: uid("tier"), minQty: 10, price: v.price },
                    ])
                  }
                >
                  Add volume tier
                </Button>
              </div>
            </div>
          ))}
        </Space>
      </Card>
    </Space>
  );
}
