"use client";
import type { DiscoverDeck, MatchResult, Profile } from "@/lib/discover/deck";
import { useRef } from "react";
import { AnimatePresence } from "motion/react";
import { Bell, Heart, MapPin, RotateCcw, X } from "lucide-react";
import {
  Reveal,
  SwipeHero,
} from "@/design-system/components/SwipeCard/SwipeCard";
import { useDeck, type Mode } from "@/lib/discover/deck";
import {
  ProfileDetails,
  type DetailsLayout,
} from "@/design-system/components/ProfileDetails/ProfileDetails";
import {
  fitSection,
  homeSection,
  personSection,
} from "@/lib/discover/sections";
import s from "./styles.module.css";
import { Band, HomeBands, PersonBands, FitBand } from "./components";

/** The swipeable card and its actions. Controlled: pass a deck. */
export function DiscoverCard({ deck }: { deck: DiscoverDeck }) {
  const { profile: p, match: m } = deck;
  const decide = deck.decide;
  const fit = fitSection(m);
  const home = homeSection(p);
  const person = personSection(p);
  return (
    <>
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
    </>
  );
}

/** Home → Person → Fit for one profile, in blocks or tabs. */
export function DiscoverDetails({
  profile: p,
  match: m,
  layout = "blocks",
  onReport,
}: {
  profile: Profile;
  match: MatchResult;
  layout?: DetailsLayout;
  /** Opens report/block options; without it the links are inert (demos). */
  onReport?: () => void;
}) {
  const fit = fitSection(m);
  const home = homeSection(p);
  const person = personSection(p);
  return (
    <Reveal id={p.id}>
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
        <button type="button" onClick={onReport}>
          Report
        </button>
        <button type="button" onClick={onReport}>
          Block
        </button>
      </p>
    </Reveal>
  );
}

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
        <DiscoverCard deck={{ ...deck, decide }} />
        <DiscoverDetails profile={p} match={m} layout={layout} />
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
