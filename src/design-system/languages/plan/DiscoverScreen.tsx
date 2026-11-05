"use client";
import { useRef } from "react";
import { AnimatePresence } from "motion/react";
import { Bell, Heart, Home, MapPin, RotateCcw, X } from "lucide-react";
import {
  Reveal,
  SwipeHero,
} from "@/design-system/components/SwipeCard/SwipeCard";
import {
  intentLabel,
  useDeck,
  type Mode,
  type Profile,
} from "@/lib/discover/deck";
import {
  ProfileDetails,
  type DetailsLayout,
} from "@/design-system/components/ProfileDetails/ProfileDetails";
import { homeSection, personSection } from "@/lib/discover/sections";
import s from "./styles.module.css";
import { SheetTitle, HomeSpec, PersonSpec, Fit } from "./components";

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
