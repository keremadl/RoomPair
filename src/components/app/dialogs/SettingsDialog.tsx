"use client";
import { RotateCcw } from "lucide-react";
import { Button, Dialog, Select, Text } from "@/design-system";
import { useI18n } from "@/lib/i18n";
import d from "./dialogs.module.css";

/** App settings: interface language and the demo data reset. */
export function SettingsDialog({
  onClose,
  onReset,
}: {
  onClose: () => void;
  onReset: () => void;
}) {
  const { t, locale, setLocale, locales, isLoading, error } = useI18n();
  return (
    <Dialog title={t("Settings")} onClose={onClose}>
      <Select
        label={t("settings.language")}
        value={locale}
        disabled={isLoading}
        onChange={(e) => setLocale(e.target.value)}
        options={locales.map((l) => ({ value: l.code, label: l.nativeName }))}
        error={error ?? undefined}
      />
      <Text tone="muted" size="sm" className={d.spaced}>
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
