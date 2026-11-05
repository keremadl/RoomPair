"use client";
import { useRef } from "react";
import { AnimatePresence } from "motion/react";
import { Bell, Check, Heart, MapPin, RotateCcw, X } from "lucide-react";
import { Reveal, SwipeHero } from "../shared/swipe-hero";
import { habitRows, useDeck, type Mode, type Profile } from "../shared/deck";
import {
  ProfileDetails,
  type DetailsLayout,
  type GroupId,
} from "../shared/details";
import {
  fitSection,
  homeSection,
  personSection,
  type FitSection,
  type HomeSection,
  type PersonSection,
} from "../shared/sections";
import s from "./poster.module.css";

/** Language C — flat colour bands and huge numbers on a square grid. */
export function PosterScreen({
  layout = "blocks",
}: {
  layout?: DetailsLayout;
}) {
  const deck = useDeck();
  const { profile: p, match: m } = deck;
  const scroller = useRef<HTMLDivElement>(null);
  const decide = (d: "like" | "pass") => {
    deck.decide(d);
    scroller.current?.scrollTo({ top: 0 });
  };
  const home = homeSection(p);
  const person = personSection(p);
  const fit = fitSection(m);

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
              className={s.hero}
              onDecision={decide}
              tilt={0}
              spring={{ stiffness: 500, damping: 40 }}
              exit={(dir) => ({
                x: dir * 420,
                transition: { duration: 0.18, ease: "easeIn" },
              })}
              stamps={{
                like: { className: `${s.stamp} ${s.stampLike}`, label: "Like" },
                pass: { className: `${s.stamp} ${s.stampPass}`, label: "Pass" },
              }}
            >
              <img
                src={p.photo}
                alt={p.name}
                draggable={false}
                className={s.photo}
              />
              <span className={s.counter}>
                {deck.index + 1}/{deck.total}
              </span>
            </SwipeHero>
          </AnimatePresence>
        </div>

        <Reveal id={deck.cardKey}>
          <section className={s.nameBand}>
            <h2 className={s.name}>
              {p.name}, {p.age}
            </h2>
            <p className={s.nameSub}>
              {p.intent === "have-room"
                ? `Has a room in ${p.neighborhood}`
                : `Looking to share, near ${p.neighborhood}`}
            </p>
          </section>

          <ProfileDetails
            layout={layout}
            classes={{
              blocks: s.sections,
              block: s.section,
              tabs: s.tabs,
              tab: s.tab,
              panel: s.panel,
            }}
            headers={{
              home: <Band group="home" title={home.heading} />,
              person: <Band group="person" title={person.heading} />,
              fit: <Band group="fit" title="How you fit" />,
            }}
            tabLabels={{
              home: home.kind === "listing" ? "Room" : "Home",
              person: p.name,
              fit: `Fit ${fit.score}%`,
            }}
            sections={{
              home: <HomeBands home={home} />,
              person: <PersonBands person={person} profile={p} />,
              fit: <FitBand fit={fit} />,
            }}
          />

          <p className={s.report}>
            <button type="button">Report</button>
            <button type="button">Block</button>
          </p>
        </Reveal>
      </div>

      <div className={s.decide}>
        <button
          type="button"
          className={s.undo}
          onClick={deck.undo}
          disabled={!deck.canUndo}
          aria-label="Undo"
        >
          <RotateCcw />
        </button>
        <button type="button" className={s.pass} onClick={() => decide("pass")}>
          <X /> Pass
        </button>
        <button type="button" className={s.like} onClick={() => decide("like")}>
          <Heart /> Like
        </button>
      </div>
      <nav className={s.nav} aria-label="Main">
        {["Discover", "Likes", "Chats", "Space", "Me"].map((label, i) => (
          <button
            key={label}
            type="button"
            aria-current={i === 0 ? "page" : undefined}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function Band({ group, title }: { group: GroupId; title: string }) {
  return (
    <h3 className={s.groupBand} data-group={group}>
      {title}
    </h3>
  );
}

const tileColors = ["sky", "mint", "lilac", "paper"];

function HomeBands({ home }: { home: HomeSection }) {
  return (
    <>
      <div className={s.grid}>
        {home.facts.map((f, i) => (
          <div
            key={f.label}
            className={s.tile}
            data-band={tileColors[i]}
            data-long={f.value.length > 11}
          >
            <span className={s.tileLabel}>{f.label}</span>
            <strong>{f.value}</strong>
            {f.note && <span>{f.note}</span>}
          </div>
        ))}
      </div>
      {home.photo ? (
        <div className={s.room}>
          <img src={home.photo} alt={home.title ?? ""} />
          <div className={s.roomBand}>
            <p className={s.roomTitle}>{home.title}</p>
            <p className={s.roomText}>{home.description}</p>
          </div>
        </div>
      ) : (
        <div className={s.band}>
          <p className={s.bio}>{home.description}</p>
        </div>
      )}
    </>
  );
}

function PersonBands({
  person,
  profile: p,
}: {
  person: PersonSection;
  profile: Profile;
}) {
  const [studies, checked] = person.facts;
  return (
    <>
      <div className={s.band}>
        <p className={s.bio}>{person.bio}</p>
        <p className={s.meta}>
          {studies.value} at {studies.note}
          {checked.value === "Student email"
            ? " · student email checked (demo)"
            : ""}
        </p>
        <p className={s.tags}>{person.interests.join(" / ")}</p>
      </div>
      <div className={s.band} data-band="blue">
        <p className={s.question}>{person.prompt.question}</p>
        <p className={s.answer}>{person.prompt.answer}</p>
      </div>
      <div className={s.band}>
        <p className={s.title}>Day to day</p>
        <div className={s.compare}>
          <div className={s.compareHead}>
            <span />
            <span>{p.name}</span>
            <span>You</span>
          </div>
          {habitRows(p).map((r) => (
            <div key={r.label} className={s.compareRow}>
              <span className={s.compareLabel}>{r.label}</span>
              <span className={s.big} data-same={r.them === r.you}>
                {r.them}
                <small>/5</small>
              </span>
              <span className={s.big}>
                {r.you}
                <small>/5</small>
              </span>
            </div>
          ))}
          {person.habits.slice(2).map((h) => (
            <div key={h.label} className={s.compareRow}>
              <span className={s.compareLabel}>{h.label}</span>
              <span className={s.word}>{h.them}</span>
              <span className={s.word}>{h.you}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function FitBand({ fit }: { fit: FitSection }) {
  return (
    <div className={s.band} data-band="mint">
      <p className={s.score}>
        {fit.score}
        <span>/100 fit</span>
      </p>
      <div className={s.bars}>
        {fit.breakdown.map((b) => (
          <div key={b.label} className={s.barRow}>
            <span>{b.label}</span>
            <strong>{b.score}</strong>
            <span className={s.barTrack}>
              <span style={{ width: `${b.score}%` }} />
            </span>
          </div>
        ))}
      </div>
      <ul className={s.reasons}>
        {fit.reasons.map((r) => (
          <li key={r}>
            <Check aria-hidden="true" /> {r}
          </li>
        ))}
      </ul>
      {fit.discuss.length > 0 && (
        <p className={s.talk}>Talk about: {fit.discuss.join(", ")}</p>
      )}
      <p className={s.note}>Compares what you both said. Not a prediction.</p>
    </div>
  );
}
