"use client";

import { useState } from "react";
import {
  Alert,
  App,
  Button,
  Col,
  ColorPicker,
  Form,
  Input,
  InputNumber,
  Row,
  Segmented,
  Select,
  Skeleton,
  Switch,
  Tabs,
  Tag,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/ui/PageHeader";
import { SettingRow } from "@/features/settings/components/SettingRow";
import { SettingsTabPanel } from "@/features/settings/components/SettingsTabPanel";
import { VoucherPreview } from "@/features/settings/components/VoucherPreview";
import { useUIStore } from "@/store/ui-store";
import { usePermissions } from "@/lib/rbac/usePermissions";
import {
  useCapabilitiesQuery,
  useUpdateCapabilities,
} from "@/features/capabilities/hooks/useCapabilities";
import {
  useCompanyInfo,
  useUpdateCompanyInfo,
} from "@/features/settings/hooks/useCompanyInfo";
import {
  useVoucherSettings,
  useUpdateVoucherSettings,
} from "@/features/settings/hooks/useVoucherSettings";
import {
  useLoyaltySettings,
  useUpdateLoyaltySettings,
} from "@/features/settings/hooks/useLoyaltySettings";
import {
  PAPER_SIZE_OPTIONS,
  VOUCHER_LAYOUTS,
} from "@/features/settings/voucher-config";
import type { VoucherSettings } from "@/features/settings/types";
import type { FeatureKey } from "@/features/capabilities/types";

type VoucherToggleKey = {
  [K in keyof VoucherSettings]: VoucherSettings[K] extends boolean ? K : never;
}[keyof VoucherSettings];

const COMPANY_BLOCKS: { key: VoucherToggleKey; labelKey: string }[] = [
  { key: "showLogo", labelKey: "vLogo" },
  { key: "showCompanyName", labelKey: "vCompanyName" },
  { key: "showPhones", labelKey: "vPhones" },
  { key: "showEmail", labelKey: "vEmail" },
  { key: "showAddress", labelKey: "vAddress" },
  { key: "showWebsite", labelKey: "vWebsite" },
];

const CONTENT_BLOCKS: { key: VoucherToggleKey; labelKey: string }[] = [
  { key: "showInvoiceNo", labelKey: "vInvoiceNo" },
  { key: "showDate", labelKey: "vDate" },
  { key: "showCustomer", labelKey: "vCustomer" },
  { key: "showItemTable", labelKey: "vItemTable" },
  { key: "showSubtotal", labelKey: "vSubtotal" },
  { key: "showDiscount", labelKey: "vDiscount" },
  { key: "showDeliveryFee", labelKey: "vDeliveryFee" },
  { key: "showGrandTotal", labelKey: "vGrandTotal" },
  { key: "showPaymentMethod", labelKey: "vPaymentMethod" },
];

const CAPABILITY_ROWS: { key: FeatureKey; label: string; help: string }[] = [
  { key: "productVariants", label: "Product variants", help: "Dependent option tree (Color → Size …)" },
  { key: "tieredPricing", label: "Tiered / volume pricing", help: "Quantity price breaks" },
  { key: "customerGroups", label: "Customer groups", help: "Retail / wholesale / VIP pricing" },
  { key: "multiPriceList", label: "Multiple price lists", help: "Per group / currency / season" },
  { key: "multiCurrency", label: "Multi-currency", help: "Sell in more than one currency" },
  { key: "productAttributes", label: "Custom product attributes", help: "Arbitrary key/value fields" },
  { key: "imageSearch", label: "Image product search", help: "Customers send a photo in the bot to find similar products (uses AI vision)" },
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

function CompanyTab() {
  const t = useTranslations("settings");
  const { message } = App.useApp();
  const { data, isLoading } = useCompanyInfo();
  const update = useUpdateCompanyInfo();

  if (isLoading || !data) {
    return (
      <SettingsTabPanel lead={t("companyLead")}>
        <Skeleton active paragraph={{ rows: 5 }} />
      </SettingsTabPanel>
    );
  }

  return (
    <SettingsTabPanel
      lead={t("companyLead")}
      footer={
        <Button
          type="primary"
          form="settings-company-form"
          htmlType="submit"
          loading={update.isPending}
        >
          {t("saveCompany")}
        </Button>
      }
    >
      <Form
        id="settings-company-form"
        layout="vertical"
        requiredMark={false}
        className="app-settings-rows"
        initialValues={data}
        onFinish={async (values) => {
          try {
            await update.mutateAsync(values);
            message.success(t("companySaved"));
          } catch {
            message.error(t("companySaveFailed"));
          }
        }}
      >
        <SettingRow title={t("companyName")} description={t("companyNameHint")}>
          <Form.Item name="name" noStyle rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </SettingRow>
        <SettingRow title={t("companyPhone")} description={t("companyPhoneHint")}>
          <Form.List name="phones">
            {(fields, { add, remove }) => (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <Form.Item
                      {...restField}
                      name={name}
                      validateTrigger={["onChange", "onBlur"]}
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: "Please input a phone number or delete this field.",
                        },
                      ]}
                      noStyle
                    >
                      <Input placeholder="Phone number" style={{ flex: 1 }} />
                    </Form.Item>
                    {fields.length > 1 && (
                      <Button
                        type="text"
                        danger
                        onClick={() => remove(name)}
                        icon={<DeleteOutlined />}
                      />
                    )}
                  </div>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  style={{ width: "100%" }}
                  icon={<PlusOutlined />}
                >
                  Add phone number
                </Button>
              </div>
            )}
          </Form.List>
        </SettingRow>
        <SettingRow title={t("companyEmail")} description={t("companyEmailHint")}>
          <Form.Item name="email" noStyle>
            <Input type="email" />
          </Form.Item>
        </SettingRow>
        <SettingRow title={t("companyAddress")} description={t("companyAddressHint")}>
          <Form.Item name="address" noStyle>
            <Input.TextArea rows={2} />
          </Form.Item>
        </SettingRow>
        <SettingRow title={t("companyWebsite")} description={t("companyWebsiteHint")}>
          <Form.Item name="website" noStyle>
            <Input />
          </Form.Item>
        </SettingRow>
        <SettingRow
          title={t("ownerChatId")}
          description={t("ownerChatIdHint")}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
            <Form.Item name="ownerTelegramChatId" noStyle>
              <Input placeholder="e.g. 123456789" />
            </Form.Item>
            <Alert
              type="info"
              showIcon
              title={t("ownerChatIdSetupTitle")}
              description={
                <ol style={{ margin: 0, paddingInlineStart: 18 }}>
                  <li>{t("ownerChatIdStep1")}</li>
                  <li>{t("ownerChatIdStep2")}</li>
                  <li>{t("ownerChatIdStep3")}</li>
                </ol>
              }
            />
          </div>
        </SettingRow>
      </Form>
    </SettingsTabPanel>
  );
}

function VoucherTab() {
  const t = useTranslations("settings");
  const { message } = App.useApp();
  const { data, isLoading } = useVoucherSettings();
  const { data: company } = useCompanyInfo();
  const update = useUpdateVoucherSettings();
  const [draft, setDraft] = useState<VoucherSettings | null>(null);

  // Seed the editable draft once, when server data first arrives.
  // (Render-phase init — React-recommended over a setState-in-effect.)
  if (data && draft === null) setDraft(data);

  if (isLoading || !draft || !company) {
    return (
      <SettingsTabPanel lead={t("voucherLead")}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </SettingsTabPanel>
    );
  }

  const set = (patch: Partial<VoucherSettings>) =>
    setDraft((d) => (d ? { ...d, ...patch } : d));

  const save = async () => {
    try {
      await update.mutateAsync(draft);
      message.success(t("voucherSaved"));
    } catch {
      message.error(t("voucherSaveFailed"));
    }
  };

  return (
    <SettingsTabPanel
      lead={t("voucherLead")}
      footer={
        <Button type="primary" loading={update.isPending} onClick={save}>
          {t("saveVoucher")}
        </Button>
      }
    >
      <Row gutter={[28, 24]}>
        {/* ---- controls ---- */}
        <Col xs={24} lg={13}>
          <div className="app-settings-rows">
            <SettingRow title={t("vPaperSize")} description={t("vPaperSizeHint")}>
              <Select
                style={{ width: "100%" }}
                value={draft.paperSize}
                onChange={(v) => set({ paperSize: v })}
                options={PAPER_SIZE_OPTIONS}
              />
            </SettingRow>
            <SettingRow title={t("vLayout")} description={t("vLayoutHint")}>
              <Segmented
                block
                className="app-settings-segmented"
                value={draft.layout}
                onChange={(v) => set({ layout: v as VoucherSettings["layout"] })}
                options={VOUCHER_LAYOUTS}
              />
            </SettingRow>
            <SettingRow title={t("vTitle")} description={t("vTitleHint")}>
              <Input
                value={draft.title}
                onChange={(e) => set({ title: e.target.value })}
              />
            </SettingRow>
            <SettingRow title={t("vAccent")} description={t("vAccentHint")}>
              <ColorPicker
                value={draft.accentColor}
                onChange={(c) => set({ accentColor: c.toHexString() })}
                showText
              />
            </SettingRow>

            <div className="app-settings-lead" style={{ marginTop: 12, fontWeight: 600 }}>
              {t("vCompanyBlocks")}
            </div>
            {COMPANY_BLOCKS.map((b) => (
              <SettingRow key={b.key} title={t(b.labelKey)}>
                <Switch
                  checked={draft[b.key]}
                  onChange={(v) => set({ [b.key]: v })}
                />
              </SettingRow>
            ))}

            <div className="app-settings-lead" style={{ marginTop: 12, fontWeight: 600 }}>
              {t("vContentBlocks")}
            </div>
            {CONTENT_BLOCKS.map((b) => (
              <SettingRow key={b.key} title={t(b.labelKey)}>
                <Switch
                  checked={draft[b.key]}
                  onChange={(v) => set({ [b.key]: v })}
                />
              </SettingRow>
            ))}

            <SettingRow title={t("vFooterNote")} description={t("vFooterNoteHint")}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                <Switch
                  checked={draft.showFooterNote}
                  onChange={(v) => set({ showFooterNote: v })}
                />
                <Input
                  value={draft.footerNote}
                  disabled={!draft.showFooterNote}
                  onChange={(e) => set({ footerNote: e.target.value })}
                  placeholder={t("vFooterNotePlaceholder")}
                />
              </div>
            </SettingRow>
          </div>
        </Col>

        {/* ---- live preview ---- */}
        <Col xs={24} lg={11}>
          <div style={{ position: "sticky", top: 16 }}>
            <div className="app-settings-lead" style={{ marginBottom: 10 }}>
              {t("vPreview")}
            </div>
            <VoucherPreview settings={draft} company={company} />
          </div>
        </Col>
      </Row>
    </SettingsTabPanel>
  );
}

function LoyaltyTab() {
  const t = useTranslations("settings");
  const { message } = App.useApp();
  const { data, isLoading } = useLoyaltySettings();
  const update = useUpdateLoyaltySettings();

  if (isLoading || !data) {
    return (
      <SettingsTabPanel lead={t("loyaltyLead")}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </SettingsTabPanel>
    );
  }

  return (
    <SettingsTabPanel
      lead={t("loyaltyLead")}
      footer={
        <Button
          type="primary"
          form="settings-loyalty-form"
          htmlType="submit"
          loading={update.isPending}
        >
          {t("saveLoyalty")}
        </Button>
      }
    >
      <Form
        id="settings-loyalty-form"
        layout="vertical"
        requiredMark={false}
        className="app-settings-rows"
        initialValues={data}
        onFinish={async (values) => {
          try {
            await update.mutateAsync(values);
            message.success(t("loyaltySaved"));
          } catch {
            message.error(t("loyaltySaveFailed"));
          }
        }}
      >
        <SettingRow title={t("loyaltyEnabled")} description={t("loyaltyEnabledHint")}>
          <Form.Item name="enabled" noStyle valuePropName="checked">
            <Switch />
          </Form.Item>
        </SettingRow>
        <SettingRow title={t("loyaltyEarn")} description={t("loyaltyEarnHint")}>
          <Form.Item name="earnPoints" noStyle>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </SettingRow>
        <SettingRow
          title={t("loyaltyPerAmount")}
          description={t("loyaltyPerAmountHint")}
        >
          <Form.Item name="earnPerAmount" noStyle>
            <InputNumber min={1} step={500} style={{ width: "100%" }} addonBefore="Ks" />
          </Form.Item>
        </SettingRow>
        <SettingRow
          title={t("loyaltyRedeemValue")}
          description={t("loyaltyRedeemValueHint")}
        >
          <Form.Item name="redeemValuePerPoint" noStyle>
            <InputNumber min={0} step={10} style={{ width: "100%" }} />
          </Form.Item>
        </SettingRow>
        <SettingRow
          title={t("loyaltyMinRedeem")}
          description={t("loyaltyMinRedeemHint")}
        >
          <Form.Item name="minRedeemPoints" noStyle>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </SettingRow>
      </Form>
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
    { key: "company", label: t("settings.tabCompany"), children: <CompanyTab /> },
    { key: "voucher", label: t("settings.tabVoucher"), children: <VoucherTab /> },
    { key: "loyalty", label: t("settings.tabLoyalty"), children: <LoyaltyTab /> },
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
