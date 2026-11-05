"use client";
import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Palette } from "lucide-react";
import { SegmentedControl } from "@/design-system";
import { directions } from "@/design-system/languages";
import { useI18n } from "@/lib/i18n";
import type { Appearance } from "./appearance";
import s from "./AppShell.module.css";

/**
 * Top-right menu: design language, Kolaj palette, detail layout and the
 * interface language. Closes on Escape, outside click and focus leaving.
 */
export function AppearanceMenu({
  appearance,
  onChange,
}: {
  appearance: Appearance;
  onChange: (next: Partial<Appearance>) => void;
}) {
  const { t, locale, setLocale, locales, isLoading } = useI18n();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const current = directions.find((d) => d.id === appearance.language)!;

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      className={s.menuRoot}
      ref={root}
      onBlur={(e) => {
        if (open && !root.current?.contains(e.relatedTarget as Node))
          setOpen(false);
      }}
    >
      <button
        ref={button}
        type="button"
        className={s.menuButton}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${t("Design")}: ${current.name}`}
        onClick={() => setOpen((o) => !o)}
      >
        <Palette aria-hidden="true" />
        <span className={s.menuButtonText}>
          <span className={s.menuButtonLabel}>{t("Design")}</span>
          {current.name}
        </span>
        <ChevronDown aria-hidden="true" />
      </button>
      {open && (
        <div
          className={s.menuPanel}
          id={panelId}
          role="group"
          aria-label={t("Design language")}
        >
          <p className={s.menuTitle}>{t("Design language")}</p>
          <div
            role="radiogroup"
            aria-label={t("Design language")}
            className={s.menuList}
          >
            {directions.map((d) => (
              <button
                key={d.id}
                type="button"
                role="radio"
                aria-checked={appearance.language === d.id}
                className={s.menuItem}
                onClick={() => onChange({ language: d.id })}
              >
                <span className={s.menuItemText}>
                  <strong>{d.name}</strong>
                  <small>{t(d.idea)}</small>
                </span>
                {appearance.language === d.id && <Check aria-hidden="true" />}
              </button>
            ))}
          </div>
          {current.palettes && (
            <>
              <p className={s.menuTitle}>{t("Palette")}</p>
              <div
                role="radiogroup"
                aria-label={t("Palette")}
                className={s.paletteRow}
              >
                {current.palettes.map((pal, i) => {
                  const selected =
                    (appearance.palette ?? current.palettes![0].id) === pal.id;
                  return (
                    <button
                      key={pal.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={s.paletteItem}
                      onClick={() =>
                        onChange({ palette: i === 0 ? undefined : pal.id })
                      }
                    >
                      <span
                        className={s.paletteSwatch}
                        data-direction={current.id}
                        data-palette={pal.id}
                        aria-hidden="true"
                      />
                      {pal.name}
                    </button>
                  );
                })}
              </div>
            </>
          )}
          <p className={s.menuTitle}>{t("Profile details")}</p>
          <SegmentedControl
            label={t("Profile details")}
            fullWidth
            value={appearance.layout}
            onChange={(layout) => onChange({ layout })}
            options={[
              { value: "blocks", label: t("Blocks") },
              { value: "tabs", label: t("Tabs") },
            ]}
          />
          <p className={s.menuTitle}>{t("settings.language")}</p>
          <SegmentedControl
            label={t("settings.language")}
            fullWidth
            value={locale}
            onChange={(code) => !isLoading && setLocale(code)}
            options={locales.map((l) => ({
              value: l.code,
              label: l.nativeName,
            }))}
          />
        </div>
      )}
    </div>
  );
}
