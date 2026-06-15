"use client";

import dynamic from "next/dynamic";
import { Card, Col, Row, Statistic, Tag } from "antd";
import {
  ShoppingCartOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { ORDER_STATUS, type OrderStatus } from "@/config/enums";
import { formatCurrency, formatDate } from "@/lib/format";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";

const Column = dynamic(() => import("@ant-design/plots").then((m) => m.Column), { ssr: false });
const Pie = dynamic(() => import("@ant-design/plots").then((m) => m.Pie), { ssr: false });

interface RecentOrder {
  id: string;
  orderNo: string;
  customerName: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  const recentColumns: ColumnsType<RecentOrder> = [
    { title: "Order", dataIndex: "orderNo" },
    { title: "Customer", dataIndex: "customerName" },
    {
      title: "Status",
      dataIndex: "status",
      render: (s: string) => <Tag color={ORDER_STATUS[s as OrderStatus]?.color}>{s}</Tag>,
    },
    { title: "Total", dataIndex: "totalAmount", align: "right", render: (v: number) => formatCurrency(v) },
    { title: "Date", dataIndex: "createdAt", render: (v: string) => formatDate(v) },
  ];

  const kpis = [
    { title: "Orders today", value: data?.ordersToday ?? 0, icon: <ShoppingCartOutlined />, color: "#1677ff" },
    { title: "Revenue today", value: data ? formatCurrency(data.revenueToday) : "—", icon: <DollarOutlined />, color: "#52c41a" },
    { title: "Pending orders", value: data?.pendingOrders ?? 0, icon: <ClockCircleOutlined />, color: "#faad14" },
    { title: "Low-stock items", value: data?.lowStock ?? 0, icon: <WarningOutlined />, color: "#cf1322" },
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Store performance at a glance" />

      <Row gutter={[16, 16]}>
        {kpis.map((k) => (
          <Col xs={12} lg={6} key={k.title}>
            <Card variant="borderless" loading={isLoading}>
              <Statistic
                title={k.title}
                value={k.value}
                prefix={<span style={{ color: k.color }}>{k.icon}</span>}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="Revenue (last 14 days)" variant="borderless" loading={isLoading}>
            <Column
              height={260}
              data={data?.revenueSeries ?? []}
              xField="date"
              yField="revenue"
              axis={{ x: { labelAutoHide: true } }}
              style={{ fill: "#1677ff", radiusTopLeft: 4, radiusTopRight: 4 }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Orders by status" variant="borderless" loading={isLoading}>
            <Pie
              height={260}
              data={data?.ordersByStatus ?? []}
              angleField="count"
              colorField="status"
              innerRadius={0.5}
              legend={{ color: { position: "bottom" } }}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        <Card title="Recent orders" variant="borderless">
          <DataTable<RecentOrder>
            rowKey="id"
            loading={isLoading}
            columns={recentColumns}
            dataSource={data?.recentOrders ?? []}
            pagination={false}
          />
        </Card>
      </div>
    </>
  );
}
