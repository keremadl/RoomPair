"use client";
import type { DiscoverDeck, MatchResult, Profile } from "@/lib/discover/deck";
import type { Preferences } from "@/lib/types";
import { useRef } from "react";
import { AnimatePresence } from "motion/react";
import {
  BadgeCheck,
  Bell,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
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
} from "../../icons";
import { SwipeHero } from "@/design-system/components/SwipeCard/SwipeCard";
import { Reveal } from "@/design-system/components/Motion/Motion";
import { useText } from "@/design-system/text/TextProvider";
import {
  dateLabel,
  sleepLabel,
  useDeck,
  you,
  type Mode,
} from "@/lib/discover/deck";
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
import w from "./swipe.module.css";
import { Stat, Versus, Trait, Banner, HomeItem } from "./components";

/**
 * The swipeable card and its actions. Controlled: pass a deck.
 *
 * Two looks, picked by what the viewer is looking for:
 * - roomFirst (the viewer needs a room): the room photo fills the card,
 *   rent at the top, the host's face, name and fit at the bottom.
 * - otherwise (the viewer has a room): the person's photo fills the card,
 *   name, age, fit and budget on it.
 * Details open from the info button; the card itself stays simple.
 */
export function DiscoverCard({
  deck,
  roomFirst = false,
  onInfo,
  saved,
  onSave,
  preview = false,
  showUndo = true,
}: {
  deck: DiscoverDeck;
  /** Off where there is nothing to undo, e.g. a single person from Likes. */
  showUndo?: boolean;
  /** Your own card as others see it: no buttons, no fit score. */
  preview?: boolean;
  roomFirst?: boolean;
  /** Shows Home → Person → Fit for this profile (below the card in the app). */
  onInfo?: () => void;
  /** Room-first only: whether the room is saved, and the toggle. */
  saved?: boolean;
  onSave?: () => void;
}) {
  const t = useText();
  const { profile: p, match: m } = deck;
  const decide = deck.decide;
  const showRoom = roomFirst && !!p.room;
  const moveIn = dateLabel(p.moveDate);
  return (
    <div className={w.wrap}>
      <div className={w.stage}>
        <AnimatePresence initial={false} custom={deck.exitDirection}>
          <SwipeHero
            key={deck.cardKey}
            className={w.card}
            onDecision={decide}
            tilt={14}
            spring={{ stiffness: 320, damping: 24 }}
            exit={(dir) => ({
              x: dir * 480,
              rotate: dir * 20,
              opacity: 0,
              transition: { duration: 0.3 },
            })}
            stamps={{
              like: {
                className: `${s.stamp} ${s.stampLike}`,
                label: t("Team up!"),
              },
              pass: {
                className: `${s.stamp} ${s.stampPass}`,
                label: t("Skip"),
              },
            }}
          >
            <article className={w.photoCard} aria-label={`${p.name}, ${p.age}`}>
              {showRoom ? (
                <img
                  className={w.photo}
                  src={p.room!.photo}
                  alt={p.room!.title}
                  draggable={false}
                />
              ) : (
                <img
                  className={w.photo}
                  src={p.photo}
                  alt={p.name}
                  draggable={false}
                />
              )}
              {showRoom && (
                <span className={w.price}>
                  €{p.room!.price}
                  <small>{t("/month")}</small>
                </span>
              )}
              {showRoom && onSave && (
                <button
                  type="button"
                  className={w.save}
                  aria-label={saved ? t("Unsave room") : t("Save room")}
                  aria-pressed={saved}
                  onClick={onSave}
                >
                  {saved ? <BookmarkCheck /> : <Bookmark />}
                </button>
              )}
              <div className={w.overlay}>
                <div className={w.who}>
                  {showRoom && (
                    <img
                      className={w.face}
                      src={p.photo}
                      alt={p.name}
                      draggable={false}
                    />
                  )}
                  <div className={w.text}>
                    <h2 className={w.name}>
                      {p.name}, {p.age}
                      {p.verified && (
                        <BadgeCheck
                          className={w.verified}
                          aria-label={t("Verified")}
                        />
                      )}
                    </h2>
                    <p className={w.line}>
                      {!preview && (
                        <span className={w.fit}>
                          {m.score}% {t("fit")}
                        </span>
                      )}
                      {showRoom ? (
                        <span>{t("From {date}", { date: moveIn })}</span>
                      ) : (
                        <span>
                          €{p.budget[0]}–{p.budget[1]} · {p.neighborhood}
                        </span>
                      )}
                    </p>
                  </div>
                  {onInfo && (
                    <button
                      type="button"
                      className={w.info}
                      aria-label={t("More about {name}", { name: p.name })}
                      onClick={onInfo}
                    >
                      <ChevronDown />
                    </button>
                  )}
                </div>
              </div>
            </article>
          </SwipeHero>
        </AnimatePresence>
      </div>

      {!preview && (
        <div className={w.actions}>
          {showUndo && (
            <button
              type="button"
              className={w.round}
              data-kind="undo"
              onClick={deck.undo}
              disabled={!deck.canUndo}
              aria-label={t("Undo")}
            >
              <RotateCcw />
            </button>
          )}
          <button
            type="button"
            className={w.round}
            data-kind="pass"
            onClick={() => decide("pass")}
            aria-label={t("Skip")}
          >
            <X />
          </button>
          <button
            type="button"
            className={w.round}
            data-kind="like"
            onClick={() => decide("like")}
            aria-label={t("Team up")}
          >
            <Heart />
          </button>
        </div>
      )}
    </div>
  );
}

/** Home → Person → Fit for one profile, in blocks or tabs. */
export function DiscoverDetails({
  profile: p,
  match: m,
  layout = "blocks",
  onReport,
  viewer = you,
}: {
  profile: Profile;
  match: MatchResult;
  layout?: DetailsLayout;
  /** Whose answers "you" means; the demo user by default. */
  viewer?: Preferences;
  /** Opens report/block options; without it the links are inert (demos). */
  onReport?: () => void;
}) {
  const host = p.intent === "have-room";
  const home = homeSection(p);
  const person = personSection(p, viewer);
  const speaks = person.facts.find((f) => f.label === "Speaks");
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
                {speaks && <p className={s.meta}>Speaks {speaks.value}</p>}
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
              {person.prompts.map((pr) => (
                <section className={s.box} key={pr.question}>
                  <h4 className={s.title}>{pr.question}</h4>
                  <p className={s.quote}>{pr.answer}</p>
                </section>
              ))}
              <section className={s.box}>
                <h4 className={s.title}>Stats vs. you</h4>
                <Versus
                  label="Tidiness"
                  them={p.habits.cleanliness}
                  mine={viewer.cleanliness}
                  name={p.name}
                />
                <Versus
                  label="Social energy"
                  them={p.habits.social}
                  mine={viewer.social}
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
