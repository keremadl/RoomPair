"use client";
import { HeartHandshake, ListChecks, ShieldCheck } from "lucide-react";
import { Button, Dialog, Heading, Text } from "@/design-system";
import { useI18n } from "@/lib/i18n";
import d from "./dialogs.module.css";

export function HelpDialog({
  onClose,
  onStart,
}: {
  onClose: () => void;
  onStart: () => void;
}) {
  const { t } = useI18n();
  const steps = [
    {
      icon: ShieldCheck,
      title: "Your must-haves, respected.",
      body: "Budget, moving dates and dealbreakers come before the score.",
    },
    {
      icon: HeartHandshake,
      title: "A feeling that goes both ways.",
      body: "Like, match, and have a real conversation. No pressure, no paywall.",
    },
    {
      icon: ListChecks,
      title: "From a match to a moving plan.",
      body: "Save places, talk house rules, and plan your new chapter.",
    },
  ];
  return (
    <Dialog title={t("The RoomPair way")} onClose={onClose}>
      <Heading level={3}>{t("Find your people. Then your place.")}</Heading>
      <Text tone="muted" className={d.spaced}>
        {t(
          "A good roommate is more than a good profile. RoomPair puts everyday life at the heart of finding a home.",
        )}
      </Text>
      <ul className={d.steps}>
        {steps.map(({ icon: Icon, title, body }) => (
          <li key={title}>
            <Icon aria-hidden="true" />
            <span>
              <strong>{t(title)}</strong>
              {t(body)}
            </span>
          </li>
        ))}
      </ul>
      <Text size="xs" tone="muted">
        {t(
          "This is a school-project prototype. People, listings, student badges and replies are fictional demonstrations. Your changes stay in this browser.",
        )}
      </Text>
      <div className={d.footer}>
        <Button onClick={onStart} fullWidth>
          {t("Make RoomPair yours")}
        </Button>
      </div>
    </Dialog>
  );
}
