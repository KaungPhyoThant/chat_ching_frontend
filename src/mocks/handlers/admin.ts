import { http } from "msw";
import { fail, ok } from "../envelope";
import { db } from "../db";

export const adminHandlers = [
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
