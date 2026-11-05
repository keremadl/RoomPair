"use client";
import { RotateCcw } from "lucide-react";
import { Button, Dialog, Heading, Text } from "@/design-system";
import { useI18n } from "@/lib/i18n";
import d from "./dialogs.module.css";

export function SettingsDialog({
  onClose,
  onReset,
}: {
  onClose: () => void;
  onReset: () => void;
}) {
  const { t } = useI18n();
  return (
    <Dialog title={t("Demo settings & data")} onClose={onClose}>
      <Heading level={3}>{t("A fresh page, anytime.")}</Heading>
      <Text tone="muted" className={d.spaced}>
        {t(
          "Reset the demo to restore sample conversations, likes, and preferences. This only clears RoomPair data in this browser.",
        )}
      </Text>
      <div className={d.footer}>
        <Button
          variant="danger"
          leadingIcon={<RotateCcw />}
          onClick={onReset}
          fullWidth
        >
          {t("Reset demo data")}
        </Button>
      </div>
    </Dialog>
  );
}
