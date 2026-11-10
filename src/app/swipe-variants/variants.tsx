"use client";
import { useState, type ReactNode } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Compass,
  Heart,
  Home,
  Info,
  MapPin,
  MessageCircle,
  RotateCcw,
  SlidersHorizontal,
  Smile,
  X,
} from "@/design-system/icons";
import { defaultPreferences, profiles } from "@/lib/data";
import { dateLabel } from "@/lib/discover/deck";
import { rankProfiles } from "@/lib/matching";
import type { MatchResult, Profile } from "@/lib/types";
import s from "./variants.module.css";

/** The deck a room seeker sees: hosts, best fit first. */
const deck = rankProfiles(profiles, defaultPreferences);

type Item = { profile: Profile; match: MatchResult };

function useDeck() {
  const [i, setI] = useState(0);
  const item: Item = deck[i % deck.length];
  return {
    ...item,
    next: () => setI((n) => n + 1),
    undo: () => setI((n) => Math.max(0, n - 1)),
    peek: (k: number) => deck[(i + k) % deck.length],
  };
}

const short = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

/** Phone frame: the same minimal bar and icon-only tab bar for every variant. */
function Phone({ children }: { children: ReactNode }) {
  return (
    <div className={s.phone}>
      <header className={s.bar}>
        <span className={s.logo}>roompair</span>
        <button type="button" className={s.barButton} aria-label="Filters">
          <SlidersHorizontal />
        </button>
      </header>
      <div className={s.screen}>{children}</div>
      <nav className={s.tabs} aria-label="Tabs">
        <Compass data-on="true" />
        <Heart />
        <MessageCircle />
        <Home />
        <Smile />
      </nav>
    </div>
  );
}

function Round({
  label,
  kind,
  onClick,
  children,
}: {
  label: string;
  kind: "pass" | "like" | "undo";
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={s.round}
      data-kind={kind}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Actions({
  d,
  floating = true,
}: {
  d: ReturnType<typeof useDeck>;
  floating?: boolean;
}) {
  return (
    <div className={s.actions} data-floating={floating || undefined}>
      <Round label="Undo" kind="undo" onClick={d.undo}>
        <RotateCcw />
      </Round>
      <Round label="Skip" kind="pass" onClick={d.next}>
        <X />
      </Round>
      <Round label="Team up" kind="like" onClick={d.next}>
        <Heart />
      </Round>
    </div>
  );
}

const Verified = ({ p }: { p: Profile }) =>
  p.verified ? (
    <BadgeCheck className={s.verified} aria-label="Verified" />
  ) : null;

/* 1 — Full photo: the person fills the card, name and two facts on top. */
function FullPhoto() {
  const d = useDeck();
  const p = d.profile;
  return (
    <Phone>
      <article className={s.full} key={p.id}>
        <img src={p.photo} alt={p.name} />
        <div className={s.overlay}>
          <h3 className={s.onName}>
            {p.name}, {p.age} <Verified p={p} />
          </h3>
          <p className={s.onLine}>
            <span className={s.fitChip}>{d.match.score}% fit</span>
            <span>
              €{p.room?.price} · {p.neighborhood}
            </span>
          </p>
        </div>
        <button type="button" className={s.info} aria-label="More about">
          <Info />
        </button>
      </article>
      <Actions d={d} />
    </Phone>
  );
}

/* 2 — Room first: the room fills the card, the host is a face on it. */
function RoomFirst() {
  const d = useDeck();
  const p = d.profile;
  return (
    <Phone>
      <article className={s.full} key={p.id}>
        <img src={p.room?.photo} alt={p.room?.title} />
        <span className={s.priceTag}>
          €{p.room?.price}
          <small>/month</small>
        </span>
        <div className={s.overlay}>
          <div className={s.hostRow}>
            <img className={s.face} src={p.photo} alt="" />
            <div>
              <h3 className={s.onName}>
                {p.name}, {p.age} <Verified p={p} />
              </h3>
              <p className={s.onLine}>
                <span className={s.fitChip}>{d.match.score}% fit</span>
                <span>From {short(p.moveDate)}</span>
              </p>
            </div>
          </div>
        </div>
      </article>
      <Actions d={d} />
    </Phone>
  );
}

/* 3 — Light card: the Card language kept, thinner. Type colour frame, name strip. */
function LightCard() {
  const d = useDeck();
  const p = d.profile;
  const host = p.intent === "have-room";
  return (
    <Phone>
      <article
        className={s.light}
        data-type={host ? "host" : "explorer"}
        key={p.id}
      >
        <div className={s.lightPhoto}>
          <img src={p.photo} alt={p.name} />
          <span className={s.typeChip}>{host ? "Host" : "Explorer"}</span>
          <span className={s.fitCoin}>{d.match.score}%</span>
        </div>
        <div className={s.strip}>
          <h3>
            {p.name} <Verified p={p} />
          </h3>
          <span className={s.age}>
            <small>Age</small> {p.age}
          </span>
        </div>
      </article>
      <Actions d={d} floating={false} />
    </Phone>
  );
}

/* 4 — Split: photo on top, three facts that decide below. */
function Split() {
  const d = useDeck();
  const p = d.profile;
  return (
    <Phone>
      <article className={s.split} key={p.id}>
        <div className={s.splitPhoto}>
          <img src={p.photo} alt={p.name} />
        </div>
        <div className={s.splitBody}>
          <div className={s.splitHead}>
            <h3>
              {p.name}, {p.age} <Verified p={p} />
            </h3>
            <span className={s.fitText}>{d.match.score}% fit</span>
          </div>
          <div className={s.meter} aria-hidden="true">
            <span style={{ width: `${d.match.score}%` }} />
          </div>
          <dl className={s.facts}>
            <div>
              <dt>Rent</dt>
              <dd>€{p.room?.price}</dd>
            </div>
            <div>
              <dt>From</dt>
              <dd>{short(p.moveDate)}</dd>
            </div>
            <div>
              <dt>Stay</dt>
              <dd>{p.stayMonths} mo</dd>
            </div>
          </dl>
          <Actions d={d} floating={false} />
        </div>
      </article>
    </Phone>
  );
}

/* 5 — Deck: the next people peek out behind the card. */
function Stack() {
  const d = useDeck();
  const p = d.profile;
  return (
    <Phone>
      <div className={s.stack}>
        <article className={s.behind} data-depth="2" aria-hidden="true">
          <img src={d.peek(2).profile.photo} alt="" />
        </article>
        <article className={s.behind} data-depth="1" aria-hidden="true">
          <img src={d.peek(1).profile.photo} alt="" />
        </article>
        <article className={`${s.full} ${s.top}`} key={p.id}>
          <img src={p.photo} alt={p.name} />
          <span className={s.bigFit}>
            {d.match.score}
            <small>%</small>
          </span>
          <div className={s.overlay}>
            <h3 className={s.onName}>
              {p.name}, {p.age} <Verified p={p} />
            </h3>
            <p className={s.onLine}>
              <MapPin aria-hidden="true" /> {p.neighborhood}
            </p>
          </div>
        </article>
      </div>
      <Actions d={d} />
    </Phone>
  );
}

/* 6 — Why you fit: the reason comes first, on the photo. */
function WhyFit() {
  const d = useDeck();
  const p = d.profile;
  const reasons = d.match.reasons.slice(0, 2);
  return (
    <Phone>
      <article className={s.full} key={p.id}>
        <img src={p.photo} alt={p.name} />
        <div
          className={s.ring}
          style={{ "--fit": d.match.score } as React.CSSProperties}
        >
          <span>{d.match.score}%</span>
        </div>
        <div className={s.overlay}>
          <h3 className={s.onName}>
            {p.name}, {p.age} <Verified p={p} />
          </h3>
          <ul className={s.reasons}>
            {reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <p className={s.onLine}>
            <CalendarDays aria-hidden="true" /> From {dateLabel(p.moveDate)}
          </p>
        </div>
      </article>
      <Actions d={d} />
    </Phone>
  );
}

const variants = [
  {
    id: "full-photo",
    name: "1 · Full photo",
    idea: "The person fills the card. Name, age, fit and rent sit on the photo; buttons overlap its edge.",
    View: FullPhoto,
  },
  {
    id: "room-first",
    name: "2 · Room first",
    idea: "For room seekers: the room fills the card, the host is a face on it. Rent at the top, fit and date at the bottom.",
    View: RoomFirst,
  },
  {
    id: "light-card",
    name: "3 · Light card",
    idea: "Our Card language, slimmed: thin type-colour frame, one name strip with Age, fit as a coin on the photo.",
    View: LightCard,
  },
  {
    id: "split",
    name: "4 · Split",
    idea: "Photo on top, then only what decides: fit meter, rent, move-in and stay. Buttons inside the panel.",
    View: Split,
  },
  {
    id: "stack",
    name: "5 · Deck",
    idea: "The next people peek out behind the card, so it feels like a hand of cards. Big fit number in the corner.",
    View: Stack,
  },
  {
    id: "why-fit",
    name: "6 · Why you fit",
    idea: "The reasons come first: a fit ring and the two strongest matching points written on the photo.",
    View: WhyFit,
  },
];

export function Variants() {
  return (
    <div className={s.page} data-direction="card">
      <header className={s.head}>
        <h1>Swipe screen · six variants</h1>
        <p>
          Same data in each: a room seeker looking at hosts, best fit first. The
          buttons work. Details (Room / Person / Fit) open by tapping or
          scrolling up, so they are not on the first screen.
        </p>
      </header>
      <div className={s.grid}>
        {variants.map(({ id, name, idea, View }) => (
          <section key={id} id={id} className={s.variant} aria-label={name}>
            <h2>{name}</h2>
            <p>{idea}</p>
            <View />
          </section>
        ))}
      </div>
    </div>
  );
}
