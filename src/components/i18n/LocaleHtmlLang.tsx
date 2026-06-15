"use client";

import { useEffect } from "react";
import { useUIStore } from "@/store/ui-store";

/** Keeps `<html lang>` in sync with the active UI locale. */
export function LocaleHtmlLang() {
  const locale = useUIStore((s) => s.locale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
