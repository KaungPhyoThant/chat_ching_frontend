import { http } from "msw";
import { fail, ok } from "../envelope";
import {
  MOCK_API_USER,
  endSession,
  readSession,
  startSession,
} from "../session";

export const authHandlers = [
  http.post("/api/auth/login", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
    };
    if (!body.email || !body.password) {
      return fail(400, "Email and password are required");
    }
    // Demo: accept any credentials. Carry the email into the mock user.
    const user = { ...MOCK_API_USER, email: body.email };
    startSession(user);
    return ok({ user });
  }),

  http.get("/api/auth/me", () => {
    const user = readSession();
    if (!user) return fail(401, "Not authenticated");
    return ok({ user });
  }),

  http.post("/api/auth/refresh", () => {
    const user = readSession();
    if (!user) return fail(401, "Session expired");
    return ok({ user });
  }),

  http.post("/api/auth/logout", () => {
    endSession();
    return ok({ success: true });
  }),
];
