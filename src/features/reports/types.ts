export type ReportRange = "7d" | "30d" | "90d" | "1y";

export interface ReportData {
  range: { from: string; to: string; days: number };
  summary: {
    revenue: number;
    orders: number;
    paidOrders: number;
    avgOrderValue: number;
    unitsSold: number;
    newCustomers: number;
    cancelledOrders: number;
  };
  series: { date: string; revenue: number; orders: number }[];
  ordersByStatus: { status: string; count: number }[];
  paymentMethods: { method: string; count: number; amount: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  topCustomers: { id: string; name: string; orders: number; spent: number }[];
  salesByCategory: { category: string; revenue: number }[];
  lowStock: { id: string; name: string; sku: string; stock: number }[];
}
