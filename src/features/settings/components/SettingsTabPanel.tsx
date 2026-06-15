"use client";

import { Flex, Typography } from "antd";
import type { ReactNode } from "react";
import { ContentCard } from "@/components/ui/ContentCard";

const { Text } = Typography;

/** Settings tab body — matches RBAC / master-data ContentCard pattern. */
export function SettingsTabPanel({
  lead,
  children,
  footer,
}: {
  lead?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <ContentCard>
      {lead ? (
        <Text type="secondary" className="app-settings-lead">
          {lead}
        </Text>
      ) : null}
      {children}
      {footer ? (
        <Flex justify="flex-end" gap={8} className="app-settings-footer">
          {footer}
        </Flex>
      ) : null}
    </ContentCard>
  );
}
