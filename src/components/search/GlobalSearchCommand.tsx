"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Empty, Flex, Input, Modal, Typography, theme } from "antd";
import type { InputRef } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { useCommandPaletteShortcut } from "@/hooks/useCommandPaletteShortcut";
import { usePermissions } from "@/lib/rbac/usePermissions";
import {
  buildStaticSearchIndex,
  filterSearchItems,
  type GlobalSearchGroup,
  type GlobalSearchItem,
} from "@/lib/search/global-search-items";
import { useUIStore } from "@/store/ui-store";

const { Text } = Typography;

const GROUP_ORDER: GlobalSearchGroup[] = ["navigation", "actions", "products"];

function groupLabel(
  group: GlobalSearchGroup,
  t: ReturnType<typeof useTranslations<"commandPalette">>,
): string {
  switch (group) {
    case "navigation":
      return t("groups.navigation");
    case "actions":
      return t("groups.actions");
    case "products":
      return t("groups.products");
  }
}

export function GlobalSearchCommand() {
  const router = useRouter();
  const t = useTranslations("commandPalette");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const { token } = theme.useToken();
  const { can } = usePermissions();

  const open = useUIStore((s) => s.commandPaletteOpen);
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen);

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<InputRef>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useCommandPaletteShortcut();

  const staticItems = useMemo(
    () =>
      buildStaticSearchIndex({
        can,
        navLabel: (key) => tNav(key),
        actionLabels: {
          addProduct: tCommon("add"),
          createOrder: tCommon("create"),
        },
      }),
    [can, tNav, tCommon],
  );

  const allItems = useMemo(() => staticItems, [staticItems]);

  const results = useMemo(
    () => filterSearchItems(allItems, query, 14),
    [allItems, query],
  );

  const selectItem = useCallback(
    (item: GlobalSearchItem) => {
      setOpen(false);
      setQuery("");
      setActiveIndex(0);
      router.push(item.href);
    },
    [router, setOpen],
  );

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
    }
  }, [open]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-search-index="${activeIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      selectItem(results[activeIndex]);
    }
  };

  const grouped = GROUP_ORDER.map((group) => ({
    group,
    items: results.filter((item) => item.group === group),
  })).filter((g) => g.items.length > 0);

  let rowIndex = -1;

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      closable={false}
      width={560}
      destroyOnHidden
      className="app-command-palette"
      styles={{
        body: {
          padding: 0,
          overflow: "hidden",
          borderRadius: token.borderRadiusLG,
        },
      }}
      aria-label={t("title")}
    >
      <Input
        ref={inputRef}
        size="large"
        variant="borderless"
        prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
        placeholder={tCommon("globalSearch")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onInputKeyDown}
        style={{
          padding: "14px 16px",
          borderBlockEnd: `1px solid ${token.colorBorderSecondary}`,
        }}
      />

      <div
        ref={listRef}
        className="app-command-palette__results"
        style={{ maxHeight: 360, overflowY: "auto", padding: "8px 0" }}
      >
        {results.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("noResults")}
            style={{ margin: "24px 0" }}
          />
        ) : (
          grouped.map(({ group, items }) => (
            <div key={group}>
              <Text
                type="secondary"
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  padding: "8px 16px 4px",
                }}
              >
                {groupLabel(group, t)}
              </Text>
              {items.map((item) => {
                rowIndex += 1;
                const index = rowIndex;
                const isActive = index === activeIndex;

                return (
                  <button
                    key={item.id}
                    type="button"
                    data-search-index={index}
                    className="app-command-palette__item"
                    data-active={isActive || undefined}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectItem(item)}
                    style={{
                      width: "100%",
                      border: "none",
                      background: isActive ? token.colorPrimaryBg : "transparent",
                      cursor: "pointer",
                      textAlign: "start",
                      padding: "10px 16px",
                    }}
                  >
                    <Flex align="center" gap={12}>
                      {item.icon ? (
                        <span style={{ color: token.colorPrimary, fontSize: 16 }}>
                          {item.icon}
                        </span>
                      ) : null}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 500 }}>{item.title}</div>
                        {item.subtitle ? (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {item.subtitle}
                          </Text>
                        ) : null}
                      </div>
                    </Flex>
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>

      <Flex
        justify="space-between"
        align="center"
        style={{
          padding: "10px 16px",
          borderBlockStart: `1px solid ${token.colorBorderSecondary}`,
          fontSize: 12,
          color: token.colorTextTertiary,
        }}
      >
        <span>{t("hintNavigate")}</span>
        <span>{t("hintClose")}</span>
      </Flex>
    </Modal>
  );
}
