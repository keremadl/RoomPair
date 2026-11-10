"use client";
import type { CSSProperties } from "react";
import {
  BadgeCheck,
  Heart,
  MessageCircle,
  MoreHorizontal,
} from "@/design-system/icons";
import { Avatar, Button, Dialog, IconButton, Text } from "@/design-system";
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
  liked,
  hasChat,
  onClose,
  onLike,
  onChat,
  onReport,
}: {
  profile: Profile;
  match: MatchResult;
  /** Your own answers, compared with theirs. */
  viewer: Preferences;
  liked: boolean;
  hasChat: boolean;
  onClose: () => void;
  onLike: () => void;
  onChat: () => void;
  onReport: () => void;
}) {
  const { t } = useI18n();
  const { Details } = discoverParts[defaultLanguage];
  return (
    <Dialog title={`${p.name}, ${p.age}`} onClose={onClose} size="lg" hideTitle>
      <div className={d.person}>
        <Avatar name={p.name} src={p.photo} size="lg" />
        <div>
          <h2 className={d.personName}>
            {p.name}, {p.age}{" "}
            {p.verified && <BadgeCheck aria-label={t("discover.verified")} />}
          </h2>
          <Text size="sm" tone="muted">
            {p.occupation} · {p.neighborhood}
          </Text>
        </div>
        <IconButton
          label={t("Profile options")}
          icon={<MoreHorizontal />}
          onClick={onReport}
          className={d.personMenu}
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
      <div className={d.footer}>
        {hasChat || p.likesYou ? (
          <Button leadingIcon={<MessageCircle />} onClick={onChat} fullWidth>
            {t("Message")}
          </Button>
        ) : (
          <Button
            leadingIcon={<Heart />}
            onClick={onLike}
            disabled={liked}
            fullWidth
          >
            {liked ? t("Waiting for them") : t("Team up")}
          </Button>
        )}
      </div>
    </Dialog>
  );
}
