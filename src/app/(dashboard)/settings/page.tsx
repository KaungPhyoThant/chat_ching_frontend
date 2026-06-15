"use client";

import { App, Button, Form, Input, Segmented, Tabs, Tag } from "antd";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/ui/PageHeader";
import { SettingRow } from "@/features/settings/components/SettingRow";
import { SettingsTabPanel } from "@/features/settings/components/SettingsTabPanel";
import { useUIStore } from "@/store/ui-store";
import { usePermissions } from "@/lib/rbac/usePermissions";

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

  return (
    <>
      <PageHeader title={t("nav.settings")} subtitle={t("settings.subtitle")} />
      <Tabs
        items={[
          { key: "profile", label: t("settings.tabProfile"), children: <ProfileTab /> },
          {
            key: "preferences",
            label: t("settings.tabPreferences"),
            children: <PreferencesTab />,
          },
          { key: "security", label: t("settings.tabSecurity"), children: <SecurityTab /> },
        ]}
      />
    </>
  );
}
