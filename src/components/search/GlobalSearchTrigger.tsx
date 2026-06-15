"use client";

import { Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { SearchInput } from "@/components/ui/SearchInput";
import { useIsMac } from "@/hooks/useIsMac";
import { useUIStore } from "@/store/ui-store";

/** Topbar search field — opens the command palette (⌘K / Ctrl+K). */
export function GlobalSearchTrigger({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("common");
  const isMac = useIsMac();
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen);

  const open = () => setOpen(true);
  const shortcutLabel = isMac ? "⌘K" : "Ctrl+K";

  if (compact) {
    return (
      <Button
        type="text"
        className="app-topbar-icon-btn"
        icon={<SearchOutlined />}
        onClick={open}
        aria-label={t("globalSearch")}
        aria-haspopup="dialog"
      />
    );
  }

  return (
    <SearchInput
      wide
      readOnly
      placeholder={t("globalSearch")}
      onClick={open}
      onFocus={(e) => {
        e.target.blur();
        open();
      }}
      suffix={
        <kbd className="app-global-search-kbd" aria-hidden>
          {shortcutLabel}
        </kbd>
      }
      style={{ maxWidth: "100%", cursor: "pointer" }}
      aria-label={t("globalSearch")}
      aria-haspopup="dialog"
    />
  );
}
