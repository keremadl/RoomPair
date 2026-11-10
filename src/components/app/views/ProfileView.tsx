"use client";
import { useState } from "react";
import {
  BadgeCheck,
  MessageCircle,
  Building2,
  ChevronRight,
  Eye,
  Flag,
  Heart,
  KeyRound,
  ShieldBan,
  ShieldCheck,
  UserPen,
  Users,
} from "@/design-system/icons";
import {
  Button,
  ChoiceCards,
  Dialog,
  ListGroup,
  ListRow,
} from "@/design-system";
import { useI18n } from "@/lib/i18n";
import {
  defaultLanguage,
  defaultLayout,
  discoverParts,
} from "@/design-system/languages";
import { asProfile, completion, profileSteps } from "@/lib/profile";
import type { MatchResult, MyProfile, Preferences } from "@/lib/types";
import h from "../profile/hub.module.css";

/** Your own card has nobody to be compared with. */
const noMatch: MatchResult = {
  score: 0,
  eligible: true,
  reasons: [],
  considerations: [],
  breakdown: [],
  dealbreakers: [],
};

/**
 * The profile page: who you are at a glance, how complete your profile
 * is, your numbers, and safety. Editing happens on its own page.
 */
export function ProfileView({
  preferences: prefs,
  me,
  counts,
  onEdit,
  onBlocked,
  onIntent,
  onVerify,
  onLikes,
  onMatches,
}: {
  preferences: Preferences;
  me: MyProfile;
  counts: { likes: number; matches: number; blocked: number; reports: number };
  onEdit: () => void;
  /** Opens the list of blocked people. */
  onBlocked: () => void;
  onIntent: (intent: "find-room" | "have-room") => void;
  onVerify: () => void;
  onLikes: () => void;
  /** Opens Messages, where matches are. */
  onMatches: () => void;
}) {
  const { t } = useI18n();
  const [choosing, setChoosing] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const { Card, Details } = discoverParts[defaultLanguage];
  const host = prefs.intent === "have-room";
  const steps = profileSteps(me, prefs);
  const percent = completion(steps);
  const next = steps.find((s) => !s.done);
  const intentLabel = host
    ? t("I have a room, I need a flatmate")
    : t("I’m looking for a room");

  return (
    <div className={h.page}>
      <section className={h.me} aria-label={t("You")}>
        <button
          type="button"
          className={h.ring}
          style={{ "--done": percent } as React.CSSProperties}
          onClick={() => setPreviewing(true)}
          aria-label={`${t("Preview my card")} · ${percent}% ${t("complete")}`}
        >
          {me.photos[0] ? (
            <img src={me.photos[0]} alt="" />
          ) : (
            <span className={h.initial}>{prefs.name.charAt(0)}</span>
          )}
          <b>{percent}%</b>
        </button>
        <div className={h.who}>
          <h2 className={h.name}>
            {prefs.name}, {me.age}
            {me.verified && <BadgeCheck aria-label={t("discover.verified")} />}
          </h2>
          <button
            type="button"
            className={h.intent}
            onClick={() => setChoosing(true)}
            aria-label={`${t("Why you're here")}: ${intentLabel}`}
          >
            {host ? (
              <KeyRound aria-hidden="true" />
            ) : (
              <Building2 aria-hidden="true" />
            )}
            {intentLabel}
          </button>
        </div>
      </section>

      <div className={h.actions}>
        <Button leadingIcon={<UserPen />} onClick={onEdit} fullWidth>
          {t("Edit profile")}
        </Button>
        <Button
          variant="secondary"
          leadingIcon={<Eye />}
          onClick={() => setPreviewing(true)}
          fullWidth
        >
          {t("Preview")}
        </Button>
      </div>

      {next && (
        <button type="button" className={h.nudge} onClick={onEdit}>
          <span className={h.nudgeIcon}>
            <UserPen aria-hidden="true" />
          </span>
          <span className={h.nudgeText}>
            <strong>{t("Complete your profile")}</strong>
            <span>
              {t("Next")}: {t(next.label)}
            </span>
          </span>
          <ChevronRight aria-hidden="true" className={h.chevron} />
        </button>
      )}

      <div className={h.tiles}>
        <button type="button" className={h.tile} onClick={onLikes}>
          <span className={h.tileIcon}>
            <Heart aria-hidden="true" />
          </span>
          <span>
            <small>{t("Liked you")}</small>
            <strong>{counts.likes}</strong>
          </span>
        </button>
        <button type="button" className={h.tile} onClick={onMatches}>
          <span className={h.tileIcon}>
            <MessageCircle aria-hidden="true" />
          </span>
          <span>
            <small>{t("Matches")}</small>
            <strong>{counts.matches}</strong>
          </span>
        </button>
      </div>

      <ListGroup title={t("Safety")} id="safety">
        <ListRow
          icon={<ShieldCheck />}
          label={t("Student email")}
          value={me.verified ? t("Verified (demo)") : undefined}
          onClick={onVerify}
        />
        <ListRow
          icon={<ShieldBan />}
          label={t("Blocked people")}
          value={counts.blocked}
          onClick={onBlocked}
          link
        />
        {counts.reports > 0 && (
          <ListRow
            icon={<Flag />}
            label={t("Reports you sent")}
            value={counts.reports}
          />
        )}
      </ListGroup>

      {previewing && (
        <Dialog title={t("Your card")} onClose={() => setPreviewing(false)}>
          <p className={h.lead}>
            {host
              ? t("Room seekers see this card, and the details under it.")
              : t(
                  "People with a room see this card, and the details under it.",
                )}
          </p>
          <div className={h.preview}>
            <Card
              preview
              roomFirst={host}
              deck={{
                profile: asProfile(me, prefs),
                match: noMatch,
                cardKey: "me",
                exitDirection: 0,
                canUndo: false,
                decide: () => {},
                undo: () => {},
                index: 0,
                total: 1,
              }}
            />
          </div>
          <div
            className={h.previewDetails}
            style={
              {
                "--sticky-offset": "calc(var(--space-8) * -1)",
                "--details-bleed": "var(--space-6)",
                "--details-bg": "var(--color-surface-raised)",
                "--detail-section-bg": "var(--color-bg)",
              } as React.CSSProperties
            }
          >
            <Details
              profile={asProfile(me, prefs)}
              match={noMatch}
              layout={defaultLayout}
              viewer={prefs}
              groups={["home", "person"]}
            />
          </div>
        </Dialog>
      )}
      {choosing && (
        <Dialog title={t("Why you're here")} onClose={() => setChoosing(false)}>
          <ChoiceCards
            label={t("What are you looking for?")}
            value={host ? "have-room" : "find-room"}
            onChange={(v) => {
              onIntent(v);
              setChoosing(false);
            }}
            options={[
              {
                value: "find-room",
                title: t("I’m looking for a room"),
                hint: t("Discover shows people who have a room, room first."),
                icon: <Building2 />,
              },
              {
                value: "have-room",
                title: t("I have a room, I need a flatmate"),
                hint: t("Discover shows only people looking for a room."),
                icon: <Users />,
              },
            ]}
          />
        </Dialog>
      )}
    </div>
  );
}
