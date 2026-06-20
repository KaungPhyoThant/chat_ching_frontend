"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Card, Col, Row, Segmented, Statistic, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatCurrency } from "@/lib/format";
import { useReports } from "@/features/reports/hooks/useReports";
import type { ReportData, ReportRange } from "@/features/reports/types";

const Line = dynamic(() => import("@ant-design/plots").then((m) => m.Line), { ssr: false });
const Column = dynamic(() => import("@ant-design/plots").then((m) => m.Column), { ssr: false });
const Pie = dynamic(() => import("@ant-design/plots").then((m) => m.Pie), { ssr: false });

const RANGE_OPTIONS = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
  { label: "1 year", value: "1y" },
];

function money(v: number) {
  return formatCurrency(v);
}

export default function ReportsPage() {
  const [range, setRange] = useState<ReportRange>("30d");
  const { data: d, isLoading } = useReports(range);

  const topProductCols: ColumnsType<ReportData["topProducts"][number]> = [
    { title: "Product", dataIndex: "name", render: (v: string) => <strong>{v}</strong> },
    { title: "Units", dataIndex: "quantity", align: "right" },
    { title: "Revenue", dataIndex: "revenue", align: "right", render: money },
  ];

  const topCustomerCols: ColumnsType<ReportData["topCustomers"][number]> = [
    { title: "Customer", dataIndex: "name", render: (v: string) => <strong>{v}</strong> },
    { title: "Orders", dataIndex: "orders", align: "right" },
    { title: "Spent", dataIndex: "spent", align: "right", render: money },
  ];

  const lowStockCols: ColumnsType<ReportData["lowStock"][number]> = [
    { title: "Product", dataIndex: "name", render: (v: string) => <strong>{v}</strong> },
    { title: "SKU", dataIndex: "sku" },
    {
      title: "Stock",
      dataIndex: "stock",
      align: "right",
      render: (v: number) => <Tag color={v === 0 ? "red" : "orange"}>{v}</Tag>,
    },
  ];

  const paymentCols: ColumnsType<ReportData["paymentMethods"][number]> = [
    { title: "Method", dataIndex: "method" },
    { title: "Orders", dataIndex: "count", align: "right" },
    { title: "Amount", dataIndex: "amount", align: "right", render: money },
  ];

  const kpis: { label: string; value: string | number }[] = [
    { label: "Revenue", value: formatCurrency(d?.summary.revenue ?? 0) },
    { label: "Paid orders", value: d?.summary.paidOrders ?? 0 },
    { label: "Total orders", value: d?.summary.orders ?? 0 },
    { label: "Avg order value", value: formatCurrency(d?.summary.avgOrderValue ?? 0) },
    { label: "Units sold", value: d?.summary.unitsSold ?? 0 },
    { label: "New customers", value: d?.summary.newCustomers ?? 0 },
  ];

  const statusPie = (d?.ordersByStatus ?? []).map((s) => ({ type: s.status, value: s.count }));

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Sales, products, customers & fulfillment analytics"
        actions={
          <Segmented
            options={RANGE_OPTIONS}
            value={range}
            onChange={(v) => setRange(v as ReportRange)}
          />
        }
      />

      {/* KPI cards */}
      <Row gutter={[16, 16]}>
        {kpis.map((k) => (
          <Col xs={12} sm={8} lg={4} key={k.label}>
            <Card variant="borderless" loading={isLoading}>
              <Statistic title={k.label} value={k.value} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Revenue trend + orders by status */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="Revenue trend" variant="borderless" loading={isLoading}>
            <Line
              height={280}
              data={d?.series ?? []}
              xField="date"
              yField="revenue"
              point={{ shapeField: "circle", sizeField: 3 }}
              style={{ stroke: "#1677ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Orders by status" variant="borderless" loading={isLoading}>
            <Pie
              height={280}
              data={statusPie}
              angleField="value"
              colorField="type"
              innerRadius={0.5}
              legend={{ color: { position: "bottom" } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Orders per day + sales by category */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Orders per day" variant="borderless" loading={isLoading}>
            <Column height={260} data={d?.series ?? []} xField="date" yField="orders" />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Sales by category" variant="borderless" loading={isLoading}>
            <Column
              height={260}
              data={d?.salesByCategory ?? []}
              xField="category"
              yField="revenue"
              style={{ fill: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Top products + top customers */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Top products" variant="borderless" loading={isLoading}>
            <Table
              rowKey="name"
              size="small"
              pagination={false}
              columns={topProductCols}
              dataSource={d?.topProducts ?? []}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Top customers" variant="borderless" loading={isLoading}>
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              columns={topCustomerCols}
              dataSource={d?.topCustomers ?? []}
            />
          </Card>
        </Col>
      </Row>

      {/* Payment methods + low stock */}
      <Row gutter={[16, 16]} style={{ marginTop: 16, marginBottom: 8 }}>
        <Col xs={24} lg={12}>
          <Card title="Payment methods" variant="borderless" loading={isLoading}>
            <Table
              rowKey="method"
              size="small"
              pagination={false}
              columns={paymentCols}
              dataSource={d?.paymentMethods ?? []}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Low stock alert" variant="borderless" loading={isLoading}>
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              columns={lowStockCols}
              dataSource={d?.lowStock ?? []}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}
