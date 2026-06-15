"use client";

import { Component, type ReactNode } from "react";
import { Result } from "antd";
import { logger } from "@/lib/observability/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    logger.error("ErrorBoundary caught an error", { error });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <Result
            status="error"
            title="Something went wrong"
            subTitle="Please refresh the page or contact support."
          />
        )
      );
    }
    return this.props.children;
  }
}
