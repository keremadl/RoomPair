"use client";
import {
  ArrowUpRight,
  KeyRound,
  MapPin,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  FactGrid,
  Heading,
  Select,
  SegmentedControl,
  Text,
} from "@/design-system";
import { directions } from "@/design-system/languages";
import { useI18n } from "@/lib/i18n";
import type { Preferences } from "@/lib/types";
import type { Appearance } from "../appearance";
import { PageHeader } from "../PageHeader";
import v from "./views.module.css";

const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export function ProfileView({
  preferences: p,
  onboarded,
  appearance,
  onAppearance,
  onEdit,
  onSettings,
}: {
  preferences: Preferences;
  onboarded: boolean;
  appearance: Appearance;
  onAppearance: (next: Partial<Appearance>) => void;
  onEdit: () => void;
  onSettings: () => void;
}) {
  const { t, locale, setLocale, locales, isLoading, error } = useI18n();
  const rhythm =
    p.sleep === "early"
      ? "Early bird"
      : p.sleep === "late"
        ? "Night owl"
        : "A little flexible";
  return (
    <>
      <PageHeader
        eyebrow={t("A HOME STARTS WITH YOU")}
        title={t("profile.title")}
        description={t("The little things that make you, you.")}
      />
      <div className={v.profileGrid}>
        <Card padding="lg" className={v.me}>
          <Avatar name={p.name} size="xl" />
          <Heading level={2} size="2xl">
            {p.name}
          </Heading>
          <Text tone="muted">
            <MapPin aria-hidden="true" className={v.inlineIcon} /> {p.city} ·{" "}
            {t("Your next chapter")}
          </Text>
          <Badge tone="accent">
            <KeyRound aria-hidden="true" className={v.inlineIcon} />
            {p.intent === "have-room"
              ? t("I have a room to share")
              : t("I’m finding my people")}
          </Badge>
          <Button trailingIcon={<ArrowUpRight />} onClick={onEdit}>
            {t("Edit my profile")}
          </Button>
          <Text size="sm" tone="muted">
            {onboarded
              ? t("Your living style is ready.")
              : t("Make it yours in a few small steps.")}
          </Text>
        </Card>

        <div className={v.stack}>
          <Card padding="md">
            <div className={v.sectionHead}>
              <Heading level={2} size="xl">
                {t("My living style")}
              </Heading>
              <Button variant="ghost" size="sm" onClick={onEdit}>
                {t("common.edit")}
              </Button>
            </div>
            <FactGrid
              facts={[
                {
                  label: t("Monthly budget"),
                  value: `€${p.budgetMin}–${p.budgetMax}`,
                },
                { label: t("Ready to move"), value: longDate(p.moveDate) },
                {
                  label: t("At home"),
                  value: p.smokeFree ? t("Smoke-free") : t("Open to smoking"),
                },
                { label: t("My rhythm"), value: t(rhythm) },
              ]}
            />
          </Card>

          <Card padding="md">
            <Heading level={2} size="xl">
              {t("Design language")}
            </Heading>
            <Text size="sm" tone="muted" className={v.spaced}>
              {t(
                "The same app in six design languages. You can also switch from the top right.",
              )}
            </Text>
            <Select
              label={t("Design language")}
              value={appearance.language}
              onChange={(e) =>
                onAppearance({
                  language: e.target.value as Appearance["language"],
                })
              }
              options={directions.map((d) => ({
                value: d.id,
                label: t(d.name),
              }))}
              className={v.spaced}
            />
            <div className={v.spaced}>
              <SegmentedControl
                label={t("Profile details")}
                value={appearance.layout}
                onChange={(layout) => onAppearance({ layout })}
                options={[
                  { value: "blocks", label: t("Blocks") },
                  { value: "tabs", label: t("Tabs") },
                ]}
              />
            </div>
          </Card>

          <Card padding="md">
            <Heading level={2} size="xl">
              {t("settings.language")}
            </Heading>
            <Text size="sm" tone="muted" className={v.spaced}>
              {t("Feel at home in your own language.")}
            </Text>
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
          </Card>

          <Card variant="sunken" padding="md" className={v.trust}>
            <ShieldCheck aria-hidden="true" />
            <div>
              <Heading level={2} size="lg">
                {t("Trust is in the details.")}
              </Heading>
              <Text size="sm" tone="muted">
                {t(
                  "Demo student badges illustrate verification. Identity and property checks are not connected in this prototype.",
                )}
              </Text>
            </div>
          </Card>
          <div>
            <Button
              variant="ghost"
              leadingIcon={<Settings2 />}
              onClick={onSettings}
            >
              {t("Demo settings & data")}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
