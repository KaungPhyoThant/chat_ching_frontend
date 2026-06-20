"use client";

import { Card, Col, Progress, Rate, Row, Statistic, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContentCard } from "@/components/ui/ContentCard";
import { formatDate } from "@/lib/format";
import { useFeedback } from "@/features/feedback/hooks/useFeedback";
import type { FeedbackItem } from "@/features/feedback/types";

export default function FeedbackPage() {
  const { data, isLoading } = useFeedback();
  const summary = data?.summary;
  const total = summary?.count ?? 0;

  const columns: ColumnsType<FeedbackItem> = [
    { title: "Customer", dataIndex: "customerName", render: (v: string) => <strong>{v}</strong> },
    {
      title: "Rating",
      dataIndex: "rating",
      width: 160,
      render: (v: number) => <Rate disabled value={v} />,
    },
    {
      title: "Comment",
      dataIndex: "comment",
      render: (v?: string) =>
        v ? v : <span style={{ color: "var(--app-text-muted)" }}>—</span>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      width: 130,
      render: (v: string) => formatDate(v),
    },
  ];

  return (
    <>
      <PageHeader title="Feedback" subtitle="Customer ratings & comments from the bot" />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card variant="borderless" loading={isLoading}>
            <Statistic
              title="Average rating"
              value={summary?.average ?? 0}
              suffix="/ 5"
              precision={1}
            />
            <Rate disabled allowHalf value={summary?.average ?? 0} style={{ marginTop: 8 }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless" loading={isLoading}>
            <Statistic title="Total feedback" value={total} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless" loading={isLoading} title="Distribution">
            {[5, 4, 3, 2, 1].map((star) => {
              const n = summary?.distribution?.[star] ?? 0;
              return (
                <div key={star} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 28 }}>{star}★</span>
                  <Progress
                    percent={total ? Math.round((n / total) * 100) : 0}
                    size="small"
                    showInfo={false}
                    style={{ flex: 1 }}
                  />
                  <span style={{ width: 24, textAlign: "right" }}>{n}</span>
                </div>
              );
            })}
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        <ContentCard>
          <Table<FeedbackItem>
            rowKey="id"
            loading={isLoading}
            columns={columns}
            dataSource={data?.items ?? []}
          />
        </ContentCard>
      </div>
    </>
  );
}
