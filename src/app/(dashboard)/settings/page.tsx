"use client";

import { App, Button, Form, Input, Segmented, Switch, Tabs, Tag } from "antd";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/ui/PageHeader";
import { SettingRow } from "@/features/settings/components/SettingRow";
import { SettingsTabPanel } from "@/features/settings/components/SettingsTabPanel";
import { useUIStore } from "@/store/ui-store";
import { usePermissions } from "@/lib/rbac/usePermissions";
import {
  useCapabilitiesQuery,
  useUpdateCapabilities,
} from "@/features/capabilities/hooks/useCapabilities";
import type { FeatureKey } from "@/features/capabilities/types";

const CAPABILITY_ROWS: { key: FeatureKey; label: string; help: string }[] = [
  { key: "productVariants", label: "Product variants", help: "Dependent option tree (Color → Size …)" },
  { key: "tieredPricing", label: "Tiered / volume pricing", help: "Quantity price breaks" },
  { key: "customerGroups", label: "Customer groups", help: "Retail / wholesale / VIP pricing" },
  { key: "multiPriceList", label: "Multiple price lists", help: "Per group / currency / season" },
  { key: "multiCurrency", label: "Multi-currency", help: "Sell in more than one currency" },
  { key: "productAttributes", label: "Custom product attributes", help: "Arbitrary key/value fields" },
];

function CapabilitiesTab() {
  const { data: caps } = useCapabilitiesQuery();
  const update = useUpdateCapabilities();

  return (
    <SettingsTabPanel lead="Vendor-only switches. Turn product & pricing capabilities on per client; clients never see this tab.">
      <div className="app-settings-rows">
        {CAPABILITY_ROWS.map((row) => (
          <SettingRow key={row.key} title={row.label} description={row.help}>
            <Switch
              checked={!!caps?.[row.key]}
              loading={update.isPending}
              onChange={(checked) => update.mutate({ [row.key]: checked })}
            />
          </SettingRow>
        ))}
      </div>
    </SettingsTabPanel>
  );
}

function ProfileTab() {
  const t = useTranslations("settings");
  const { user } = usePermissions();
  const { message } = App.useApp();

  return (
    <SettingsTabPanel
      lead={t("profileLead")}
      footer={
        <Button type="primary" form="settings-profile-form" htmlType="submit">
          {t("saveProfile")}
        </Button>
      }
    >
      <Form
        id="settings-profile-form"
        layout="vertical"
        requiredMark={false}
        className="app-settings-rows"
        initialValues={{
          fullName: user.name,
          role: user.role,
          email: "aung@example.com",
        }}
        onFinish={() => message.success("Profile saved (mock).")}
      >
        <SettingRow title={t("fullName")} description={t("fullNameHint")}>
          <Form.Item name="fullName" noStyle>
            <Input />
          </Form.Item>
        </SettingRow>
        <SettingRow title={t("role")} description={t("roleHint")}>
          <Form.Item name="role" noStyle>
            <Input disabled />
          </Form.Item>
        </SettingRow>
        <SettingRow title={t("email")} description={t("emailHint")}>
          <Form.Item name="email" noStyle>
            <Input />
          </Form.Item>
        </SettingRow>
      </Form>
    </SettingsTabPanel>
  );
}

function PreferencesTab() {
  const t = useTranslations("settings");

  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const locale = useUIStore((s) => s.locale);
  const setLocale = useUIStore((s) => s.setLocale);
  const navLayout = useUIStore((s) => s.navLayout);
  const setNavLayout = useUIStore((s) => s.setNavLayout);

  return (
    <SettingsTabPanel lead={t("preferencesLead")}>
      <div className="app-settings-rows">
        <SettingRow
          title={t("navigationLayout")}
          description={t("navigationLayoutHint")}
        >
          <Segmented
            block
            className="app-settings-segmented"
            value={navLayout}
            onChange={(v) => setNavLayout(v as "sidebar" | "menubar")}
            options={[
              { label: t("navigationSidebar"), value: "sidebar" },
              { label: t("navigationMenubar"), value: "menubar" },
            ]}
          />
        </SettingRow>
        <SettingRow title={t("theme")} description={t("themeHint")}>
          <Segmented
            block
            className="app-settings-segmented"
            value={theme}
            onChange={(v) => setTheme(v as "light" | "dark")}
            options={[
              { label: t("themeLight"), value: "light" },
              { label: t("themeDark"), value: "dark" },
            ]}
          />
        </SettingRow>
        <SettingRow title={t("language")} description={t("languageHint")}>
          <Segmented
            block
            className="app-settings-segmented"
            value={locale}
            onChange={(v) => setLocale(v as "en" | "my")}
            options={[
              { label: "English", value: "en" },
              { label: "မြန်မာ", value: "my" },
            ]}
          />
        </SettingRow>
      </div>
    </SettingsTabPanel>
  );
}

function SecurityTab() {
  const t = useTranslations("settings");
  const { message } = App.useApp();

  return (
    <SettingsTabPanel
      lead={t("securityLead")}
      footer={
        <Button type="primary" form="settings-security-form" htmlType="submit">
          {t("updatePassword")}
        </Button>
      }
    >
      <Form
        id="settings-security-form"
        layout="vertical"
        requiredMark={false}
        className="app-settings-rows"
        onFinish={() => message.success("Password updated (mock).")}
      >
        <SettingRow
          title={t("twoFactor")}
          description={t("twoFactorHint")}
        >
          <Tag color="success">{t("twoFactorEnabled")}</Tag>
        </SettingRow>
        <SettingRow title={t("currentPassword")}>
          <Form.Item name="current" noStyle>
            <Input.Password />
          </Form.Item>
        </SettingRow>
        <SettingRow title={t("newPassword")} description={t("newPasswordHint")}>
          <Form.Item name="next" noStyle>
            <Input.Password />
          </Form.Item>
        </SettingRow>
      </Form>
    </SettingsTabPanel>
  );
}

export default function SettingsPage() {
  const t = useTranslations();
  const { can } = usePermissions();

  const items = [
    { key: "profile", label: t("settings.tabProfile"), children: <ProfileTab /> },
    {
      key: "preferences",
      label: t("settings.tabPreferences"),
      children: <PreferencesTab />,
    },
    { key: "security", label: t("settings.tabSecurity"), children: <SecurityTab /> },
  ];

  if (can("capabilities:manage")) {
    items.push({ key: "capabilities", label: "Capabilities", children: <CapabilitiesTab /> });
  }

  return (
    <>
      <PageHeader title={t("nav.settings")} subtitle={t("settings.subtitle")} />
      <Tabs items={items} />
    </>
  );
}
