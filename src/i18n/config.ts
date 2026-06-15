import type { Locale } from "@/store/ui-store";
import en from "./locales/en.json";
import my from "./locales/my.json";

export const LOCALES: Locale[] = ["en", "my"];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  my: "မြ",
};

export type Messages = typeof en;

export const messages: Record<Locale, Messages> = {
  en,
  my: my as Messages,
};
