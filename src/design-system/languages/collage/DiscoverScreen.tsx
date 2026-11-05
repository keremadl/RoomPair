"use client";
import { useRef } from "react";
import { AnimatePresence } from "motion/react";
import {
  Bell,
  Compass,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  RotateCcw,
  Smile,
  X,
} from "lucide-react";
import {
  Reveal,
  SwipeHero,
} from "@/design-system/components/SwipeCard/SwipeCard";
import { intentLabel, useDeck, type Mode } from "@/lib/discover/deck";
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
import {
  GroupTitle,
  HomeStickers,
  PersonStickers,
  FitBars,
} from "./components";

/** Language B — a fridge door of polaroids and stickers. */
export function CollageScreen({
  layout = "blocks",
}: {
  layout?: DetailsLayout;
}) {
  const deck = useDeck();
  const { profile: p, match: m } = deck;
  const home = homeSection(p);
  const person = personSection(p);
  const fit = fitSection(m);
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
        <button type="button" className={s.round} aria-label="Notifications">
          <Bell />
        </button>
      </header>

      <div className={s.scroll} ref={scroller}>
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

        <div className={s.stage}>
          <AnimatePresence initial={false} custom={deck.exitDirection}>
            <SwipeHero
              key={deck.cardKey}
              className={s.polaroid}
              onDecision={decide}
              tilt={22}
              spring={{ stiffness: 360, damping: 18 }}
              exit={(dir) => ({
                x: dir * 480,
                y: -40,
                rotate: dir * 30,
                opacity: 0,
                transition: { duration: 0.35 },
              })}
              stamps={{
                like: {
                  className: `${s.stamp} ${s.stampLike}`,
                  label: "Yes please!",
                },
                pass: { className: `${s.stamp} ${s.stampPass}`, label: "Nope" },
              }}
            >
              <span className={s.tape} aria-hidden="true" />
              <img
                src={p.photo}
                alt={p.name}
                draggable={false}
                className={s.photo}
              />
              <h2 className={s.polaroidCaption}>
                {p.name}, {p.age}
              </h2>
              <span className={s.matchSticker}>
                <strong>{m.score}%</strong>
                match
              </span>
              <span className={s.intentSticker}>{intentLabel(p)}</span>
            </SwipeHero>
          </AnimatePresence>
        </div>

        <div className={s.actions}>
          <button
            type="button"
            className={`${s.action} ${s.actionSmall}`}
            onClick={deck.undo}
            disabled={!deck.canUndo}
          >
            <RotateCcw />
            <span>Undo</span>
          </button>
          <button
            type="button"
            className={`${s.action} ${s.actionPass}`}
            onClick={() => decide("pass")}
          >
            <X />
            <span>Nope</span>
          </button>
          <button
            type="button"
            className={`${s.action} ${s.actionLike}`}
            onClick={() => decide("like")}
          >
            <Heart />
            <span>Like</span>
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
              panel: s.panel,
            }}
            headers={{
              home: <GroupTitle group="home" title={home.heading} />,
              person: <GroupTitle group="person" title={person.heading} />,
              fit: <GroupTitle group="fit" title={`Why ${fit.score}%?`} />,
            }}
            tabLabels={{
              home: home.kind === "listing" ? "Room" : "Home",
              person: p.name,
              fit: `Fit ${fit.score}%`,
            }}
            sections={{
              home: <HomeStickers home={home} />,
              person: <PersonStickers person={person} profile={p} />,
              fit: <FitBars fit={fit} />,
            }}
          />
          <p className={s.report}>
            <button type="button">Report</button>{" "}
            <button type="button">Block</button>
          </p>
        </Reveal>
      </div>

      <nav className={s.nav} aria-label="Main">
        {[
          { label: "Discover", icon: Compass },
          { label: "Likes", icon: Heart },
          { label: "Chats", icon: MessageCircle },
          { label: "Space", icon: Home },
          { label: "Me", icon: Smile },
        ].map(({ label, icon: Icon }, i) => (
          <button
            key={label}
            type="button"
            aria-current={i === 0 ? "page" : undefined}
            className={s.navItem}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
