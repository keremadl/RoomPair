"use client";
import {
  Cigarette,
  Handshake,
  Home,
  Moon,
  PawPrint,
  UserRound,
} from "lucide-react";
import { habitRows, type Profile } from "@/lib/discover/deck";
import { type GroupId } from "@/design-system/components/ProfileDetails/ProfileDetails";
import {
  type FitSection,
  type HomeSection,
  type PersonSection,
} from "@/lib/discover/sections";
import s from "./styles.module.css";

export function Blocks({ value, who }: { value: number; who: "them" | "you" }) {
  return (
    <span
      className={s.blocks}
      data-who={who}
      aria-label={`${who === "you" ? "You" : "Them"}: ${value} of 5`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} data-on={n <= value} />
      ))}
    </span>
  );
}

export const groupIcon = {
  home: Home,
  person: UserRound,
  fit: Handshake,
} as const;

export function GroupTitle({
  group,
  title,
}: {
  group: GroupId;
  title: string;
}) {
  const Icon = groupIcon[group];
  return (
    <h3 className={s.groupTitle} data-group={group}>
      <Icon aria-hidden="true" /> {title}
    </h3>
  );
}

export const factColors = ["lime", "pink", "blue", "mint"];

export function HomeStickers({ home }: { home: HomeSection }) {
  return (
    <>
      <div className={s.stickers}>
        {home.facts.map((f, i) => (
          <span key={f.label} className={s.sticker} data-color={factColors[i]}>
            <small>{f.label}</small> {f.value}
          </span>
        ))}
      </div>
      {home.facts[0].note && (
        <p className={s.small}>
          {home.facts[0].label}: {home.facts[0].note}
        </p>
      )}
      {home.photo ? (
        <figure className={s.roomPolaroid}>
          <span className={s.tape} aria-hidden="true" />
          <img src={home.photo} alt={home.title ?? ""} />
          <figcaption>{home.title}</figcaption>
        </figure>
      ) : null}
      <p className={home.photo ? s.roomText : s.searchNote}>
        {home.description}
      </p>
    </>
  );
}

export const lifestyleIcon: Record<string, typeof Moon> = {
  Sleep: Moon,
  Smoking: Cigarette,
  Pets: PawPrint,
};

export function PersonStickers({
  person,
  profile: p,
}: {
  person: PersonSection;
  profile: Profile;
}) {
  const [studies, checked] = person.facts;
  return (
    <>
      <p className={s.meta}>
        {studies.value} · {studies.note}
        {checked.value === "Student email" ? " · ✓ student email (demo)" : ""}
      </p>
      <p className={s.bio}>{person.bio}</p>
      <div className={s.tags}>
        {person.interests.map((t) => (
          <span key={t} className={s.tag}>
            {t}
          </span>
        ))}
      </div>
      <div className={s.bubble}>
        <p className={s.bubbleQ}>{person.prompt.question}</p>
        <p className={s.bubbleA}>{person.prompt.answer}</p>
      </div>
      <p className={s.subTitle}>Your vibes, side by side</p>
      <div className={s.legend}>
        <span data-who="them">{p.name}</span>
        <span data-who="you">You</span>
      </div>
      {habitRows(p).map((row) => (
        <div key={row.label} className={s.meter}>
          <p className={s.meterLabel}>
            {row.label}
            <small>
              {row.scale[row.them]} / {row.scale[row.you]}
            </small>
          </p>
          <Blocks value={row.them} who="them" />
          <Blocks value={row.you} who="you" />
        </div>
      ))}
      <div className={s.lifestyle}>
        {person.habits.slice(2).map((h) => {
          const Icon = lifestyleIcon[h.label];
          return (
            <div key={h.label} className={s.lifestyleItem}>
              <Icon aria-hidden="true" />
              <p>{h.label}</p>
              <strong>{h.them}</strong>
              <small>You: {h.you}</small>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function FitBars({ fit }: { fit: FitSection }) {
  return (
    <>
      <div className={s.bars}>
        {fit.breakdown.map((row) => (
          <div key={row.label} className={s.barRow}>
            <p>
              {row.label}
              <strong>{row.score}</strong>
            </p>
            <span className={s.barTrack}>
              <span
                className={s.barFill}
                data-level={
                  row.score >= 90 ? "high" : row.score >= 60 ? "mid" : "low"
                }
                style={{ width: `${row.score}%` }}
              />
            </span>
          </div>
        ))}
      </div>
      {fit.discuss.length > 0 && (
        <div className={s.talk}>
          <strong>Talk about:</strong> {fit.discuss.join(" · ")}
        </div>
      )}
      <p className={s.small}>
        Based on what you both said. It&rsquo;s a vibe check, not a promise.
      </p>
    </>
  );
}
