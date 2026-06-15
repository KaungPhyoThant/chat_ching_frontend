"use client";

import { Tag } from "antd";
import { useTranslations } from "next-intl";

interface StatusTagProps {
  /** Namespaced i18n key, e.g. "status.active" */
  labelKey: string;
  color: string;
}

export function StatusTag({ labelKey, color }: StatusTagProps) {
  const t = useTranslations();
  return <Tag color={color}>{t(labelKey)}</Tag>;
}
