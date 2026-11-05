"use client";
import { useRef } from "react";
import { AnimatePresence } from "motion/react";
import {
  Bell,
  Check,
  Handshake,
  Heart,
  Home,
  MapPin,
  RotateCcw,
  UserRound,
  X,
} from "lucide-react";
import { Reveal, SwipeHero } from "../shared/swipe-hero";
import {
  intentLabel,
  useDeck,
  type MatchResult,
  type Mode,
  type Profile,
} from "../shared/deck";
import {
  ProfileDetails,
  type DetailsLayout,
  type GroupId,
} from "../shared/details";
import {
  homeSection,
  personSection,
  type HomeSection,
  type PersonSection,
} from "../shared/sections";
import s from "./plan.module.css";

type RoomId = "yours" | "theirs" | "kitchen" | "living" | "bath" | "hall";
type Rect = [number, number, number, number];

const rooms: { id: RoomId; rect: Rect }[] = [
  { id: "yours", rect: [10, 10, 120, 110] },
  { id: "bath", rect: [130, 10, 70, 70] },
  { id: "hall", rect: [130, 80, 70, 40] },
  { id: "theirs", rect: [200, 10, 130, 110] },
  { id: "kitchen", rect: [10, 120, 140, 120] },
  { id: "living", rect: [150, 120, 180, 120] },
];

/** Language E — the home you would share, drawn as a floor plan. */
export function PlanScreen({ layout = "blocks" }: { layout?: DetailsLayout }) {
  const deck = useDeck();
  const { profile: p, match: m } = deck;
  const home = homeSection(p);
  const person = personSection(p);
  const scroller = useRef<HTMLDivElement>(null);
  const decide = (d: "like" | "pass") => {
    deck.decide(d);
    scroller.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={s.screen}>
      <header className={s.top}>
        <span className={s.logo}>roompair</span>
        <span className={s.where}>
          <MapPin aria-hidden="true" /> Riga
        </span>
        <button
          type="button"
          className={s.iconButton}
          aria-label="Notifications"
        >
          <Bell />
        </button>
      </header>
      <div className={s.modes} role="radiogroup" aria-label="Search mode">
        {(["people", "rooms"] as Mode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={deck.mode === mode}
            className={s.mode}
            onClick={() => deck.changeMode(mode)}
          >
            {mode === "people" ? "Find people" : "Find a room"}
          </button>
        ))}
      </div>

      <div className={s.scroll} ref={scroller}>
        <div className={s.stage}>
          <AnimatePresence initial={false} custom={deck.exitDirection}>
            <SwipeHero
              key={deck.cardKey}
              className={s.card}
              onDecision={decide}
              tilt={4}
              exit={(dir) => ({
                x: dir * 440,
                opacity: 0,
                transition: { duration: 0.25 },
              })}
              stamps={{
                like: {
                  className: `${s.stamp} ${s.stampLike}`,
                  label: "Move in?",
                },
                pass: { className: `${s.stamp} ${s.stampPass}`, label: "Pass" },
              }}
            >
              <div className={s.tab}>
                <h2 className={s.name}>
                  {p.name}, {p.age}
                </h2>
                <span>{intentLabel(p)}</span>
              </div>
              <div className={s.frame}>
                <img
                  src={p.photo}
                  alt={p.name}
                  draggable={false}
                  className={s.photo}
                />
                <span className={s.dimension} aria-hidden="true">
                  {p.neighborhood}
                </span>
              </div>
            </SwipeHero>
          </AnimatePresence>
        </div>

        <div className={s.actions}>
          <button
            type="button"
            className={s.undo}
            onClick={deck.undo}
            disabled={!deck.canUndo}
            aria-label="Undo"
          >
            <RotateCcw />
          </button>
          <button
            type="button"
            className={s.pass}
            onClick={() => decide("pass")}
          >
            <X /> Pass
          </button>
          <button
            type="button"
            className={s.like}
            onClick={() => decide("like")}
          >
            <Heart /> Like
          </button>
        </div>

        <Reveal id={deck.cardKey} className={s.details}>
          <ProfileDetails
            layout={layout}
            classes={{
              blocks: s.sections,
              block: s.section,
              tabs: s.tabs,
              tab: s.tab,
              panel: s.tabPanel,
            }}
            headers={{
              home: (
                <SheetTitle group="home" number="01" title={home.heading} />
              ),
              person: (
                <SheetTitle group="person" number="02" title={person.heading} />
              ),
              fit: <SheetTitle group="fit" number="03" title="House fit" />,
            }}
            tabLabels={{
              home: home.kind === "listing" ? "Room" : "Home",
              person: p.name,
              fit: `Fit ${m.score}%`,
            }}
            sections={{
              home: <HomeSpec home={home} profile={p} />,
              person: <PersonSpec person={person} name={p.name} />,
              fit: <Fit match={m} />,
            }}
          />
          <p className={s.report}>
            <button type="button">Report</button> ·{" "}
            <button type="button">Block</button>
          </p>
        </Reveal>
      </div>

      <nav className={s.nav} aria-label="Main">
        {["Discover", "Likes", "Messages", "My space", "Profile"].map(
          (label, i) => (
            <button
              key={label}
              type="button"
              aria-current={i === 0 ? "page" : undefined}
            >
              {label}
            </button>
          ),
        )}
      </nav>
    </div>
  );
}

const groupIcon = { home: Home, person: UserRound, fit: Handshake } as const;

/** Drawing-sheet title: a sheet number and the group name. */
function SheetTitle({
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
function FlatDrawing({ profile: p }: { profile: Profile }) {
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

function SpecTable({
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

function HomeSpec({
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

function PersonSpec({ person, name }: { person: PersonSection; name: string }) {
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

function Furniture({ id, rect: [x, y, w, h] }: { id: RoomId; rect: Rect }) {
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

function Fit({ match: m }: { match: MatchResult }) {
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
