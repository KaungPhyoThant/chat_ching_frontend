// MSW request handlers — the demo runs entirely against these (no backend).
// Each domain's handlers read/write the in-memory db (src/mocks/db).
import { authHandlers } from "./handlers/auth";
import { catalogHandlers } from "./handlers/catalog";
import { commerceHandlers } from "./handlers/commerce";
import { marketingHandlers } from "./handlers/marketing";
import { dashboardHandlers } from "./handlers/dashboard";
import { adminHandlers } from "./handlers/admin";
import { capabilitiesHandlers } from "./handlers/capabilities";
import { settingsHandlers } from "./handlers/settings";
import { pricingHandlers } from "./handlers/pricing";
import { deliveryHandlers } from "./handlers/delivery";

export const handlers = [
  ...authHandlers,
  ...catalogHandlers,
  ...commerceHandlers,
  ...marketingHandlers,
  ...dashboardHandlers,
  ...adminHandlers,
  ...capabilitiesHandlers,
  ...settingsHandlers,
  ...pricingHandlers,
  ...deliveryHandlers,
];
