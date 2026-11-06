"use client";
import { useState } from "react";
import {
  BadgeCheck,
  Bookmark,
  Building2,
  ChevronRight,
  CircleHelp,
  Flag,
  Heart,
  KeyRound,
  Settings,
  ShieldBan,
  ShieldCheck,
  UserPen,
  Users,
} from "lucide-react";
import {
  ChoiceCards,
  Dialog,
  IconButton,
  ListGroup,
  ListRow,
} from "@/design-system";
import { useI18n } from "@/lib/i18n";
import { completion, profileSteps } from "@/lib/profile";
import type { MyProfile, Preferences } from "@/lib/types";
import h from "../profile/hub.module.css";

/**
 * The profile page: who you are at a glance, how complete your profile
 * is, your numbers, and safety. Editing happens on its own page.
 */
export function ProfileView({
  preferences: prefs,
  me,
  counts,
  onEdit,
  onSettings,
  onHelp,
  onIntent,
  onVerify,
  onLikes,
  onSpace,
}: {
  preferences: Preferences;
  me: MyProfile;
  counts: { likes: number; saved: number; blocked: number; reports: number };
  onEdit: () => void;
  onSettings: () => void;
  onHelp: () => void;
  onIntent: (intent: "find-room" | "have-room") => void;
  onVerify: () => void;
  onLikes: () => void;
  onSpace: () => void;
}) {
  const { t } = useI18n();
  const [choosing, setChoosing] = useState(false);
  const host = prefs.intent === "have-room";
  const steps = profileSteps(me, prefs);
  const percent = completion(steps);
  const next = steps.find((s) => !s.done);
  const intentLabel = host
    ? t("I have a room, I need a flatmate")
    : t("I’m looking for a room");

  return (
    <div className={h.page}>
      <header className={h.top}>
        <h1 className={h.title}>{t("Profile")}</h1>
        <div className={h.icons}>
          <IconButton
            label={t("Settings")}
            icon={<Settings />}
            variant="ghost"
            onClick={onSettings}
          />
          <IconButton
            label={t("Help")}
            icon={<CircleHelp />}
            variant="ghost"
            onClick={onHelp}
          />
          <IconButton
            label={t("Edit profile")}
            icon={<UserPen />}
            variant="ghost"
            onClick={onEdit}
          />
        </div>
      </header>

      <section className={h.me} aria-label={t("You")}>
        <button
          type="button"
          className={h.ring}
          style={{ "--done": percent } as React.CSSProperties}
          onClick={onEdit}
          aria-label={`${t("Edit profile")}: ${percent}% ${t("complete")}`}
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
        <button type="button" className={h.tile} onClick={onSpace}>
          <span className={h.tileIcon}>
            <Bookmark aria-hidden="true" />
          </span>
          <span>
            <small>{host ? t("Checklist") : t("Saved rooms")}</small>
            <strong>{host ? t("Open") : counts.saved}</strong>
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
        />
        <ListRow
          icon={<Flag />}
          label={t("Reports you sent")}
          value={counts.reports}
        />
        <ListRow
          icon={<CircleHelp />}
          label={t("How RoomPair works")}
          onClick={onHelp}
        />
      </ListGroup>

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
