"use client";
import { RotateCcw } from "@/design-system/icons";
import { Button, Select, Text } from "@/design-system";
import { useI18n } from "@/lib/i18n";
import v from "./views.module.css";

/** Settings, a sub-page of Profile: interface language and demo data. */
export function SettingsView({ onReset }: { onReset: () => void }) {
  const { t, locale, setLocale, locales, isLoading, error } = useI18n();
  return (
    <div className={v.subpage}>
      <section className={v.panel}>
        <Select
          label={t("settings.language")}
          value={locale}
          disabled={isLoading}
          onChange={(e) => setLocale(e.target.value)}
          options={locales.map((l) => ({ value: l.code, label: l.nativeName }))}
          error={error ?? undefined}
        />
      </section>
      <section className={v.panel}>
        <Text tone="muted" size="sm">
          {t(
            "Reset brings back the example likes, chats and answers. It only clears RoomPair data in this browser.",
          )}
        </Text>
        <Button
          variant="danger"
          leadingIcon={<RotateCcw />}
          onClick={onReset}
          fullWidth
          className={v.spaced}
        >
          {t("Reset demo data")}
        </Button>
      </section>
    </div>
  );
}
