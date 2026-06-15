import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

/** Myanmar Kyat amount, e.g. 64,000 Ks. */
export function formatCurrency(amount: number): string {
  return `${new Intl.NumberFormat("en-US").format(Math.round(amount))} Ks`;
}

export function formatDate(value?: string | null): string {
  return value ? dayjs(value).format("DD MMM YYYY") : "—";
}

export function formatDateTime(value?: string | null): string {
  return value ? dayjs(value).format("DD MMM YYYY, HH:mm") : "—";
}

export function fromNow(value?: string | null): string {
  return value ? dayjs(value).fromNow() : "—";
}
