"use client";

import { Input } from "antd";
import type { InputProps } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import {
  toolbarInputInnerStyle,
  toolbarInputRootStyle,
} from "@/theme/controlStyles";

export interface SearchInputProps extends Omit<InputProps, "prefix"> {
  /** When true, uses a wider field suited for page toolbars. */
  wide?: boolean;
}

export function SearchInput({
  wide,
  allowClear = true,
  variant = "filled",
  size = "middle",
  style,
  ...props
}: SearchInputProps) {
  return (
    <Input
      allowClear={allowClear}
      variant={variant}
      size={size}
      prefix={<SearchOutlined style={{ color: "var(--app-text-muted)" }} />}
      className="app-search-input"
      style={{
        flex: wide ? "1 1 280px" : undefined,
        maxWidth: wide ? 420 : 320,
        borderRadius: 10,
        ...style,
      }}
      {...props}
      styles={{
        root: toolbarInputRootStyle,
        input: toolbarInputInnerStyle,
        prefix: { display: "flex", alignItems: "center" },
      }}
    />
  );
}
