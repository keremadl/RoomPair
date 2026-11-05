"use client";
import { type ReactNode } from "react";
import { Handshake, Home, UserRound } from "lucide-react";
import { you } from "@/lib/discover/deck";
import { type GroupId } from "@/design-system/components/ProfileDetails/ProfileDetails";
import s from "./styles.module.css";

export type Time = "morning" | "day" | "evening" | "night";

export function Moment({
  time,
  clock,
  icon,
  title,
  same,
  children,
}: {
  time: Time;
  clock: string;
  icon: ReactNode;
  title: string;
  same?: boolean;
  children: ReactNode;
}) {
  return (
    <li className={s.moment} data-time={time}>
      <span className={s.clock}>{clock}</span>
      <span className={s.node}>{icon}</span>
      <div className={s.momentBody}>
        <p className={s.momentTitle}>
          {title}
          {same !== undefined && (
            <span className={same ? s.same : s.differ}>
              {same ? "Same as you" : "A bit different"}
            </span>
          )}
        </p>
        <p className={s.momentText}>{children}</p>
      </div>
    </li>
  );
}

export function MoveCalendar({
  theirs,
  yours,
}: {
  theirs: string;
  yours: string;
}) {
  const d = new Date(theirs);
  const y = new Date(yours);
  const year = d.getFullYear();
  const month = d.getMonth();
  const first = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array(first).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  const yourDay =
    y.getFullYear() === year && y.getMonth() === month ? y.getDate() : null;
  return (
    <div className={s.calendar}>
      <p className={s.month}>
        {d.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
      </p>
      <div className={s.weekdays} aria-hidden="true">
        {["M", "T", "W", "T", "F", "S", "S"].map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
      <div className={s.days}>
        {cells.map((day, i) => (
          <span
            key={i}
            className={s.day}
            data-theirs={day === d.getDate()}
            data-yours={day !== null && day === yourDay}
          >
            {day}
          </span>
        ))}
      </div>
      <p className={s.legend}>
        <span data-key="theirs" /> Their move-in <span data-key="yours" /> Yours
      </p>
    </div>
  );
}

export function BudgetBar({
  min,
  max,
  price,
  range,
}: {
  min: number;
  max: number;
  price?: number;
  range: [number, number];
}) {
  const lo = 200;
  const hi = 900;
  const at = (v: number) => `${((v - lo) / (hi - lo)) * 100}%`;
  return (
    <div className={s.budget}>
      <div className={s.track}>
        <span
          className={s.yourRange}
          style={{ left: at(min), width: `calc(${at(max)} - ${at(min)})` }}
        />
        {price ? (
          <span className={s.priceMark} style={{ left: at(price) }}>
            <span>€{price}</span>
          </span>
        ) : (
          <span
            className={s.theirRange}
            style={{
              left: at(range[0]),
              width: `calc(${at(range[1])} - ${at(range[0])})`,
            }}
          />
        )}
      </div>
      <p className={s.budgetText}>
        {price ? (
          <>
            Rent is <strong>€{price} a month</strong>. Your budget is €{min}–€
            {max}, so it fits.
          </>
        ) : (
          <>
            Their budget is{" "}
            <strong>
              €{range[0]}–€{range[1]}
            </strong>
            , yours is €{min}–€{max}.
          </>
        )}
      </p>
    </div>
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
      <span>
        <Icon aria-hidden="true" />
      </span>
      {title}
    </h3>
  );
}
