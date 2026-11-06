"use client";
import type { DiscoverDeck, MatchResult, Profile } from "@/lib/discover/deck";
import { useRef } from "react";
import { AnimatePresence } from "motion/react";
import {
  Bell,
  Check,
  Circle,
  Compass,
  Heart,
  Home,
  KeyRound,
  MessageCircle,
  Moon,
  Backpack,
  RotateCcw,
  Smile,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import {
  Reveal,
  SwipeHero,
} from "@/design-system/components/SwipeCard/SwipeCard";
import { sleepLabel, useDeck, you, type Mode } from "@/lib/discover/deck";
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
import { Stat, Versus, Trait, Banner, HomeItem } from "./components";

/** The swipeable card and its actions. Controlled: pass a deck. */
export function DiscoverCard({ deck }: { deck: DiscoverDeck }) {
  const { profile: p, match: m } = deck;
  const decide = deck.decide;
  const host = p.intent === "have-room";
  const home = homeSection(p);
  const person = personSection(p);
  const fit = fitSection(m);
  return (
    <>
      <div className={s.stage}>
        <AnimatePresence initial={false} custom={deck.exitDirection}>
          <SwipeHero
            key={deck.cardKey}
            className={s.card}
            onDecision={decide}
            tilt={16}
            spring={{ stiffness: 320, damping: 22 }}
            exit={(dir) => ({
              x: dir * 480,
              rotate: dir * 24,
              opacity: 0,
              transition: { duration: 0.3 },
            })}
            stamps={{
              like: {
                className: `${s.stamp} ${s.stampLike}`,
                label: "Team up!",
              },
              pass: { className: `${s.stamp} ${s.stampPass}`, label: "Skip" },
            }}
          >
            <div className={s.frame} data-type={host ? "host" : "explorer"}>
              <div className={s.cardHead}>
                <h2 className={s.name}>{p.name}</h2>
                <span className={s.level}>
                  <small>Age</small>
                  {p.age}
                </span>
              </div>
              <div className={s.window}>
                <img src={p.photo} alt={p.name} draggable={false} />
                <span className={s.type}>
                  {host ? (
                    <KeyRound aria-hidden="true" />
                  ) : (
                    <Backpack aria-hidden="true" />
                  )}
                  {host ? "Host" : "Explorer"}
                </span>
              </div>
              <p className={s.class}>
                {p.occupation} · {p.neighborhood}
              </p>
              <div className={s.stats}>
                <Stat label="Tidy" value={p.habits.cleanliness} />
                <Stat label="Social" value={p.habits.social} />
                <p className={s.statText}>
                  <Moon aria-hidden="true" /> {sleepLabel[p.habits.sleep]}
                </p>
              </div>
            </div>
          </SwipeHero>
        </AnimatePresence>
      </div>

      <div className={s.actions}>
        <button
          type="button"
          className={s.small}
          onClick={deck.undo}
          disabled={!deck.canUndo}
          aria-label="Undo"
        >
          <RotateCcw />
        </button>
        <button type="button" className={s.skip} onClick={() => decide("pass")}>
          <X /> Skip
        </button>
        <button type="button" className={s.team} onClick={() => decide("like")}>
          <Heart /> Team up
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
  const host = p.intent === "have-room";
  const home = homeSection(p);
  const person = personSection(p);
  const fit = fitSection(m);
  return (
    <Reveal id={p.id} className={s.details}>
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
            <Banner
              group="home"
              title={
                home.kind === "listing"
                  ? "Item: the room"
                  : "Quest: find a home"
              }
            />
          ),
          person: <Banner group="person" title={`${p.name}'s character`} />,
          fit: <Banner group="fit" title="Team fit" />,
        }}
        tabLabels={{
          home: home.kind === "listing" ? "Room" : "Home",
          person: p.name,
          fit: `${fit.score}% fit`,
        }}
        sections={{
          home: <HomeItem home={home} />,
          person: (
            <>
              <section className={s.box}>
                <p className={s.meta}>
                  {person.facts[0].value} · {person.facts[0].note}
                  {person.facts[1].value === "Student email"
                    ? " · email checked (demo)"
                    : ""}
                </p>
                <p>{person.bio}</p>
                <h4 className={s.subTitle}>Abilities</h4>
                <ul className={s.abilities}>
                  {person.interests.map((t) => (
                    <li key={t}>
                      <Sparkles aria-hidden="true" /> {t}
                    </li>
                  ))}
                </ul>
              </section>
              <section className={s.box}>
                <h4 className={s.title}>{person.prompt.question}</h4>
                <p className={s.quote}>{person.prompt.answer}</p>
              </section>
              <section className={s.box}>
                <h4 className={s.title}>Stats vs. you</h4>
                <Versus
                  label="Tidiness"
                  them={p.habits.cleanliness}
                  mine={you.cleanliness}
                  name={p.name}
                />
                <Versus
                  label="Social energy"
                  them={p.habits.social}
                  mine={you.social}
                  name={p.name}
                />
                <ul className={s.traits}>
                  {person.habits.slice(2).map((h) => (
                    <Trait
                      key={h.label}
                      ok={h.same}
                      text={`${h.label}: ${h.them} (you: ${h.you})`}
                    />
                  ))}
                </ul>
              </section>
            </>
          ),
          fit: (
            <section className={s.box}>
              <div className={s.xpHead}>
                <h4 className={s.title}>Fit</h4>
                <strong>{fit.score}%</strong>
              </div>
              <div
                className={s.xp}
                role="img"
                aria-label={`${fit.score} out of 100`}
              >
                <span style={{ width: `${fit.score}%` }} />
              </div>
              <h4 className={s.subTitle}>Quests</h4>
              <ul className={s.quests}>
                {fit.reasons.map((r) => (
                  <li key={r} data-done="true">
                    <Check aria-hidden="true" /> {r}
                  </li>
                ))}
                {fit.discuss.map((c) => (
                  <li key={c} data-done="false">
                    <Circle aria-hidden="true" /> Talk about: {c}
                  </li>
                ))}
                <li data-done="false">
                  <Circle aria-hidden="true" /> Agree on house rules together
                </li>
              </ul>
              <h4 className={s.subTitle}>Score sheet</h4>
              <dl className={s.sheet}>
                {fit.breakdown.map((b) => (
                  <div key={b.label}>
                    <dt>{b.label}</dt>
                    <dd>{b.score}</dd>
                  </div>
                ))}
              </dl>
              <p className={s.note}>
                The score compares what you both said. It is not a prediction.
              </p>
            </section>
          ),
        }}
      />
      <p className={s.report}>
        <button type="button" onClick={onReport}>
          Report
        </button>{" "}
        ·{" "}
        <button type="button" onClick={onReport}>
          Block
        </button>
      </p>
    </Reveal>
  );
}

/** Language F — every person is a collectible character card. */
export function CardScreen({ layout = "blocks" }: { layout?: DetailsLayout }) {
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
        <span className={s.logo}>
          <Star aria-hidden="true" /> roompair
        </span>
        <span className={s.counter}>
          Card {deck.index + 1}/{deck.total}
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
            {mode === "people" ? "All players" : "Hosts only"}
          </button>
        ))}
      </div>

      <div className={s.scroll} ref={scroller}>
        <DiscoverCard deck={{ ...deck, decide }} />
        <DiscoverDetails profile={p} match={m} layout={layout} />
      </div>

      <nav className={s.nav} aria-label="Main">
        {[
          { label: "Discover", icon: Compass },
          { label: "Likes", icon: Heart },
          { label: "Chats", icon: MessageCircle },
          { label: "Base", icon: Home },
          { label: "Me", icon: Smile },
        ].map(({ label, icon: Icon }, i) => (
          <button
            key={label}
            type="button"
            aria-current={i === 0 ? "page" : undefined}
          >
            <Icon />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
