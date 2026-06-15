"use client";

import { App } from "antd";
import { LocaleHtmlLang } from "@/components/i18n/LocaleHtmlLang";
import { MswProvider } from "./MswProvider";
import { QueryProvider } from "./QueryProvider";
import { IntlProvider } from "./IntlProvider";
import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "./AuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MswProvider>
      <QueryProvider>
        <AuthProvider>
          <IntlProvider>
            <LocaleHtmlLang />
            <ThemeProvider>
              <App>{children}</App>
            </ThemeProvider>
          </IntlProvider>
        </AuthProvider>
      </QueryProvider>
    </MswProvider>
  );
}
