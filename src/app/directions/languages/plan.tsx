"use client";
import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Bell,
  Check,
  Heart,
  MapPin,
  RotateCcw,
  X,
} from "lucide-react";
import { Reveal, SwipeHero } from "../shared/swipe-hero";
import {
  dateLabel,
  intentLabel,
  priceLabel,
  priceUnit,
  sleepLabel,
  socialLabel,
  tidinessLabel,
  useDeck,
  you,
  type MatchResult,
  type Mode,
  type Profile,
} from "../shared/deck";
import s from "./plan.module.css";

type RoomId = "yours" | "theirs" | "kitchen" | "living" | "bath" | "hall";
type Rect = [number, number, number, number];

const layout: { id: RoomId; rect: Rect }[] = [
  { id: "yours", rect: [10, 10, 120, 110] },
  { id: "bath", rect: [130, 10, 70, 70] },
  { id: "hall", rect: [130, 80, 70, 40] },
  { id: "theirs", rect: [200, 10, 130, 110] },
  { id: "kitchen", rect: [10, 120, 140, 120] },
  { id: "living", rect: [150, 120, 180, 120] },
];
const tourOrder: RoomId[] = [
  "yours",
  "theirs",
  "kitchen",
  "living",
  "bath",
  "hall",
];

/** Language E — the home you would share, drawn as a floor plan. */
export function PlanScreen() {
  const deck = useDeck();
  const { profile: p, match: m } = deck;
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

        <Reveal id={deck.cardKey}>
          <FloorPlan profile={p} />
          <Fit match={m} />
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

function FloorPlan({ profile: p }: { profile: Profile }) {
  const [selected, setSelected] = useState<RoomId>("yours");
  const names: Record<RoomId, string> = {
    yours: p.room ? "Your room" : "Room 1 · you",
    theirs: p.room ? `${p.name}'s room` : `Room 2 · ${p.name}`,
    kitchen: "Kitchen",
    living: "Living room",
    bath: "Bath",
    hall: "Hall",
  };
  const next = tourOrder[(tourOrder.indexOf(selected) + 1) % tourOrder.length];

  return (
    <section className={s.planSection}>
      <h3 className={s.title}>
        {p.room ? `${p.name}'s flat` : `The flat you'd find together`}
      </h3>
      <p className={s.lead}>
        Tap a room to read that part of {p.name}&rsquo;s profile.
      </p>

      <svg
        viewBox="0 0 340 250"
        className={s.plan}
        role="group"
        aria-label="Floor plan"
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
        {layout.map(({ id, rect: [x, y, w, h] }) => (
          <g
            key={id}
            role="button"
            tabIndex={0}
            aria-pressed={selected === id}
            aria-label={names[id]}
            className={s.room}
            data-room={id}
            data-selected={selected === id}
            onClick={() => setSelected(id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelected(id);
              }
            }}
          >
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
        {/* Doors: a gap in the wall and the swing of the door. */}
        <path
          d="M200 100 v18 M200 100 a18 18 0 0 0 -18 18"
          className={s.door}
        />
        <path d="M130 100 v18 M130 100 a18 18 0 0 1 18 18" className={s.door} />
        <path d="M180 120 h20 M180 120 a20 20 0 0 0 20 20" className={s.door} />
        <path
          d="M230 240 h30 M230 240 a30 30 0 0 1 30 -30"
          className={s.door}
        />
        <text x="232" y="235" className={s.entry}>
          Entry
        </text>
      </svg>

      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          className={s.panel}
          data-room={selected}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <p className={s.panelKicker}>{names[selected]}</p>
          <RoomDetail id={selected} profile={p} />
          <button
            type="button"
            className={s.next}
            onClick={() => setSelected(next)}
          >
            Next: {names[next]} <ArrowRight aria-hidden="true" />
          </button>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function RoomDetail({ id, profile: p }: { id: RoomId; profile: Profile }) {
  const compare = (
    label: string,
    them: string,
    mine: string,
    same: boolean,
  ) => (
    <div className={s.compare}>
      <span>{label}</span>
      <strong>{them}</strong>
      <em data-same={same}>
        {same ? (
          <>
            <Check aria-hidden="true" /> Same as you
          </>
        ) : (
          `You: ${mine}`
        )}
      </em>
    </div>
  );
  const sections: Record<RoomId, ReactNode> = {
    yours: p.room ? (
      <>
        <img src={p.room.photo} alt={p.room.title} className={s.roomPhoto} />
        <h4 className={s.panelTitle}>{p.room.title}</h4>
        <p>{p.room.description}</p>
      </>
    ) : (
      <>
        <h4 className={s.panelTitle}>
          No room yet. You&rsquo;d look together.
        </h4>
        <p>
          {p.name}&rsquo;s budget is {priceLabel(p)} {priceUnit(p)}. Yours is €
          {you.budgetMin}–€{you.budgetMax}.
        </p>
      </>
    ),
    theirs: (
      <>
        <h4 className={s.panelTitle}>{p.occupation}</h4>
        <p>{p.bio}</p>
        {compare(
          "Sleep",
          sleepLabel[p.habits.sleep],
          sleepLabel[you.sleep],
          p.habits.sleep === you.sleep,
        )}
        <p className={s.small}>{p.university}</p>
      </>
    ),
    kitchen: (
      <>
        <h4 className={s.panelTitle}>{p.prompt.question}</h4>
        <p className={s.answer}>{p.prompt.answer}</p>
      </>
    ),
    living: (
      <>
        {compare(
          "Social energy",
          socialLabel[p.habits.social],
          socialLabel[you.social],
          p.habits.social === you.social,
        )}
        <div className={s.tags}>
          {p.tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </>
    ),
    bath: (
      <>
        {compare(
          "Tidiness",
          tidinessLabel[p.habits.cleanliness],
          tidinessLabel[you.cleanliness],
          p.habits.cleanliness === you.cleanliness,
        )}
        {compare(
          "Smoking",
          p.habits.smoking ? "Smokes" : "Smoke-free",
          "Smoke-free",
          !p.habits.smoking,
        )}
        {compare(
          "Pets",
          p.habits.pets ? "Has a pet" : "No pets",
          "Pets welcome",
          true,
        )}
      </>
    ),
    hall: (
      <>
        <dl className={s.facts}>
          <div>
            <dt>Moving in</dt>
            <dd>{dateLabel(p.moveDate)}</dd>
          </div>
          <div>
            <dt>Staying</dt>
            <dd>{p.stayMonths} months</dd>
          </div>
          <div>
            <dt>Area</dt>
            <dd>
              {p.neighborhood}, {p.city}
            </dd>
          </div>
          <div>
            <dt>Checked</dt>
            <dd>{p.verified ? "Student email (demo)" : "Not yet"}</dd>
          </div>
        </dl>
      </>
    ),
  };
  return <div className={s.detail}>{sections[id]}</div>;
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
      <div className={s.fitHead}>
        <h3 className={s.title}>House fit</h3>
        <p className={s.score}>{m.score}%</p>
      </div>
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
