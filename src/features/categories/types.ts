export interface Category {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  childrenCount: number;
}
