"use client";

import { Select } from "antd";
import type { SelectProps } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import {
  toolbarSelectContentStyle,
  toolbarSelectPlaceholderStyle,
  toolbarSelectRootStyle,
} from "@/theme/controlStyles";

export interface FilterSelectProps extends SelectProps {
  /** Small caption above the control (toolbar filters). */
  label?: string;
  /** Show filter icon inside the selector. */
  showFilterIcon?: boolean;
}

/** Toolbar filter select — matches SearchInput height and filled style. */
export function FilterSelect({
  label,
  showFilterIcon = true,
  allowClear = true,
  variant = "filled",
  size = "middle",
  className,
  style,
  ...props
}: FilterSelectProps) {
  const select = (
    <Select
      allowClear={allowClear}
      variant={variant}
      size={size}
      className={["app-filter-select", className].filter(Boolean).join(" ")}
      prefix={
        showFilterIcon ? (
          <FilterOutlined style={{ color: "var(--app-text-muted)", marginInlineEnd: 4 }} />
        ) : undefined
      }
      style={{ minWidth: 168, ...style }}
      classNames={{ popup: { root: "app-filter-select-dropdown" } }}
      {...props}
      styles={{
        root: toolbarSelectRootStyle,
        content: toolbarSelectContentStyle,
        placeholder: toolbarSelectPlaceholderStyle,
        prefix: { display: "flex", alignItems: "center" },
      }}
    />
  );

  if (!label) return select;

  return (
    <label className="app-filter-field">
      <span className="app-filter-field__label">{label}</span>
      {select}
    </label>
  );
}
