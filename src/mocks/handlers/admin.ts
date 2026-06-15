import { http } from "msw";
import { fail, ok } from "../envelope";
import { db } from "../db";
import { nextId } from "../db/store";
import type { StaffUser } from "@/features/users/types";
import type { RbacRole } from "@/features/rbac/types";

export const adminHandlers = [
  // ---- Staff users ----
  http.get("/api/users", () => ok(db.staff.all())),

  http.post("/api/users", async ({ request }) => {
    const body = (await request.json()) as Partial<StaffUser>;
    const user: StaffUser = {
      id: nextId("usr"),
      fullName: body.fullName ?? "New staff",
      employeeId: body.employeeId ?? `EMP-${Date.now().toString().slice(-6)}`,
      email: body.email ?? "",
      role: body.role ?? "SUPPORT_AGENT",
      department: body.department ?? "",
      status: "ACTIVE",
    };
    db.staff.insert(user);
    return ok(user);
  }),

  http.patch("/api/users/:id/status", async ({ params, request }) => {
    const { status } = (await request.json()) as { status: StaffUser["status"] };
    const updated = db.staff.update(String(params.id), { status });
    return updated ? ok(updated) : fail(404, "User not found");
  }),

  http.patch("/api/users/:id", async ({ params, request }) => {
    const body = (await request.json()) as Partial<StaffUser>;
    const updated = db.staff.update(String(params.id), body);
    return updated ? ok(updated) : fail(404, "User not found");
  }),

  http.delete("/api/users/:id", ({ params }) => {
    const removed = db.staff.remove(String(params.id));
    return removed ? ok(removed) : fail(404, "User not found");
  }),

  // ---- RBAC ----
  http.get("/api/rbac/permissions", () => ok(db.permissions.all())),
  http.get("/api/rbac/roles", () => ok(db.roles.all())),

  http.post("/api/rbac/roles", async ({ request }) => {
    const body = (await request.json()) as { name: string; description?: string };
    const role: RbacRole = {
      id: nextId("role"),
      code: body.name.toUpperCase().replace(/\s+/g, "_"),
      name: body.name,
      description: body.description ?? null,
      userCount: 0,
      permissions: [],
    };
    db.roles.insert(role);
    return ok(role);
  }),

  http.patch("/api/rbac/roles/:id", async ({ params, request }) => {
    const body = (await request.json()) as { name?: string; description?: string };
    const updated = db.roles.update(String(params.id), body);
    return updated ? ok(updated) : fail(404, "Role not found");
  }),

  http.delete("/api/rbac/roles/:id", ({ params }) => {
    const removed = db.roles.remove(String(params.id));
    return removed ? ok({ deleted: true }) : fail(404, "Role not found");
  }),

  http.put("/api/rbac/roles/:id/permissions", async ({ params, request }) => {
    const { permissionIds } = (await request.json()) as { permissionIds: string[] };
    const role = db.roles.find(String(params.id));
    if (!role) return fail(404, "Role not found");
    role.permissions = db.permissions
      .all()
      .filter((p) => permissionIds.includes(p.id));
    return ok(role);
  }),

  // ---- Notifications ----
  http.get("/api/notifications", () => ok(db.notifications.all())),

  http.patch("/api/notifications/:id/read", ({ params }) => {
    const updated = db.notifications.update(String(params.id), { isRead: true });
    return updated ? ok(updated) : fail(404, "Notification not found");
  }),

  http.post("/api/notifications/mark-all-read", () => {
    let count = 0;
    for (const n of db.notifications.all()) {
      if (!n.isRead) {
        n.isRead = true;
        count += 1;
      }
    }
    return ok({ count });
  }),

  // ---- Audit ----
  http.get("/api/audit-logs", () => ok(db.audit.all())),
];
