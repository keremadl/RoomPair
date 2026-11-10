"use client";
import type { DiscoverDeck, MatchResult, Profile } from "@/lib/discover/deck";
import type { Preferences } from "@/lib/types";
import {
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { AnimatePresence } from "motion/react";
import {
  Backpack,
  BadgeCheck,
  Bath,
  Bell,
  Building2,
  Bus,
  CalendarDays,
  ChevronDown,
  Check,
  Cigarette,
  Circle,
  Clock,
  Compass,
  Handshake,
  Heart,
  Home,
  Languages,
  ListChecks,
  MapPin,
  MessageCircle,
  MessageSquareQuote,
  Moon,
  PartyPopper,
  PawPrint,
  PiggyBank,
  Receipt,
  RotateCcw,
  ScrollText,
  Smile,
  Sofa,
  Sparkles,
  Star,
  Sun,
  Trophy,
  UserRound,
  Users,
  Volume2,
  Wallet,
  X,
} from "../../icons";
import {
  DetailPhoto,
  DetailSection,
  FactChips,
  FactRows,
  PullQuote,
} from "@/design-system/components/DetailSection/DetailSection";
import { SwipeHero } from "@/design-system/components/SwipeCard/SwipeCard";
import { Reveal } from "@/design-system/components/Motion/Motion";
import { useText } from "@/design-system/text/TextProvider";
import { dateLabel, useDeck, you, type Mode } from "@/lib/discover/deck";
import {
  ProfileDetails,
  type DetailsLayout,
} from "@/design-system/components/ProfileDetails/ProfileDetails";
import {
  fitSection,
  homeSection,
  personSection,
  type Chip,
} from "@/lib/discover/sections";
import s from "./styles.module.css";
import w from "./swipe.module.css";
import { Banner } from "./components";

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
}) {
  const t = useText();
  const { profile: p, match: m } = deck;
  const decide = deck.decide;
  const showRoom = roomFirst && !!p.room;
  const moveIn = dateLabel(p.moveDate);
  // Every photo on the card, in order: the room's photos first when the
  // viewer is looking for a room, then the person's. Tap right / left to step.
  const roomShots = showRoom
    ? (p.room!.photos?.length ? p.room!.photos : [p.room!.photo]).map(
        (src) => ({ src, alt: p.room!.title, room: true }),
      )
    : [];
  const personShots = (p.photos.length ? p.photos : [p.photo]).map((src) => ({
    src,
    alt: p.name,
    room: false,
  }));
  const shots = [...roomShots, ...personShots].filter(
    (shot, i, all) => all.findIndex((x) => x.src === shot.src) === i,
  );
  // Back to the first photo whenever a new card comes up.
  const [pos, setPos] = useState({ key: deck.cardKey, i: 0 });
  const shot = pos.key === deck.cardKey ? Math.min(pos.i, shots.length - 1) : 0;
  const current = shots[shot];
  const step = (by: number) =>
    setPos({
      key: deck.cardKey,
      i: Math.max(0, Math.min(shots.length - 1, shot + by)),
    });
  // A drag that ends over a tap zone must not count as a tap.
  const downX = useRef(0);
  const tap = (by: number) => ({
    onPointerDown: (e: PointerEvent) => {
      downX.current = e.clientX;
    },
    onClick: (e: MouseEvent) => {
      if (Math.abs(e.clientX - downX.current) < 10 || e.detail === 0) step(by);
    },
  });
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
            <article
              className={w.photoCard}
              aria-label={`${p.name}, ${p.age}`}
              data-shots={shots.length > 1 || undefined}
            >
              <img
                className={w.photo}
                src={current.src}
                alt={current.alt}
                draggable={false}
              />
              {shots.length > 1 && (
                <>
                  <div className={w.bars} aria-hidden="true">
                    {shots.map((x, i) => (
                      <span key={x.src} data-on={i === shot || undefined} />
                    ))}
                  </div>
                  <button
                    type="button"
                    className={w.tapPrev}
                    aria-label={t("Previous photo")}
                    disabled={shot === 0}
                    {...tap(-1)}
                  />
                  <button
                    type="button"
                    className={w.tapNext}
                    aria-label={t("Next photo")}
                    disabled={shot === shots.length - 1}
                    {...tap(1)}
                  />
                </>
              )}
              {showRoom && (
                <span className={w.price}>
                  €{p.room!.price}
                  <small>{t("/month")}</small>
                </span>
              )}
              <div className={w.overlay}>
                <div className={w.who}>
                  {showRoom && current.room && (
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

/** The icon of each short fact, by the id the content model gives it. */
const chipIcon: Record<string, ReactNode> = {
  rent: <Wallet />,
  bills: <Receipt />,
  deposit: <PiggyBank />,
  date: <CalendarDays />,
  stay: <Clock />,
  furniture: <Sofa />,
  bathroom: <Bath />,
  flatmates: <Users />,
  area: <MapPin />,
  tidiness: <Sparkles />,
  social: <Users />,
  sleep: <Moon />,
  smoking: <Cigarette />,
  pets: <PawPrint />,
  guests: <PartyPopper />,
  homeDays: <Sun />,
  noise: <Volume2 />,
  sharing: <Handshake />,
};

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
  const t = useText();
  const home = homeSection(p, t);
  const person = personSection(p, viewer, t);
  const work = person.facts.find((f) => f.id === "work");
  const checked = p.verified;
  const speaks = person.facts.find((f) => f.id === "speaks");
  const fit = fitSection(m, t);
  // The first room photo is already on the card above.
  const roomPhotos = (home.photos ?? []).slice(1);
  const photoAlt = (n: number) =>
    t("{title}, photo {n}", { title: home.title ?? t("Room"), n });
  const withIcons = (chips: Chip[]) =>
    chips.map((chip) => ({ text: chip.text, icon: chipIcon[chip.id] }));
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
        // In tabs the tab itself names the group; blocks keep their banners.
        headers={{
          home:
            layout === "tabs" ? null : (
              <Banner
                group="home"
                title={
                  home.kind === "listing"
                    ? t("Item: the room")
                    : t("Quest: find a home")
                }
              />
            ),
          person:
            layout === "tabs" ? null : (
              <Banner
                group="person"
                title={t("{name}'s character", { name: p.name })}
              />
            ),
          fit:
            layout === "tabs" ? null : (
              <Banner group="fit" title={t("Team fit")} />
            ),
        }}
        tabLabels={{
          home: home.kind === "listing" ? t("Room") : t("Home"),
          person: p.name,
          fit: `${fit.score}% ${t("fit")}`,
        }}
        sections={{
          home: (
            <>
              <DetailSection icon={<Home />} label={home.heading}>
                {home.title && <PullQuote>{home.title}</PullQuote>}
                {!home.title && <p>{home.description}</p>}
              </DetailSection>
              <DetailSection icon={<Wallet />} label={t("Rent and dates")}>
                <FactChips items={withIcons(home.money)} />
              </DetailSection>
              {home.title && home.description && (
                <DetailSection
                  icon={<ScrollText />}
                  label={t("About the place")}
                >
                  <p>{home.description}</p>
                </DetailSection>
              )}
              {roomPhotos[0] && (
                <DetailPhoto src={roomPhotos[0]} alt={photoAlt(2)} />
              )}
              <DetailSection
                icon={<Sofa />}
                label={home.kind === "listing" ? t("The home") : t("Where")}
              >
                <FactChips items={withIcons(home.place)} />
              </DetailSection>
              {home.transport && (
                <DetailSection icon={<Bus />} label={t("Getting there")}>
                  <p>{home.transport}</p>
                </DetailSection>
              )}
              {home.rules && (
                <DetailSection icon={<ListChecks />} label={t("House rules")}>
                  <p>{home.rules}</p>
                </DetailSection>
              )}
              {roomPhotos.slice(1).map((src, i) => (
                <DetailPhoto key={src} src={src} alt={photoAlt(i + 3)} />
              ))}
            </>
          ),
          person: (
            <>
              {person.bio && (
                <DetailSection icon={<Smile />} label={person.heading}>
                  <p>{person.bio}</p>
                </DetailSection>
              )}
              <DetailSection icon={<UserRound />} label={t("Essentials")}>
                <FactRows
                  items={[
                    ...(work?.value
                      ? [{ icon: <Backpack />, text: work.value }]
                      : []),
                    ...(work?.note
                      ? [{ icon: <Building2 />, text: work.note }]
                      : []),
                    ...(speaks
                      ? [{ icon: <Languages />, text: speaks.value }]
                      : []),
                    ...(checked
                      ? [
                          {
                            icon: <BadgeCheck />,
                            text: t("Student email checked (demo)"),
                          },
                        ]
                      : []),
                  ]}
                />
              </DetailSection>
              {person.prompts[0] && (
                <DetailSection
                  icon={<MessageSquareQuote />}
                  label={person.prompts[0].question}
                >
                  <PullQuote>{person.prompts[0].answer}</PullQuote>
                </DetailSection>
              )}
              {p.photos[1] && (
                <DetailPhoto
                  src={p.photos[1]}
                  alt={t("{name}, photo {n}", { name: p.name, n: 2 })}
                />
              )}
              {person.interests.length > 0 && (
                <DetailSection icon={<Sparkles />} label={t("Interests")}>
                  <FactChips
                    items={person.interests.map((text) => ({
                      text,
                      tone: "interest" as const,
                    }))}
                  />
                </DetailSection>
              )}
              <DetailSection
                icon={<Sofa />}
                label={t("At home, {name} is", { name: p.name })}
              >
                <FactChips
                  items={person.habits.map((h) => ({
                    icon: chipIcon[h.id],
                    // "Sometimes" or "Flexible" alone would not say what about.
                    text: ["social", "sleep", "guests"].includes(h.id)
                      ? `${h.label}: ${h.them}`
                      : h.them,
                  }))}
                />
              </DetailSection>
              {person.prompts.slice(1).map((pr) => (
                <DetailSection
                  key={pr.question}
                  icon={<MessageSquareQuote />}
                  label={pr.question}
                >
                  <PullQuote>{pr.answer}</PullQuote>
                </DetailSection>
              ))}
            </>
          ),
          fit: (
            <>
              <DetailSection icon={<Trophy />} label={t("How you fit")}>
                <div className={s.fitHead}>
                  <strong>{fit.score}%</strong>
                  <span>{fit.summary}</span>
                </div>
                <div
                  className={s.xp}
                  role="img"
                  aria-label={t("{score} out of 100", { score: fit.score })}
                >
                  <span style={{ width: `${fit.score}%` }} />
                </div>
                <FactChips
                  items={[
                    ...fit.breakdown.map((b) => ({
                      text: b.label,
                      same: b.score >= 90,
                    })),
                    // The habits the score does not already list by name.
                    ...person.habits
                      .filter(
                        (h) => !["tidiness", "social", "sleep"].includes(h.id),
                      )
                      .map((h) => ({ text: h.label, same: h.same })),
                  ].map(({ text, same }) => ({
                    text,
                    icon: same ? <Check /> : <Circle />,
                    tone: same ? ("match" as const) : ("differ" as const),
                  }))}
                />
              </DetailSection>
              {fit.reasons.length > 0 && (
                <DetailSection icon={<Check />} label={t("What lines up")}>
                  <FactRows
                    items={fit.reasons.map((text) => ({
                      icon: <Check />,
                      text,
                    }))}
                  />
                </DetailSection>
              )}
              <DetailSection
                icon={<MessageCircle />}
                label={t("To talk about")}
              >
                <FactRows
                  items={[
                    ...fit.discuss,
                    t("Agree on house rules together"),
                  ].map((text) => ({ icon: <Circle />, text }))}
                />
              </DetailSection>
              <p className={s.note}>
                {t(
                  "The score compares what you both said. It is not a prediction.",
                )}
              </p>
            </>
          ),
        }}
      />
      <p className={s.report}>
        <button type="button" onClick={onReport}>
          {t("Report")}
        </button>{" "}
        ·{" "}
        <button type="button" onClick={onReport}>
          {t("Block")}
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
