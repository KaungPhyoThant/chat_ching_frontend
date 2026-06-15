export type NotificationType =
  | "ORDER_CONFIRMED"
  | "ORDER_SHIPPED"
  | "ORDER_DELIVERED"
  | "PROMOTION"
  | "HANDOFF_REQUEST"
  | "SYSTEM_ALERT";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: "1", type: "ORDER_CONFIRMED", title: "New order placed", body: "Order ORD-0001 confirmed — awaiting payment", isRead: false, createdAt: "2 min ago" },
  { id: "2", type: "HANDOFF_REQUEST", title: "Customer needs a human", body: "A conversation was escalated to support", isRead: false, createdAt: "15 min ago" },
  { id: "3", type: "ORDER_SHIPPED", title: "Order shipped", body: "Order ORD-0002 handed to courier", isRead: false, createdAt: "20 min ago" },
  { id: "4", type: "PROMOTION", title: "Promotion ending soon", body: "Code SAVE10 expires in 24h", isRead: true, createdAt: "1 hr ago" },
  { id: "5", type: "SYSTEM_ALERT", title: "Backup completed", body: "Nightly database backup succeeded", isRead: true, createdAt: "3 hr ago" },
];
