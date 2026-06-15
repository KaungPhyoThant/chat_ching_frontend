"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/ui/PageHeader";
import { CreateButton } from "@/components/ui/CreateButton";
import { UsersTable } from "@/features/users";

export default function UsersPage() {
  const t = useTranslations();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <PageHeader
        title={t("nav.users")}
        subtitle="Staff & access management"
        actions={
          <CreateButton onClick={() => setModalOpen(true)}>
            {t("common.addUser")}
          </CreateButton>
        }
      />
      <UsersTable modalOpen={modalOpen} onCloseModal={() => setModalOpen(false)} />
    </>
  );
}
