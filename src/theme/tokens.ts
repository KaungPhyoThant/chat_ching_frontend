import type { ThemeConfig } from "antd";
import { theme as antdTheme } from "antd";

/** Shared across light & dark. */
const sharedTokens: ThemeConfig["token"] = {
  colorPrimary: "#1677FF",
  borderRadius: 8,
  borderRadiusLG: 12,
  fontFamily:
    "var(--font-inter), var(--font-noto-myanmar), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSize: 14,
  controlHeight: 40,
  controlHeightLG: 44,
};

/** Light mode — clinical, soft gray surfaces. */
const lightTokens: ThemeConfig["token"] = {
  colorBgLayout: "#f4f6f9",
  colorBgContainer: "#ffffff",
  colorBorderSecondary: "#e8ecf1",
  colorText: "#0f172a",
  colorTextSecondary: "#64748b",
  colorFillQuaternary: "#f8fafc",
};

/** Dark mode — low glare, elevated surfaces (not pure black). */
const darkTokens: ThemeConfig["token"] = {
  colorPrimary: "#4c9aff",
  colorBgLayout: "#0f1218",
  colorBgContainer: "#181c24",
  colorBgElevated: "#1e2430",
  colorBorder: "#2a3341",
  colorBorderSecondary: "#252d3a",
  colorText: "#e8eaed",
  colorTextSecondary: "#9aa4b2",
  colorTextTertiary: "#6b7785",
  colorFillQuaternary: "#232a35",
  colorFillTertiary: "#2a3341",
};

const sharedComponents: ThemeConfig["components"] = {
  Layout: {
    headerHeight: 56,
    headerPadding: "0 20px",
  },
  Menu: {
    itemBorderRadius: 8,
    itemMarginInline: 8,
    itemHeight: 40,
    groupTitleFontSize: 11,
  },
  Card: {
    borderRadiusLG: 12,
    paddingLG: 20,
  },
  Button: {
    borderRadius: 8,
    controlHeight: 40,
  },
  Input: {
    borderRadius: 10,
    paddingBlock: 8,
    paddingInline: 12,
  },
  Select: {
    borderRadius: 10,
    controlHeight: 40,
    optionPadding: "10px 12px",
  },
};

const lightComponents: ThemeConfig["components"] = {
  Menu: {
    groupTitleColor: "#94a3b8",
  },
  Table: {
    headerBg: "transparent",
    headerColor: "#64748b",
    headerSplitColor: "transparent",
    rowHoverBg: "#f0f7ff",
    borderColor: "#eef1f5",
    cellPaddingBlock: 14,
    cellPaddingInline: 16,
    footerBg: "#fafbfc",
    footerColor: "#64748b",
  },
  Button: {
    primaryShadow: "0 2px 0 rgba(5, 145, 255, 0.1)",
  },
  Input: {
    activeShadow: "0 0 0 2px rgba(22, 119, 255, 0.12)",
  },
  Select: {
    optionSelectedBg: "#e6f4ff",
    optionActiveBg: "#f0f7ff",
  },
};

const darkComponents: ThemeConfig["components"] = {
  Menu: {
    darkItemBg: "#181c24",
    darkSubMenuItemBg: "#181c24",
    darkItemSelectedBg: "#1f2d42",
    darkItemHoverBg: "#232a35",
    darkGroupTitleColor: "#6b7785",
    itemColor: "#c5cdd8",
    itemSelectedColor: "#e8eaed",
  },
  Table: {
    headerBg: "#1e2430",
    headerColor: "#9aa4b2",
    headerSplitColor: "transparent",
    rowHoverBg: "#1f2d42",
    borderColor: "#252d3a",
    footerBg: "#1a1f28",
    footerColor: "#9aa4b2",
  },
  Button: {
    primaryShadow: "none",
  },
  Input: {
    activeShadow: "0 0 0 2px rgba(76, 154, 255, 0.2)",
    colorBgContainer: "#232a35",
  },
  Select: {
    optionSelectedBg: "#1f2d42",
    optionActiveBg: "#232a35",
    colorBgContainer: "#232a35",
  },
  Card: {
    colorBgContainer: "#181c24",
  },
};

export function getThemeConfig(mode: "light" | "dark"): ThemeConfig {
  const isDark = mode === "dark";

  return {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      ...sharedTokens,
      ...(isDark ? darkTokens : lightTokens),
    },
    components: {
      ...sharedComponents,
      ...(isDark ? darkComponents : lightComponents),
    },
  };
}

/** @deprecated Use getThemeConfig(mode) — kept for any legacy imports. */
export const baseTokens = { ...sharedTokens, ...lightTokens };
export const componentTokens = { ...sharedComponents, ...lightComponents };
