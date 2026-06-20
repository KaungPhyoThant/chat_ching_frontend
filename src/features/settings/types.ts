/** Company / store profile shown to customers and used on documents. */
export interface CompanyInfo {
  name: string;
  phones: string[];
  email: string;
  address: string;
  website: string;
  /** Telegram chat id that receives order + low-stock alerts. */
  ownerTelegramChatId: string;
}

/** Telegram bot connection settings. */
export interface BotSettings {
  token: string;
  webhookSecret: string;
  publicUrl: string;
}

export interface BotStatus {
  configured: boolean;
  username?: string;
  webhookUrl?: string;
  pendingUpdates?: number;
  error?: string;
}

export interface BotSettingsResponse extends BotSettings {
  status: BotStatus;
}

/** Loyalty point program configuration. */
export interface LoyaltySettings {
  enabled: boolean;
  earnPoints: number;
  earnPerAmount: number;
  redeemValuePerPoint: number;
  minRedeemPoints: number;
}

/** Printable paper / receipt sizes for invoices & vouchers. */
export type PaperSize = "A4" | "A5" | "RECEIPT_80" | "RECEIPT_58";

/** Visual layout templates for the voucher. */
export type VoucherLayout = "classic" | "modern" | "compact";

/**
 * Fully dynamic invoice/voucher configuration. Every visible block is a toggle
 * so a client can shape the printout without code changes.
 */
export interface VoucherSettings {
  paperSize: PaperSize;
  layout: VoucherLayout;
  accentColor: string;
  title: string;

  // ---- company header blocks ----
  showLogo: boolean;
  showCompanyName: boolean;
  showPhones: boolean;
  showEmail: boolean;
  showAddress: boolean;
  showWebsite: boolean;

  // ---- voucher content blocks ----
  showInvoiceNo: boolean;
  showDate: boolean;
  showCustomer: boolean;
  showItemTable: boolean;
  showSubtotal: boolean;
  showDiscount: boolean;
  showDeliveryFee: boolean;
  showGrandTotal: boolean;
  showPaymentMethod: boolean;

  // ---- footer ----
  showFooterNote: boolean;
  footerNote: string;
}
