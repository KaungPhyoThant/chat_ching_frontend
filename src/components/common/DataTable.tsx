"use client";

import { Table, theme } from "antd";
import type { TableProps } from "antd";

export type DataTableProps<T extends object> = TableProps<T>;

/**
 * Polished data table for list pages — spacing, borders, and pagination
 * aligned with the EMR dashboard design system.
 */
export function DataTable<T extends object>({
  className,
  pagination,
  ...props
}: DataTableProps<T>) {
  const { token } = theme.useToken();

  const mergedPagination =
    pagination === false
      ? false
      : {
          pageSize: 10,
          hideOnSinglePage: true,
          size: "small" as const,
          showSizeChanger: false,
          showTotal: (total: number) => (
            <span className="app-table-total">{total} records</span>
          ),
          ...pagination,
        };

  return (
    <div className="app-data-table-wrap">
      <Table<T>
        className={["app-data-table", className].filter(Boolean).join(" ")}
        size="middle"
        bordered={false}
        tableLayout="auto"
        pagination={mergedPagination}
        scroll={{ x: "max-content" }}
        rowClassName={(_, index) =>
          index % 2 === 1 ? "app-data-table__row--alt" : ""
        }
        {...props}
        style={{
          background: token.colorBgContainer,
          ...props.style,
        }}
      />
    </div>
  );
}
