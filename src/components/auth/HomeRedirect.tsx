"use client";

import { Spin } from "antd";

/** `/` is redirected by proxy; this is a brief fallback while that runs. */
export function HomeRedirect() {
  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
      <Spin size="large" />
    </div>
  );
}
