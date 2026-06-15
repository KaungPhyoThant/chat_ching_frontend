"use client";

import { Button } from "antd";
import type { ButtonProps } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { toolbarButtonRootStyle } from "@/theme/controlStyles";

type CreateButtonProps = ButtonProps;

const createButtonStyles: ButtonProps["styles"] = {
  root: toolbarButtonRootStyle,
  icon: { display: "inline-flex", alignItems: "center" },
};

/** Primary call-to-action for “create / register / book” flows. */
export function CreateButton({ children, icon, ...props }: CreateButtonProps) {
  return (
    <Button
      type="primary"
      size="middle"
      icon={icon ?? <PlusOutlined />}
      className="app-create-btn"
      {...props}
      styles={createButtonStyles}
    >
      {children}
    </Button>
  );
}
