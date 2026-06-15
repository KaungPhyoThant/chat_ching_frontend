export interface DashboardStats {
  ordersToday: number;
  revenueToday: number;
  pendingOrders: number;
  lowStock: number;
  revenueSeries: { date: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  recentOrders: {
    id: string;
    orderNo: string;
    customerName: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  }[];
}
