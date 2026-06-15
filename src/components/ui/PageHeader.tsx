"use client";

import { Flex, Typography } from "antd";
import type { ReactNode } from "react";

const { Title, Text } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <Flex
      justify="space-between"
      align="center"
      className="app-page-header"
      gap={16}
      wrap="wrap"
      style={{ marginBottom: 20 }}
    >
      <div>
        <Title level={3} style={{ margin: 0, fontWeight: 600, letterSpacing: "-0.02em" }}>
          {title}
        </Title>
        {subtitle ? (
          <Text type="secondary" style={{ fontSize: 14, marginTop: 4, display: "block" }}>
            {subtitle}
          </Text>
        ) : null}
      </div>
      {actions ? (
        <Flex gap={8} align="center">
          {actions}
        </Flex>
      ) : null}
    </Flex>
  );
}
