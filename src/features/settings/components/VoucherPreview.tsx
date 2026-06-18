"use client";

import type { CSSProperties } from "react";
import { formatCurrency } from "@/lib/format";
import { PAPER_SIZES } from "../voucher-config";
import type { CompanyInfo, VoucherSettings } from "../types";

/** Static sample order used to render the live preview. */
const SAMPLE = {
  invoiceNo: "INV-2026-0042",
  date: "18 Jun 2026",
  customer: { name: "Daw Hla Hla", phone: "09 700 000 000", address: "Hlaing Tsp, Yangon" },
  paymentMethod: "KBZPay",
  items: [
    { name: "Wireless Earbuds", qty: 1, price: 45000 },
    { name: "Phone Case", qty: 2, price: 8000 },
    { name: "USB-C Cable", qty: 1, price: 6000 },
  ],
  discount: 5000,
  deliveryFee: 3000,
};

export function VoucherPreview({
  settings: s,
  company,
}: {
  settings: VoucherSettings;
  company: CompanyInfo;
}) {
  const width = PAPER_SIZES[s.paperSize].previewWidth;
  const compact = s.layout === "compact" || s.paperSize.startsWith("RECEIPT");
  const fs = compact ? 11 : 13;
  const accent = s.accentColor;

  const subtotal = SAMPLE.items.reduce((sum, it) => sum + it.qty * it.price, 0);
  const grandTotal =
    subtotal -
    (s.showDiscount ? SAMPLE.discount : 0) +
    (s.showDeliveryFee ? SAMPLE.deliveryFee : 0);

  const paper: CSSProperties = {
    width,
    maxWidth: "100%",
    margin: "0 auto",
    background: "#fff",
    color: "#1f1f1f",
    fontSize: fs,
    lineHeight: 1.45,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
    overflow: "hidden",
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  };
  const pad = compact ? 14 : 22;

  const contactLines = [
    s.showAddress && company.address,
    s.showPhones && company.phones.filter(Boolean).length
      ? company.phones.filter(Boolean).join(" · ")
      : null,
    s.showEmail && company.email,
    s.showWebsite && company.website,
  ].filter(Boolean) as string[];

  const logo = s.showLogo ? (
    <div
      style={{
        width: compact ? 34 : 44,
        height: compact ? 34 : 44,
        borderRadius: 8,
        background: accent,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: compact ? 16 : 20,
        flexShrink: 0,
      }}
    >
      {(company.name || "?").charAt(0).toUpperCase()}
    </div>
  ) : null;

  /* ---------------- header variants ---------------- */
  let header: React.ReactNode = null;

  if (s.layout === "modern") {
    header = (
      <div>
        <div style={{ height: 6, background: accent }} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
            padding: pad,
            paddingBottom: 10,
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {logo}
            <div>
              {s.showCompanyName && (
                <div style={{ fontWeight: 700, fontSize: fs + 4 }}>{company.name}</div>
              )}
              {contactLines.map((line) => (
                <div key={line} style={{ color: "#6b7280", fontSize: fs - 1 }}>
                  {line}
                </div>
              ))}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 800, fontSize: fs + 6, color: accent, letterSpacing: 1 }}>
              {s.title}
            </div>
            {s.showInvoiceNo && <div style={{ color: "#6b7280" }}>{SAMPLE.invoiceNo}</div>}
            {s.showDate && <div style={{ color: "#6b7280" }}>{SAMPLE.date}</div>}
          </div>
        </div>
      </div>
    );
  } else {
    // classic + compact: centered header
    header = (
      <div style={{ textAlign: "center", padding: pad, paddingBottom: 10 }}>
        {logo && <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>{logo}</div>}
        {s.showCompanyName && (
          <div style={{ fontWeight: 700, fontSize: fs + 5 }}>{company.name}</div>
        )}
        {contactLines.map((line) => (
          <div key={line} style={{ color: "#6b7280", fontSize: fs - 1 }}>
            {line}
          </div>
        ))}
        <div
          style={{
            fontWeight: 800,
            fontSize: fs + 5,
            letterSpacing: 2,
            color: accent,
            marginTop: 10,
            paddingTop: 10,
            borderTop: `2px solid ${accent}`,
          }}
        >
          {s.title}
        </div>
        {(s.showInvoiceNo || s.showDate) && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 16,
              color: "#6b7280",
              fontSize: fs - 1,
              marginTop: 4,
            }}
          >
            {s.showInvoiceNo && <span>{SAMPLE.invoiceNo}</span>}
            {s.showDate && <span>{SAMPLE.date}</span>}
          </div>
        )}
      </div>
    );
  }

  const totalRow = (label: string, value: number, opts?: { strong?: boolean; sign?: string }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "3px 0",
        fontWeight: opts?.strong ? 700 : 400,
        fontSize: opts?.strong ? fs + 2 : fs,
        color: opts?.strong ? accent : "#374151",
        borderTop: opts?.strong ? "1px dashed #d1d5db" : undefined,
        marginTop: opts?.strong ? 4 : 0,
        paddingTop: opts?.strong ? 8 : 3,
      }}
    >
      <span>{label}</span>
      <span>
        {opts?.sign ?? ""}
        {formatCurrency(value)}
      </span>
    </div>
  );

  return (
    <div style={paper}>
      {header}

      <div style={{ padding: `0 ${pad}px ${pad}px` }}>
        {s.showCustomer && (
          <div
            style={{
              background: "#f9fafb",
              borderRadius: 6,
              padding: "8px 10px",
              marginBottom: 12,
            }}
          >
            <div style={{ color: "#6b7280", fontSize: fs - 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Bill to
            </div>
            <div style={{ fontWeight: 600 }}>{SAMPLE.customer.name}</div>
            <div style={{ color: "#6b7280", fontSize: fs - 1 }}>{SAMPLE.customer.phone}</div>
            <div style={{ color: "#6b7280", fontSize: fs - 1 }}>{SAMPLE.customer.address}</div>
          </div>
        )}

        {s.showItemTable && (
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 10 }}>
            <thead>
              <tr style={{ color: "#6b7280", fontSize: fs - 2, textAlign: "left" }}>
                <th style={{ padding: "4px 0" }}>Item</th>
                <th style={{ padding: "4px 0", textAlign: "center", width: 32 }}>Qty</th>
                <th style={{ padding: "4px 0", textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE.items.map((it) => (
                <tr key={it.name} style={{ borderTop: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "5px 0" }}>{it.name}</td>
                  <td style={{ padding: "5px 0", textAlign: "center" }}>{it.qty}</td>
                  <td style={{ padding: "5px 0", textAlign: "right" }}>
                    {formatCurrency(it.qty * it.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div>
          {s.showSubtotal && totalRow("Subtotal", subtotal)}
          {s.showDiscount && totalRow("Discount", SAMPLE.discount, { sign: "−" })}
          {s.showDeliveryFee && totalRow("Delivery", SAMPLE.deliveryFee, { sign: "+" })}
          {s.showGrandTotal && totalRow("Total", grandTotal, { strong: true })}
        </div>

        {s.showPaymentMethod && (
          <div style={{ marginTop: 10, color: "#374151" }}>
            <span style={{ color: "#6b7280" }}>Payment: </span>
            {SAMPLE.paymentMethod}
          </div>
        )}

        {s.showFooterNote && s.footerNote && (
          <div
            style={{
              marginTop: 14,
              paddingTop: 10,
              borderTop: "1px dashed #d1d5db",
              textAlign: "center",
              color: "#6b7280",
              fontSize: fs - 1,
            }}
          >
            {s.footerNote}
          </div>
        )}
      </div>
    </div>
  );
}
