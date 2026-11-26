"use client";
import type { CSSProperties } from "react";
import {
  BadgeCheck,
  MessageCircle,
  MoreHorizontal,
} from "@/design-system/icons";
import { Button, DetailHero, Dialog, IconButton } from "@/design-system";
import {
  defaultLanguage,
  defaultLayout,
  discoverParts,
} from "@/design-system/languages";
import { useI18n } from "@/lib/i18n";
import type { MatchResult, Preferences, Profile } from "@/lib/types";
import d from "./dialogs.module.css";

/** A person's full profile: Home → Person → Fit as tabs. */
export function ProfileDialog({
  profile: p,
  match,
  viewer,
  inChat = false,
  onClose,
  onChat,
  onReport,
}: {
  profile: Profile;
  match: MatchResult;
  /** Your own answers, compared with theirs. */
  viewer: Preferences;
  /** Their conversation is the page behind this dialog: no Message button. */
  inChat?: boolean;
  onClose: () => void;
  onChat: () => void;
  onReport: () => void;
}) {
  const { t } = useI18n();
  const { Details } = discoverParts[defaultLanguage];
  return (
    <Dialog title={`${p.name}, ${p.age}`} onClose={onClose} size="lg" hideTitle>
      <div className={d.hero}>
        <DetailHero
          src={p.photo}
          title={
            <>
              {p.name}, {p.age}
              {p.verified && <BadgeCheck aria-label={t("discover.verified")} />}
            </>
          }
          subtitle={`${p.intent === "have-room" ? t("Host") : t("Explorer")} · ${p.neighborhood}`}
          action={
            <IconButton
              variant="outline"
              label={t("Profile options")}
              icon={<MoreHorizontal />}
              onClick={onReport}
            />
          }
        />
      </div>
      <div
        className={d.details}
        // Inside the dialog: the tabs stick to its very top and span its full
        // width (sticky offsets start at the padding), on the dialog's own
        // surface, and the sections take the page colour to stand out on it.
        style={
          {
            "--sticky-offset": "calc(var(--space-8) * -1)",
            "--details-bleed": "var(--space-6)",
            "--details-bg": "var(--color-surface-raised)",
            "--detail-section-bg": "var(--color-bg)",
          } as CSSProperties
        }
      >
        <Details
          profile={p}
          match={match}
          layout={defaultLayout}
          viewer={viewer}
          onReport={onReport}
        />
      </div>
      {/* Opened from their conversation: you are already talking. */}
      {!inChat && (
        <div className={d.footer}>
          <Button leadingIcon={<MessageCircle />} onClick={onChat} fullWidth>
            {t("Message")}
          </Button>
        </div>
      )}
    </Dialog>
  );
}
