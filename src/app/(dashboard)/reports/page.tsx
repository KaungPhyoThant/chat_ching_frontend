"use client";

import dynamic from "next/dynamic";
import { Card, Col, Row, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PageHeader } from "@/components/ui/PageHeader";
import { ORDER_STATUS, type OrderStatus } from "@/config/enums";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";

const Line = dynamic(() => import("@ant-design/plots").then((m) => m.Line), { ssr: false });

interface StatusRow {
  status: string;
  count: number;
}

export default function ReportsPage() {
  const { data, isLoading } = useDashboard();

  const columns: ColumnsType<StatusRow> = [
    {
      title: "Status",
      dataIndex: "status",
      render: (s: string) => <Tag color={ORDER_STATUS[s as OrderStatus]?.color}>{s}</Tag>,
    },
    { title: "Orders", dataIndex: "count", align: "right" },
  ];

  return (
    <>
      <PageHeader title="Reports" subtitle="Sales and order analytics" />
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Revenue trend (last 14 days)" variant="borderless" loading={isLoading}>
            <Line
              height={300}
              data={data?.revenueSeries ?? []}
              xField="date"
              yField="revenue"
              point={{ shapeField: "circle", sizeField: 3 }}
              style={{ stroke: "#1677ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Orders by status" variant="borderless" loading={isLoading}>
            <Table<StatusRow>
              rowKey="status"
              size="small"
              pagination={false}
              columns={columns}
              dataSource={data?.ordersByStatus ?? []}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}
