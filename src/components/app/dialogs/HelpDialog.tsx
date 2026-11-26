"use client";
import { HeartHandshake, ListChecks, ShieldCheck } from "@/design-system/icons";
import { Button, Dialog } from "@/design-system";
import { useI18n } from "@/lib/i18n";
import d from "./dialogs.module.css";

export function HelpDialog({
  demo = true,
  onClose,
  onStart,
}: {
  demo?: boolean;
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
      title: "Agree before you move",
      body: "Use the chat to visit the room together and agree on bills, cleaning and guests.",
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
        <strong>{t(demo ? "This is a demo" : "About this pilot")}</strong>
        <p>
          {t(
            demo
              ? "RoomPair is a school project. All people, rooms, student badges and chat replies are made up. Nothing is sent anywhere: your changes stay in this browser."
              : "RoomPair is an early-stage school project. Your profile, likes, matches and messages are saved to your account. Demo profiles in Riga are fictional presentation data.",
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
