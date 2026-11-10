"use client";
import { KeyRound, Star, Trophy } from "../../icons";
import { useText } from "@/design-system/text/TextProvider";
import { type GroupId } from "@/design-system/components/ProfileDetails/ProfileDetails";
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
