import type { PaperSize, VoucherLayout, VoucherSettings } from "./types";

/** On-screen preview width (px) + human label for each paper size. */
export const PAPER_SIZES: Record<
  PaperSize,
  { label: string; previewWidth: number }
> = {
  A4: { label: "A4 (210 × 297 mm)", previewWidth: 480 },
  A5: { label: "A5 (148 × 210 mm)", previewWidth: 360 },
  RECEIPT_80: { label: "Receipt 80 mm", previewWidth: 280 },
  RECEIPT_58: { label: "Receipt 58 mm", previewWidth: 200 },
};

export const VOUCHER_LAYOUTS: { value: VoucherLayout; label: string }[] = [
  { value: "classic", label: "Classic" },
  { value: "modern", label: "Modern" },
  { value: "compact", label: "Compact" },
];

export const PAPER_SIZE_OPTIONS = (
  Object.keys(PAPER_SIZES) as PaperSize[]
).map((value) => ({ value, label: PAPER_SIZES[value].label }));

export const DEFAULT_VOUCHER_SETTINGS: VoucherSettings = {
  paperSize: "A5",
  layout: "classic",
  accentColor: "#1677ff",
  title: "INVOICE",

  showLogo: true,
  showCompanyName: true,
  showPhones: true,
  showEmail: false,
  showAddress: true,
  showWebsite: false,

  showInvoiceNo: true,
  showDate: true,
  showCustomer: true,
  showItemTable: true,
  showSubtotal: true,
  showDiscount: true,
  showDeliveryFee: true,
  showGrandTotal: true,
  showPaymentMethod: true,

  showFooterNote: true,
  footerNote: "Thank you for your order!",
};
