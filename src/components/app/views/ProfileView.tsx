"use client";
import { Backpack, KeyRound, Moon, Pencil, Settings2 } from "lucide-react";
import {
  Avatar,
  Button,
  Heading,
  Select,
  Text,
  VisuallyHidden,
} from "@/design-system";
import { dateLabel, sleepLabel } from "@/lib/discover/deck";
import { useI18n } from "@/lib/i18n";
import type { Preferences } from "@/lib/types";
import { Pips } from "../PersonCard";
import c from "../PersonCard.module.css";
import v from "./views.module.css";

/** Your own character card (what others compare with) and settings. */
export function ProfileView({
  preferences: p,
  onboarded,
  onEdit,
  onSettings,
}: {
  preferences: Preferences;
  onboarded: boolean;
  onEdit: () => void;
  onSettings: () => void;
}) {
  const { t, locale, setLocale, locales, isLoading, error } = useI18n();
  const host = p.intent === "have-room";
  const looking =
    p.intent === "have-room"
      ? t("I have a room and need a flatmate")
      : p.intent === "find-room"
        ? t("I need a room or a flatmate")
        : t("Open to both");
  const mustHaves = [
    p.smokeFree && t("Smoke-free home"),
    p.petsOkay ? t("Pets are fine") : t("No pets"),
    p.verifiedOnly && t("Student badge only"),
  ].filter(Boolean) as string[];
  return (
    <>
      <VisuallyHidden as="h1">{t("nav.profile")}</VisuallyHidden>
      <div className={v.profileGrid}>
        <section aria-labelledby="my-card">
          <article
            className={c.card}
            data-stack
            data-type={host ? "host" : "explorer"}
          >
            <div className={c.body}>
              <div className={c.head}>
                <span className={v.myName}>
                  <Avatar name={p.name} size="lg" />
                  <h2 className={c.name} id="my-card">
                    {p.name}
                  </h2>
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  leadingIcon={<Pencil />}
                  onClick={onEdit}
                >
                  {t("Edit")}
                </Button>
              </div>
              <p className={c.line}>
                <span className={c.type}>
                  {host ? (
                    <KeyRound aria-hidden="true" />
                  ) : (
                    <Backpack aria-hidden="true" />
                  )}
                  {host ? t("Host") : t("Explorer")}
                </span>
                <span className={c.meta}>{looking}</span>
              </p>
              <dl className={v.myFacts}>
                <div>
                  <dt>{t("City")}</dt>
                  <dd>{p.city}</dd>
                </div>
                <div>
                  <dt>{t("Monthly budget")}</dt>
                  <dd>
                    €{p.budgetMin}–{p.budgetMax}
                  </dd>
                </div>
                <div>
                  <dt>{t("Move-in")}</dt>
                  <dd>{dateLabel(p.moveDate)}</dd>
                </div>
                <div>
                  <dt>{t("Stay")}</dt>
                  <dd>
                    {p.stayMonths} {t("months")}
                  </dd>
                </div>
              </dl>
              <div className={c.stats}>
                <Pips label={t("Tidy")} value={p.cleanliness} />
                <Pips label={t("Social")} value={p.social} />
                <span className={c.sleep}>
                  <Moon aria-hidden="true" /> {t(sleepLabel[p.sleep])}
                </span>
              </div>
              <ul className={v.mustHaves} aria-label={t("Must-haves")}>
                {mustHaves.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
              {!onboarded && (
                <Text size="sm" tone="muted">
                  {t("These are example answers. Press Edit to use your own.")}
                </Text>
              )}
            </div>
          </article>
          <Text size="sm" tone="muted" className={v.spaced}>
            {t(
              "Other people compare their answers with these. Your fit score with them comes from this card.",
            )}
          </Text>
        </section>

        <section className={v.panel} aria-labelledby="settings-title">
          <Heading level={2} size="lg" id="settings-title">
            {t("Settings")}
          </Heading>
          <Select
            label={t("settings.language")}
            value={locale}
            disabled={isLoading}
            onChange={(e) => setLocale(e.target.value)}
            options={locales.map((l) => ({
              value: l.code,
              label: l.nativeName,
            }))}
            error={error ?? undefined}
            className={v.spaced}
          />
          <div className={v.spaced}>
            <Button
              variant="secondary"
              leadingIcon={<Settings2 />}
              onClick={onSettings}
            >
              {t("Demo data")}
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
