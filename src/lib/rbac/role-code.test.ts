import { describe, expect, it } from "vitest";
import { normalizeRole, toBackendRole } from "./role-code";

describe("role-code", () => {
  it("normalizes backend lower-snake role codes to frontend role codes", () => {
    expect(normalizeRole("super_admin")).toBe("SUPER_ADMIN");
    expect(normalizeRole("catalog_manager")).toBe("CATALOG_MANAGER");
    expect(normalizeRole("support_agent")).toBe("SUPPORT_AGENT");
  });

  it("keeps frontend role codes stable", () => {
    expect(normalizeRole("ORDER_MANAGER")).toBe("ORDER_MANAGER");
  });

  it("converts frontend role codes back to backend lower-snake codes", () => {
    expect(toBackendRole("SUPER_ADMIN")).toBe("super_admin");
    expect(toBackendRole("ORDER_MANAGER")).toBe("order_manager");
  });

  it("normalizes the dev role", () => {
    expect(normalizeRole("dev")).toBe("DEV");
    expect(normalizeRole("DEV")).toBe("DEV");
    expect(toBackendRole("DEV")).toBe("dev");
  });

  it("rejects unknown role codes", () => {
    expect(() => normalizeRole("owner")).toThrow("Unknown role code");
  });
});
