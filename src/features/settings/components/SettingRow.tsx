"use client";

import { Typography } from "antd";
import type { ReactNode } from "react";

const { Text } = Typography;

export function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="app-settings-row">
      <div className="app-settings-row__meta">
        <Text strong>{title}</Text>
        {description ? (
          <Text type="secondary" className="app-settings-row__desc">
            {description}
          </Text>
        ) : null}
      </div>
      <div className="app-settings-row__control">{children}</div>
    </div>
  );
}
