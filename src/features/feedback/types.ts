export interface FeedbackItem {
  id: string;
  customerName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface FeedbackData {
  summary: {
    count: number;
    average: number;
    distribution: Record<number, number>;
  };
  items: FeedbackItem[];
}
