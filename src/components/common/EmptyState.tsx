"use client";

import { Empty } from "antd";

export function EmptyState({ description }: { description?: string }) {
  return (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={description}
      style={{ padding: "32px 0" }}
    />
  );
}
