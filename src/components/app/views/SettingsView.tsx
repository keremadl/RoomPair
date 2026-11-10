"use client";
import { Contrast, Moon, RotateCcw, Sun } from "@/design-system/icons";
import { Button, ChoiceCards, Select, Text } from "@/design-system";
import {
  palettes,
  type PaletteId,
} from "@/design-system/languages/card/palettes";
import type { Appearance, ThemeChoice } from "@/lib/appearance";
import { useI18n } from "@/lib/i18n";
import v from "./views.module.css";

/** A palette's five colours (background, surface, primary, highlight, ink). */
function Swatches({ colors }: { colors: readonly string[] }) {
  return (
    <span className={v.swatches} aria-hidden="true">
      {colors.map((c, i) => (
        <span key={i} style={{ background: c }} />
      ))}
    </span>
  );
}

/** Settings, a sub-page of Profile: look, interface language and demo data. */
export function SettingsView({
  appearance,
  onAppearance,
  onReset,
}: {
  appearance: Appearance;
  onAppearance: (next: Partial<Appearance>) => void;
  onReset: () => void;
}) {
  const { t, locale, setLocale, locales, isLoading, error } = useI18n();
  return (
    <div className={v.subpage}>
      <section className={v.panel}>
        <ChoiceCards<ThemeChoice>
          label={t("Theme")}
          value={appearance.theme}
          onChange={(theme) => onAppearance({ theme })}
          options={[
            {
              value: "system",
              title: t("System"),
              hint: t("Follows your device."),
              icon: <Contrast />,
            },
            { value: "light", title: t("Light"), icon: <Sun /> },
            { value: "dark", title: t("Dark"), icon: <Moon /> },
          ]}
        />
      </section>
      <section className={v.panel}>
        <ChoiceCards<PaletteId>
          label={t("Colour palette")}
          value={appearance.palette}
          onChange={(palette) => onAppearance({ palette })}
          columns={2}
          options={palettes.map((p) => ({
            value: p.id,
            title: p.name,
            hint: t(p.description),
            icon: <Swatches colors={p.swatches.light} />,
          }))}
        />
      </section>
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
