"use client";

import { App } from "antd";
import { LocaleHtmlLang } from "@/components/i18n/LocaleHtmlLang";
import { QueryProvider } from "./QueryProvider";
import { IntlProvider } from "./IntlProvider";
import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "./AuthProvider";
import { CapabilitiesProvider } from "./CapabilitiesProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <CapabilitiesProvider>
          <IntlProvider>
            <LocaleHtmlLang />
            <ThemeProvider>
              <App>{children}</App>
            </ThemeProvider>
          </IntlProvider>
        </CapabilitiesProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
