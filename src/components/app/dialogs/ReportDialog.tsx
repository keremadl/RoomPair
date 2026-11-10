"use client";
import { useState } from "react";
import { Ban, Flag } from "@/design-system/icons";
import { Button, Dialog, Heading, Select, Text } from "@/design-system";
import { useI18n } from "@/lib/i18n";
import type { Profile } from "@/lib/types";
import d from "./dialogs.module.css";

const reasons = [
  "Misleading profile",
  "Inappropriate messages",
  "Suspicious listing",
  "Something else",
];

export function ReportDialog({
  profile: p,
  onClose,
  onReport,
  onBlock,
}: {
  profile: Profile;
  onClose: () => void;
  onReport: (reason: string) => void;
  onBlock: () => void;
}) {
  const { t } = useI18n();
  const [reason, setReason] = useState(reasons[0]);
  return (
    <Dialog title={t("Profile options")} onClose={onClose}>
      <Heading level={3}>
        {t("Report or block {name}", { name: p.name })}
      </Heading>
      <Text tone="muted" className={d.spaced}>
        {t(
          "Blocking hides them and removes your chat. Reports are only saved in this demo.",
        )}
      </Text>
      <Select
        className={d.spaced}
        label={t("Reason for reporting")}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        options={reasons.map((r) => ({ value: r, label: t(r) }))}
      />
      <div className={d.actions}>
        <Button
          variant="secondary"
          leadingIcon={<Flag />}
          onClick={() => onReport(reason)}
          fullWidth
        >
          {t("Save a demo report")}
        </Button>
        <Button
          variant="danger"
          leadingIcon={<Ban />}
          onClick={onBlock}
          fullWidth
        >
          {t("Block {name}", { name: p.name })}
        </Button>
      </div>
    </Dialog>
  );
}
