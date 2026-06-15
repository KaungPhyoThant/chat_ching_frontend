"use client";

import { Card, theme } from "antd";
import type { CardProps } from "antd";
import type { ReactNode } from "react";

interface ContentCardProps extends Omit<CardProps, "title"> {
  children: ReactNode;
  toolbar?: ReactNode;
}

/** Elevated surface for tables, forms, and dashboard panels. */
export function ContentCard({
  children,
  toolbar,
  styles,
  ...props
}: ContentCardProps) {
  const { token } = theme.useToken();

  return (
    <Card
      variant="borderless"
      className="app-content-card"
      styles={{
        body: {
          padding: toolbar ? 0 : undefined,
        },
        ...styles,
      }}
      style={{
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowTertiary,
        ...props.style,
      }}
      {...props}
    >
      {toolbar ? (
        <div className="app-content-card__toolbar">{toolbar}</div>
      ) : null}
      <div className="app-content-card__body" style={{ padding: toolbar ? 0 : undefined }}>
        {children}
      </div>
    </Card>
  );
}
