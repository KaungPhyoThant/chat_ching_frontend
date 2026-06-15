export interface Customer {
  id: string;
  telegramId: string;
  username?: string;
  fullName: string;
  phone?: string;
  address?: string;
  languageCode: string;
  isBlocked: boolean;
  orderCount: number;
  totalSpent: number;
  createdAt: string;
}
