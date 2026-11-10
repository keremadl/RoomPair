"use client";
import { Check, Circle, KeyRound, Star, Trophy } from "../../icons";
import { useText } from "@/design-system/text/TextProvider";
import { type GroupId } from "@/design-system/components/ProfileDetails/ProfileDetails";
import { type HomeSection } from "@/lib/discover/sections";
import s from "./styles.module.css";

export function Stat({ label, value }: { label: string; value: number }) {
  const t = useText();
  return (
    <div className={s.stat}>
      <span>{label}</span>
      <span className={s.pips} aria-label={t("{value} of 5", { value })}>
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
  const t = useText();
  return (
    <div className={s.versus}>
      <p>
        {label}
        {them === mine && <span className={s.match}>{t("Match")}</span>}
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
        <span>{t("You")}</span>
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
  const t = useText();
  return (
    <section className={s.item}>
      {home.photo && <img src={home.photo} alt={home.title ?? ""} />}
      {home.photos && home.photos.length > 1 && (
        <ul className={s.gallery} aria-label={t("More photos of the place")}>
          {home.photos.slice(1).map((src, i) => (
            <li key={src}>
              <img
                src={src}
                alt={t("{title}, photo {n}", {
                  title: home.title ?? t("Room"),
                  n: i + 2,
                })}
              />
            </li>
          ))}
        </ul>
      )}
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
