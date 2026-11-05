"use client";
import { Check, Handshake, Home, UserRound } from "lucide-react";
import { type MatchResult, type Profile } from "@/lib/discover/deck";
import { type GroupId } from "@/design-system/components/ProfileDetails/ProfileDetails";
import { type HomeSection, type PersonSection } from "@/lib/discover/sections";
import s from "./styles.module.css";

export type RoomId =
  "yours" | "theirs" | "kitchen" | "living" | "bath" | "hall";
export type Rect = [number, number, number, number];

export const rooms: { id: RoomId; rect: Rect }[] = [
  { id: "yours", rect: [10, 10, 120, 110] },
  { id: "bath", rect: [130, 10, 70, 70] },
  { id: "hall", rect: [130, 80, 70, 40] },
  { id: "theirs", rect: [200, 10, 130, 110] },
  { id: "kitchen", rect: [10, 120, 140, 120] },
  { id: "living", rect: [150, 120, 180, 120] },
];

export const groupIcon = {
  home: Home,
  person: UserRound,
  fit: Handshake,
} as const;

/** Drawing-sheet title: a sheet number and the group name. */
export function SheetTitle({
  group,
  number,
  title,
}: {
  group: GroupId;
  number: string;
  title: string;
}) {
  const Icon = groupIcon[group];
  return (
    <h3 className={s.sheetTitle} data-group={group}>
      <span className={s.sheetNo}>{number}</span>
      <Icon aria-hidden="true" />
      {title}
    </h3>
  );
}

/** The flat as an architect's plan. Only the home lives here. */
export function FlatDrawing({ profile: p }: { profile: Profile }) {
  const names: Record<RoomId, string> = {
    yours: p.room ? "Your room" : "Room 1 · you",
    theirs: p.room ? `${p.name}'s room` : `Room 2 · ${p.name}`,
    kitchen: "Kitchen",
    living: "Living room",
    bath: "Bath",
    hall: "Hall",
  };
  return (
    <svg
      viewBox="0 0 340 250"
      className={s.plan}
      role="img"
      aria-label={`Floor plan. ${names.yours} is highlighted.`}
    >
      <defs>
        <pattern
          id="plan-grid"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          <path d="M10 0H0V10" className={s.gridLine} />
        </pattern>
      </defs>
      <rect x="0" y="0" width="340" height="250" fill="url(#plan-grid)" />
      {rooms.map(({ id, rect: [x, y, w, h] }) => (
        <g key={id} className={s.room} data-room={id}>
          <rect x={x} y={y} width={w} height={h} className={s.roomShape} />
          <Furniture id={id} rect={[x, y, w, h]} />
          <text x={x + 8} y={y + 18} className={s.roomLabel}>
            {names[id]}
          </text>
          {id === "yours" && p.room && (
            <text x={x + 8} y={y + 36} className={s.roomPrice}>
              €{p.room.price}
            </text>
          )}
        </g>
      ))}
      <path d="M200 100 v18 M200 100 a18 18 0 0 0 -18 18" className={s.door} />
      <path d="M130 100 v18 M130 100 a18 18 0 0 1 18 18" className={s.door} />
      <path d="M180 120 h20 M180 120 a20 20 0 0 0 20 20" className={s.door} />
      <path d="M230 240 h30 M230 240 a30 30 0 0 1 30 -30" className={s.door} />
      <text x="232" y="235" className={s.entry}>
        Entry
      </text>
    </svg>
  );
}

export function SpecTable({
  rows,
}: {
  rows: { label: string; value: string; note?: string }[];
}) {
  return (
    <dl className={s.facts}>
      {rows.map((r) => (
        <div key={r.label}>
          <dt>{r.label}</dt>
          <dd>
            {r.value}
            {r.note && <small>{r.note}</small>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function HomeSpec({
  home,
  profile: p,
}: {
  home: HomeSection;
  profile: Profile;
}) {
  return (
    <>
      <FlatDrawing profile={p} />
      <SpecTable rows={home.facts} />
      {home.photo && (
        <img src={home.photo} alt={home.title ?? ""} className={s.roomPhoto} />
      )}
      {home.title && <h4 className={s.panelTitle}>{home.title}</h4>}
      <p className={s.text}>{home.description}</p>
    </>
  );
}

export function PersonSpec({
  person,
  name,
}: {
  person: PersonSection;
  name: string;
}) {
  return (
    <>
      <SpecTable rows={person.facts} />
      <p className={s.text}>{person.bio}</p>
      <div className={s.tags}>
        {person.interests.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
      <div className={s.note}>
        <p className={s.panelKicker}>{person.prompt.question}</p>
        <p className={s.answer}>{person.prompt.answer}</p>
      </div>
      <table className={s.habits}>
        <thead>
          <tr>
            <th scope="col">Habit</th>
            <th scope="col">{name}</th>
            <th scope="col">You</th>
          </tr>
        </thead>
        <tbody>
          {person.habits.map((h) => (
            <tr key={h.label}>
              <th scope="row">{h.label}</th>
              <td>{h.them}</td>
              <td data-same={h.same}>
                {h.same && <Check aria-label="works with you" />} {h.you}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export function Furniture({
  id,
  rect: [x, y, w, h],
}: {
  id: RoomId;
  rect: Rect;
}) {
  switch (id) {
    case "yours":
    case "theirs":
      return (
        <g className={s.furniture}>
          <rect x={x + w - 52} y={y + h - 62} width="42" height="52" rx="3" />
          <rect x={x + w - 48} y={y + h - 58} width="34" height="12" rx="2" />
        </g>
      );
    case "kitchen":
      return (
        <g className={s.furniture}>
          <rect x={x + 6} y={y + h - 26} width={w - 12} height="20" />
          <circle cx={x + w / 2} cy={y + h / 2 + 6} r="16" />
        </g>
      );
    case "living":
      return (
        <g className={s.furniture}>
          <rect x={x + w - 92} y={y + 30} width="76" height="26" rx="4" />
          <rect x={x + w - 72} y={y + 66} width="36" height="20" rx="2" />
        </g>
      );
    case "bath":
      return (
        <g className={s.furniture}>
          <rect x={x + 8} y={y + h - 30} width={w - 16} height="22" rx="8" />
        </g>
      );
    default:
      return null;
  }
}

export function Fit({ match: m }: { match: MatchResult }) {
  return (
    <section className={s.fitSection}>
      <p className={s.score}>
        {m.score}%<span> everyday fit</span>
      </p>
      <table className={s.table}>
        <tbody>
          {m.breakdown.map((b) => (
            <tr key={b.label}>
              <th scope="row">{b.label}</th>
              <td>
                <span className={s.bar}>
                  <span style={{ width: `${b.score}%` }} />
                </span>
              </td>
              <td>{b.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className={s.reasons}>
        {m.reasons.map((r) => (
          <li key={r}>
            <Check aria-hidden="true" /> {r}
          </li>
        ))}
      </ul>
      {m.considerations.length > 0 && (
        <p className={s.talk}>Talk about: {m.considerations.join(", ")}</p>
      )}
      <p className={s.small}>Based on what you both said. Not a prediction.</p>
    </section>
  );
}
