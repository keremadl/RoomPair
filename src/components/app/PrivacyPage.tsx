"use client";
import { Heading, Text, TextLink } from "@/design-system";
import {
  defaultLanguage,
  directionFontVariables,
} from "@/design-system/languages";
import { useAppearance } from "@/lib/appearance";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { Brand } from "./Brand";
import s from "./PrivacyPage.module.css";

const sections = [
  {
    title: "What we keep",
    body: "Your email address, the profile you fill in (name, age, city, budget, habits and photos), your likes and passes, your matches, the messages and photos you send, and the people you block or report.",
  },
  {
    title: "Why we keep it",
    body: "Only to run the app: to show your profile to other members, to suggest people who fit, and to deliver your messages. There are no ads and no trackers, and your data is not sold or shared.",
  },
  {
    title: "Who can see it",
    body: "Signed-in members can see your profile and your listing. Only you and the person you matched with can read a conversation. People you block cannot see you at all.",
  },
  {
    title: "Where it is stored",
    body: "In a database in the European Union (Frankfurt). Photos are private files that open only through short-lived links. Your password is stored as a one-way hash that nobody can read.",
  },
  {
    title: "Demo mode",
    body: "When the app runs without accounts, everything stays in this browser and nothing is sent to a server.",
  },
  {
    title: "Your choices",
    body: "You can change or remove anything in your profile at any time. In Settings you can delete your account: your profile, photos, likes, matches and messages are removed for good.",
  },
  {
    title: "Adults only",
    body: "RoomPair is for people who are 18 or older.",
  },
];

function Notice() {
  const { t } = useI18n();
  const { appearance, theme } = useAppearance();
  return (
    <main
      className={`${s.page} ${directionFontVariables}`}
      data-direction={defaultLanguage}
      data-palette={appearance.palette}
      data-theme={theme}
    >
      <div className={s.column}>
        <Brand />
        <Heading level={1}>{t("Privacy notice")}</Heading>
        <Text tone="muted">
          {t(
            "RoomPair is a student project. This page says in plain words what the app keeps about you and why.",
          )}
        </Text>
        {sections.map((section) => (
          <section key={section.title} className={s.section}>
            <Heading level={2} size="lg">
              {t(section.title)}
            </Heading>
            <Text>{t(section.body)}</Text>
          </section>
        ))}
        <Text>
          <TextLink href="/">{t("Back to RoomPair")}</TextLink>
        </Text>
      </div>
    </main>
  );
}

/** What RoomPair stores and why, readable without signing in. */
export function PrivacyPage() {
  return (
    <I18nProvider>
      <Notice />
    </I18nProvider>
  );
}
