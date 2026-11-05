"use client";
import { Check, Circle, KeyRound, Star, Trophy } from "lucide-react";
import { you } from "@/lib/discover/deck";
import { type GroupId } from "@/design-system/components/ProfileDetails/ProfileDetails";
import { type HomeSection } from "@/lib/discover/sections";
import s from "./styles.module.css";

export function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className={s.stat}>
      <span>{label}</span>
      <span className={s.pips} aria-label={`${value} of 5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <i key={n} data-on={n <= value} />
        ))}
      </span>
    </div>
  );
}

export function Versus({
  label,
  them,
  mine,
  name,
}: {
  label: string;
  them: number;
  mine: number;
  name: string;
}) {
  return (
    <div className={s.versus}>
      <p>
        {label}
        {them === mine && <span className={s.match}>Match</span>}
      </p>
      <div className={s.vsRow}>
        <span>{name}</span>
        <span className={s.pips} data-who="them">
          {[1, 2, 3, 4, 5].map((n) => (
            <i key={n} data-on={n <= them} />
          ))}
        </span>
      </div>
      <div className={s.vsRow}>
        <span>You</span>
        <span className={s.pips} data-who="you">
          {[1, 2, 3, 4, 5].map((n) => (
            <i key={n} data-on={n <= mine} />
          ))}
        </span>
      </div>
    </div>
  );
}

export function Trait({ ok, text }: { ok: boolean; text: string }) {
  return (
    <li data-ok={ok}>
      {ok ? <Check aria-hidden="true" /> : <Circle aria-hidden="true" />} {text}
    </li>
  );
}

export const groupIcon = { home: KeyRound, person: Star, fit: Trophy } as const;

export function Banner({ group, title }: { group: GroupId; title: string }) {
  const Icon = groupIcon[group];
  return (
    <h3 className={s.banner} data-group={group}>
      <span>
        <Icon aria-hidden="true" />
      </span>
      {title}
    </h3>
  );
}

export function HomeItem({ home }: { home: HomeSection }) {
  return (
    <section className={s.item}>
      {home.photo && <img src={home.photo} alt={home.title ?? ""} />}
      <div>
        {home.title && <h4 className={s.title}>{home.title}</h4>}
        <dl className={s.coins}>
          {home.facts.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
        {home.facts[0].note && (
          <p className={s.note}>
            {home.facts[0].label}: {home.facts[0].note}
          </p>
        )}
        <p>{home.description}</p>
      </div>
    </section>
  );
}
