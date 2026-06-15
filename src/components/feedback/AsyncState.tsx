"use client";

import { Alert, Button, Skeleton, Space } from "antd";
import { EmptyState } from "@/components/common/EmptyState";
import type { ApiError } from "@/lib/api/client";

function errorMessage(error: ApiError | Error | unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return "Something went wrong. Please try again.";
}

export interface AsyncStateProps {
  loading?: boolean;
  error?: ApiError | Error | unknown;
  empty?: boolean;
  emptyDescription?: string;
  onRetry?: () => void;
  children: React.ReactNode;
}

export function AsyncState({
  loading,
  error,
  empty,
  emptyDescription,
  onRetry,
  children,
}: AsyncStateProps) {
  if (loading) {
    return <Skeleton active paragraph={{ rows: 4 }} />;
  }

  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        title="Unable to load data"
        description={
          <Space orientation="vertical" size={8}>
            <span>{errorMessage(error)}</span>
            {onRetry ? (
              <Button size="small" onClick={onRetry}>
                Retry
              </Button>
            ) : null}
          </Space>
        }
      />
    );
  }

  if (empty) {
    return <EmptyState description={emptyDescription ?? "No records found"} />;
  }

  return <>{children}</>;
}
