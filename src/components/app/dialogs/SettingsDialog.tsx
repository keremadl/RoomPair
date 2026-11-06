"use client";
import { RotateCcw } from "lucide-react";
import { Button, Dialog, Text } from "@/design-system";
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
    <Dialog title={t("Demo data")} onClose={onClose}>
      <Text tone="muted" className={d.spaced}>
        {t(
          "Reset brings back the example likes, chats and answers. It only clears RoomPair data in this browser.",
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
