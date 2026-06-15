/**
 * Seeded in-memory database for the demo (frontend-only, no backend).
 * Collections are cross-referenced (orders reference customers + products)
 * and mutations persist for the session. Reset on full page reload.
 */
import { Collection, daysAgo, docNo } from "./store";
import type { Category } from "@/features/categories/types";
import type { Product } from "@/features/products/types";
import type { Customer } from "@/features/customers/types";
import type { Order, OrderStatus } from "@/features/orders/types";
import type { Promotion } from "@/features/promotions/types";
import type { Broadcast } from "@/features/broadcasts/types";
import type { Conversation } from "@/features/conversations/types";
import type { StaffUser } from "@/features/users/types";
import type { RbacPermission, RbacRole } from "@/features/rbac/types";
import type { AuditEntry } from "@/features/audit/api/audit-api";
import type { AppNotification } from "@/features/notifications/data";
import { MOCK_NOTIFICATIONS } from "@/features/notifications/data";
import { CRUD_COLUMNS, RBAC_MODULES } from "@/features/rbac/rbac-modules";

// ---------- Categories ----------
const categorySeed: Category[] = [
  { id: "cat_electronics", parentId: null, name: "Electronics", slug: "electronics", isActive: true, sortOrder: 1, productCount: 0, description: "Phones, laptops and gadgets" },
  { id: "cat_phones", parentId: "cat_electronics", name: "Phones", slug: "phones", isActive: true, sortOrder: 1, productCount: 0 },
  { id: "cat_laptops", parentId: "cat_electronics", name: "Laptops", slug: "laptops", isActive: true, sortOrder: 2, productCount: 0 },
  { id: "cat_fashion", parentId: null, name: "Fashion", slug: "fashion", isActive: true, sortOrder: 2, productCount: 0, description: "Clothing & accessories" },
  { id: "cat_men", parentId: "cat_fashion", name: "Men", slug: "men", isActive: true, sortOrder: 1, productCount: 0 },
  { id: "cat_women", parentId: "cat_fashion", name: "Women", slug: "women", isActive: true, sortOrder: 2, productCount: 0 },
  { id: "cat_home", parentId: null, name: "Home & Living", slug: "home-living", isActive: true, sortOrder: 3, productCount: 0 },
  { id: "cat_beauty", parentId: null, name: "Beauty", slug: "beauty", isActive: false, sortOrder: 4, productCount: 0 },
];

const PRODUCT_NAMES: Record<string, string[]> = {
  cat_phones: ["Galaxy A55", "iPhone 15", "Redmi Note 13", "Pixel 8"],
  cat_laptops: ["MacBook Air M3", "ThinkPad X1", "Asus Zenbook", "Dell XPS 13"],
  cat_men: ["Cotton Polo Shirt", "Slim Jeans", "Leather Belt", "Canvas Sneakers"],
  cat_women: ["Summer Dress", "Silk Scarf", "Tote Bag", "Ankle Boots"],
  cat_home: ["Ceramic Mug Set", "LED Desk Lamp", "Throw Blanket", "Wall Clock"],
  cat_beauty: ["Vitamin C Serum", "Matte Lipstick", "Sheet Mask Pack"],
};

const productSeed: Product[] = [];
let pIdx = 0;
for (const [categoryId, names] of Object.entries(PRODUCT_NAMES)) {
  const category = categorySeed.find((c) => c.id === categoryId)!;
  for (const name of names) {
    pIdx += 1;
    const price = 9_000 + pIdx * 7_500;
    const stock = (pIdx * 13) % 60;
    productSeed.push({
      id: `prd_${pIdx}`,
      categoryId,
      categoryName: category.name,
      sku: `SKU-${String(pIdx).padStart(4, "0")}`,
      name,
      description: `${name} — quality ${category.name.toLowerCase()} item.`,
      price,
      stock,
      images: [`https://picsum.photos/seed/prd${pIdx}/320/320`],
      isActive: pIdx % 7 !== 0,
      createdAt: daysAgo(pIdx),
    });
  }
}
for (const c of categorySeed) {
  c.productCount = productSeed.filter((p) => p.categoryId === c.id).length;
}

// ---------- Customers ----------
const CUSTOMER_NAMES = [
  "Aung Kyaw", "Hla Hla", "Su Su", "Min Thant", "Nilar Win", "Kyaw Zaw",
  "Thida Aye", "Zaw Lin", "Phyu Phyu", "Ko Ko", "Mya Mya", "Tun Tun",
];
const customerSeed: Customer[] = CUSTOMER_NAMES.map((fullName, i) => ({
  id: `cus_${i + 1}`,
  telegramId: String(100_000_000 + i * 13_577),
  username: fullName.toLowerCase().replace(/\s+/g, ""),
  fullName,
  phone: `09${String(400_000_000 + i * 1_234_567).slice(0, 9)}`,
  address: i % 3 === 0 ? "Yangon" : i % 3 === 1 ? "Mandalay" : "Naypyitaw",
  languageCode: i % 4 === 0 ? "en" : "my",
  isBlocked: i === 9,
  orderCount: 0,
  totalSpent: 0,
  createdAt: daysAgo(60 - i),
}));

// ---------- Orders ----------
const ORDER_STATUSES: OrderStatus[] = [
  "PENDING", "CONFIRMED", "PAID", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED",
];
const PAYMENT_METHODS = ["KBZPAY", "WAVEPAY", "BANK_TRANSFER", "COD"] as const;

const orderSeed: Order[] = [];
for (let i = 1; i <= 22; i += 1) {
  const customer = customerSeed[i % customerSeed.length];
  const status = ORDER_STATUSES[i % ORDER_STATUSES.length];
  const itemCount = (i % 3) + 1;
  const items = Array.from({ length: itemCount }, (_, k) => {
    const product = productSeed[(i + k) % productSeed.length];
    const quantity = (k % 2) + 1;
    return {
      id: `oit_${i}_${k}`,
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
      quantity,
      lineTotal: product.price * quantity,
    };
  });
  const subtotal = items.reduce((sum, it) => sum + it.lineTotal, 0);
  const discountAmount = i % 4 === 0 ? Math.round(subtotal * 0.1) : 0;
  const totalAmount = subtotal - discountAmount;
  const paid = ["PAID", "PACKED", "SHIPPED", "DELIVERED"].includes(status);
  orderSeed.push({
    id: `ord_${i}`,
    orderNo: docNo("ORD", i),
    customerId: customer.id,
    customerName: customer.fullName,
    status,
    subtotal,
    discountAmount,
    totalAmount,
    promotionCode: discountAmount ? "SAVE10" : undefined,
    shippingAddress: customer.address,
    createdAt: daysAgo(i),
    items,
    payment: {
      method: PAYMENT_METHODS[i % PAYMENT_METHODS.length],
      status: paid ? "SUCCESS" : status === "REFUNDED" ? "REFUNDED" : "PENDING",
      amount: totalAmount,
      transactionRef: paid ? `TXN${1000 + i}` : undefined,
      paidAt: paid ? daysAgo(i) : undefined,
    },
    timeline: [{ status: "PENDING", at: daysAgo(i) }, { status, at: daysAgo(Math.max(0, i - 1)) }],
  });
}
for (const c of customerSeed) {
  const own = orderSeed.filter((o) => o.customerId === c.id);
  c.orderCount = own.length;
  c.totalSpent = own.reduce((s, o) => s + o.totalAmount, 0);
}

// ---------- Promotions ----------
const promotionSeed: Promotion[] = [
  { id: "promo_1", code: "SAVE10", type: "PERCENT", value: 10, minSpend: 20_000, maxUses: 100, usedCount: 34, startsAt: daysAgo(30), expiresAt: daysAgo(-30), isActive: true },
  { id: "promo_2", code: "WELCOME5000", type: "FIXED", value: 5_000, minSpend: 30_000, maxUses: 200, usedCount: 88, startsAt: daysAgo(60), expiresAt: daysAgo(-10), isActive: true },
  { id: "promo_3", code: "FLASH20", type: "PERCENT", value: 20, maxUses: 50, usedCount: 50, startsAt: daysAgo(5), expiresAt: daysAgo(-2), isActive: true },
  { id: "promo_4", code: "NEWYEAR", type: "PERCENT", value: 15, usedCount: 12, startsAt: daysAgo(120), expiresAt: daysAgo(90), isActive: false },
  { id: "promo_5", code: "FREESHIP", type: "FIXED", value: 2_500, minSpend: 15_000, usedCount: 5, isActive: true },
];

// ---------- Broadcasts ----------
const broadcastSeed: Broadcast[] = [
  { id: "bct_1", title: "Weekend Flash Sale", body: "20% off all electronics this weekend!", segment: "All customers", status: "SENT", recipientCount: 1240, sentAt: daysAgo(2), createdAt: daysAgo(3) },
  { id: "bct_2", title: "New Arrivals", body: "Check out the latest fashion drops.", segment: "Fashion buyers", status: "SENT", recipientCount: 480, sentAt: daysAgo(7), createdAt: daysAgo(8) },
  { id: "bct_3", title: "Restock Alert", body: "Your favorite items are back in stock.", segment: "Repeat customers", status: "SCHEDULED", recipientCount: 0, scheduledAt: daysAgo(-1), createdAt: daysAgo(1) },
  { id: "bct_4", title: "Loyalty Reward", body: "Use WELCOME5000 for 5000 Ks off.", segment: "VIP", status: "DRAFT", recipientCount: 0, createdAt: daysAgo(0) },
];

// ---------- Conversations ----------
const INTENTS = ["product_search", "order_status", "faq", "complaint", "recommendation"];
const conversationSeed: Conversation[] = Array.from({ length: 9 }, (_, i) => {
  const customer = customerSeed[i % customerSeed.length];
  const needsHandoff = i % 4 === 0;
  return {
    id: `cnv_${i + 1}`,
    customerId: customer.id,
    customerName: customer.fullName,
    intent: INTENTS[i % INTENTS.length],
    botState: needsHandoff ? "handoff" : "browsing",
    needsHandoff,
    lastMessageAt: daysAgo(i / 2),
    messages: [
      { id: `msg_${i}_1`, role: "customer", text: "Hi, do you have the Galaxy A55 in stock?", at: daysAgo(i / 2) },
      { id: `msg_${i}_2`, role: "bot", text: "Yes! The Galaxy A55 is available for 64,000 Ks. Would you like to add it to your cart?", at: daysAgo(i / 2) },
      { id: `msg_${i}_3`, role: "customer", text: needsHandoff ? "I need to talk to a person about my refund." : "Add 1 please.", at: daysAgo(i / 2) },
    ],
  };
});

// ---------- Staff users ----------
const staffSeed: StaffUser[] = [
  { id: "usr_1", fullName: "System Administrator", employeeId: "EMP-0000001", email: "admin@example.com", role: "SUPER_ADMIN", department: "Operations", status: "ACTIVE" },
  { id: "usr_2", fullName: "Catalog Manager", employeeId: "EMP-CAT001", email: "catalog@example.com", role: "CATALOG_MANAGER", department: "Catalog", status: "ACTIVE" },
  { id: "usr_3", fullName: "Order Manager", employeeId: "EMP-ORD001", email: "orders@example.com", role: "ORDER_MANAGER", department: "Fulfillment", status: "ACTIVE" },
  { id: "usr_4", fullName: "Support Agent", employeeId: "EMP-SUP001", email: "support@example.com", role: "SUPPORT_AGENT", department: "Customer Support", status: "ACTIVE" },
  { id: "usr_5", fullName: "Nilar (Support)", employeeId: "EMP-SUP002", email: "nilar@example.com", role: "SUPPORT_AGENT", department: "Customer Support", status: "PENDING" },
];

// ---------- RBAC ----------
const permissionSeed: RbacPermission[] = RBAC_MODULES.flatMap((m) =>
  CRUD_COLUMNS.map((c) => ({
    id: `perm_${m.module}_${c.action}`,
    key: `${m.module}:${c.action}`,
    module: m.module,
    action: c.action,
    resource: m.label,
  })),
);

const ROLE_META: { code: string; name: string; description: string; modules: string[] | "all" }[] = [
  { code: "SUPER_ADMIN", name: "Super Admin", description: "Full system access", modules: "all" },
  { code: "ADMIN", name: "Admin", description: "Catalog, orders, customers, promotions, staff", modules: ["product", "order", "customer", "promotion", "conversation", "broadcast", "report", "user", "settings"] },
  { code: "CATALOG_MANAGER", name: "Catalog Manager", description: "Products, categories, inventory", modules: ["product"] },
  { code: "ORDER_MANAGER", name: "Order Manager", description: "Orders, payments, fulfillment", modules: ["order", "customer", "promotion"] },
  { code: "SUPPORT_AGENT", name: "Support Agent", description: "Conversations & AI handoffs", modules: ["conversation", "order", "customer"] },
];
const roleSeed: RbacRole[] = ROLE_META.map((r, i) => ({
  id: `role_${i + 1}`,
  code: r.code,
  name: r.name,
  description: r.description,
  userCount: staffSeed.filter((u) => u.role === r.code).length,
  permissions:
    r.modules === "all"
      ? permissionSeed
      : permissionSeed.filter((p) => (r.modules as string[]).includes(p.module)),
}));

// ---------- Audit ----------
const AUDIT_ACTIONS = ["CREATE", "UPDATE", "DELETE", "LOGIN", "STATUS_CHANGE"];
const AUDIT_MODULES = ["product", "order", "customer", "promotion", "user", "auth"];
const auditSeed: AuditEntry[] = Array.from({ length: 14 }, (_, i) => ({
  id: `aud_${i + 1}`,
  time: daysAgo(i / 3),
  user: staffSeed[i % staffSeed.length].fullName,
  action: AUDIT_ACTIONS[i % AUDIT_ACTIONS.length],
  module: AUDIT_MODULES[i % AUDIT_MODULES.length],
  resource: `#${1000 + i}`,
  ip: `192.168.1.${10 + i}`,
}));

// ---------- Notifications ----------
const notificationSeed: AppNotification[] = MOCK_NOTIFICATIONS.map((n) => ({ ...n }));

export const db = {
  categories: new Collection<Category>(categorySeed),
  products: new Collection<Product>(productSeed),
  customers: new Collection<Customer>(customerSeed),
  orders: new Collection<Order>(orderSeed),
  promotions: new Collection<Promotion>(promotionSeed),
  broadcasts: new Collection<Broadcast>(broadcastSeed),
  conversations: new Collection<Conversation>(conversationSeed),
  staff: new Collection<StaffUser>(staffSeed),
  roles: new Collection<RbacRole>(roleSeed),
  permissions: new Collection<RbacPermission>(permissionSeed),
  audit: new Collection<AuditEntry>(auditSeed),
  notifications: new Collection<AppNotification>(notificationSeed),
};
