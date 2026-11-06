"use client";
import { HeartHandshake, ListChecks, ShieldCheck } from "@/design-system/icons";
import { Button, Dialog } from "@/design-system";
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
      title: "Must-haves first",
      body: "You only see people whose budget, move-in date, smoking and pets fit yours. The % fit is calculated after that.",
    },
    {
      icon: HeartHandshake,
      title: "Chat after a match",
      body: "A chat opens only when you both press Team up.",
    },
    {
      icon: ListChecks,
      title: "Plan the move",
      body: "Save rooms, plan viewings and agree on house rules in My space.",
    },
  ];
  return (
    <Dialog title={t("How RoomPair works")} onClose={onClose}>
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
      <div className={d.notice}>
        <strong>{t("This is a demo")}</strong>
        <p>
          {t(
            "RoomPair is a school project. All people, rooms, student badges and chat replies are made up. Nothing is sent anywhere: your changes stay in this browser.",
          )}
        </p>
      </div>
      <div className={d.footer}>
        <Button onClick={onStart} fullWidth>
          {t("Set up my profile")}
        </Button>
      </div>
    </Dialog>
  );
}
