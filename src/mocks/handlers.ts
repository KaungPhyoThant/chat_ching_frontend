// MSW request handlers — the demo runs entirely against these (no backend).
// Each domain's handlers read/write the in-memory db (src/mocks/db).
import { catalogHandlers } from "./handlers/catalog";
import { commerceHandlers } from "./handlers/commerce";
import { marketingHandlers } from "./handlers/marketing";
import { dashboardHandlers } from "./handlers/dashboard";
import { adminHandlers } from "./handlers/admin";
import { pricingHandlers } from "./handlers/pricing";
import { deliveryHandlers } from "./handlers/delivery";

export const handlers = [
  ...catalogHandlers,
  ...commerceHandlers,
  ...marketingHandlers,
  ...dashboardHandlers,
  ...adminHandlers,
  ...pricingHandlers,
  ...deliveryHandlers,
];
