"use client";

import { NextIntlClientProvider } from "next-intl";
import { messages } from "@/i18n/config";
import { useUIStore } from "@/store/ui-store";

export function IntlProvider({ children }: { children: React.ReactNode }) {
  const locale = useUIStore((s) => s.locale);

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages[locale]}
      timeZone="Asia/Yangon"
    >
      {children}
    </NextIntlClientProvider>
  );
}
