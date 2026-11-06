"use client";
import type { ReactNode } from "react";
import { Backpack, BadgeCheck, KeyRound, Moon } from "lucide-react";
import { dateLabel, sleepLabel } from "@/lib/discover/deck";
import { useI18n } from "@/lib/i18n";
import type { Profile } from "@/lib/types";
import c from "./PersonCard.module.css";

/** Five pips for a 1–5 habit, as on the Discover card. */
export function Pips({
  label,
  value,
  bare = false,
}: {
  label: string;
  value: number;
  /** Only the dots (the row already names the habit). */
  bare?: boolean;
}) {
  return (
    <span className={c.stat}>
      {!bare && <span>{label}</span>}
      <span className={c.pips} role="img" aria-label={`${label}: ${value} / 5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <i key={n} data-on={n <= value} />
        ))}
      </span>
    </span>
  );
}

/**
 * A compact character card: the same frame, type and stats as the Discover
 * card, plus the facts needed to decide (rent or budget, move-in, fit).
 */
export function PersonCard({
  profile: p,
  fit,
  onOpen,
  actions,
  compact = false,
}: {
  profile: Profile;
  fit?: number;
  onOpen?: () => void;
  actions?: ReactNode;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const host = p.intent === "have-room";
  const money = host
    ? `€${p.room?.price ?? p.budget[0]} ${t("rent")}`
    : `€${p.budget[0]}–${p.budget[1]} ${t("budget")}`;
  const photo = (
    <span className={c.photo}>
      <img src={p.photo} alt="" />
    </span>
  );
  return (
    <article
      className={c.card}
      data-type={host ? "host" : "explorer"}
      data-compact={compact || undefined}
      aria-label={`${p.name}, ${t("Age")} ${p.age}`}
    >
      {onOpen ? (
        <button
          type="button"
          className={c.photoButton}
          onClick={onOpen}
          aria-label={`${t("discover.viewProfile")}: ${p.name}`}
        >
          {photo}
        </button>
      ) : (
        photo
      )}
      <div className={c.body}>
        <div className={c.head}>
          <h3 className={c.name}>
            {p.name}
            {p.verified && <BadgeCheck aria-label={t("discover.verified")} />}
          </h3>
          <span className={c.age}>
            <small>{t("Age")}</small>
            {p.age}
          </span>
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
          {fit !== undefined && (
            <span className={c.fit}>
              {fit}% {t("fit")}
            </span>
          )}
        </p>
        <p className={c.meta}>
          {p.occupation} · {p.neighborhood}
        </p>
        {!compact && (
          <>
            <p className={c.facts}>
              <strong>{money}</strong>
              <span>
                {t("From")} {dateLabel(p.moveDate)}
              </span>
              <span>
                {p.stayMonths} {t("months")}
              </span>
            </p>
            <div className={c.stats}>
              <Pips label={t("Tidy")} value={p.habits.cleanliness} />
              <Pips label={t("Social")} value={p.habits.social} />
              <span className={c.sleep}>
                <Moon aria-hidden="true" /> {t(sleepLabel[p.habits.sleep])}
              </span>
            </div>
          </>
        )}
        {actions && <div className={c.actions}>{actions}</div>}
      </div>
    </article>
  );
}
