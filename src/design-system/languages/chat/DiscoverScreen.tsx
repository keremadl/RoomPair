"use client";
import type { DiscoverDeck, MatchResult, Profile } from "@/lib/discover/deck";
import { useRef } from "react";
import { AnimatePresence } from "motion/react";
import {
  Bell,
  Building2,
  ChevronDown,
  Compass,
  Heart,
  Home,
  MessageCircle,
  RotateCcw,
  Smile,
  Users,
  X,
} from "lucide-react";
import { Button, IconButton, SegmentedControl } from "@/design-system";
import {
  SwipeHero,
  Reveal,
} from "@/design-system/components/SwipeCard/SwipeCard";
import { useDeck } from "@/lib/discover/deck";
import {
  ProfileDetails,
  type DetailsLayout,
  type GroupId,
} from "@/design-system/components/ProfileDetails/ProfileDetails";
import {
  fitSection,
  homeSection,
  personSection,
} from "@/lib/discover/sections";
import s from "./styles.module.css";
import {
  icons,
  Divider,
  HomeThread,
  PersonThread,
  FitCard,
} from "./components";

/** The swipeable card and its actions. Controlled: pass a deck. */
export function DiscoverCard({ deck }: { deck: DiscoverDeck }) {
  const { profile: p, match: m } = deck;
  const decide = deck.decide;
  const home = homeSection(p);
  const person = personSection(p);
  const fit = fitSection(m);
  const titles: Record<GroupId, string> = {
    home: home.heading,
    person: person.heading,
    fit: "How you fit",
  };
  return (
    <>
      <div className={s.stage}>
        <AnimatePresence initial={false} custom={deck.exitDirection}>
          <SwipeHero
            key={deck.cardKey}
            className={s.card}
            onDecision={decide}
            tilt={10}
            exit={(dir) => ({
              x: dir * 460,
              rotate: dir * 12,
              opacity: 0,
              transition: { duration: 0.3 },
            })}
            stamps={{
              like: {
                className: `${s.stamp} ${s.stampLike}`,
                label: "Say hi",
              },
              pass: { className: `${s.stamp} ${s.stampPass}`, label: "Pass" },
            }}
          >
            <img
              src={p.photo}
              alt={p.name}
              draggable={false}
              className={s.photo}
            />
            <div className={s.label}>
              <h2 className={s.name}>
                {p.name}, {p.age}
              </h2>
              <p className={s.sub}>
                {p.intent === "have-room" ? "Has a room" : "Looking together"} ·{" "}
                {p.neighborhood}
              </p>
            </div>
          </SwipeHero>
        </AnimatePresence>
      </div>

      <div className={s.actions}>
        <IconButton
          label="Undo"
          icon={<RotateCcw />}
          variant="outline"
          onClick={deck.undo}
          disabled={!deck.canUndo}
        />
        <Button
          variant="secondary"
          size="lg"
          leadingIcon={<X />}
          onClick={() => decide("pass")}
        >
          Pass
        </Button>
        <Button
          size="lg"
          leadingIcon={<Heart />}
          onClick={() => decide("like")}
        >
          Say hi
        </Button>
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
  const home = homeSection(p);
  const person = personSection(p);
  const fit = fitSection(m);
  const titles: Record<GroupId, string> = {
    home: home.heading,
    person: person.heading,
    fit: "How you fit",
  };
  return (
    <Reveal id={p.id}>
      <ProfileDetails
        layout={layout}
        classes={{
          blocks: s.blocks,
          block: s.block,
          tabs: s.tabs,
          tab: s.tab,
          panel: s.panel,
        }}
        headers={{
          home: <Divider group="home" title={titles.home} />,
          person: <Divider group="person" title={titles.person} />,
          fit: <Divider group="fit" title={titles.fit} />,
        }}
        tabLabels={{
          home: (
            <>
              {icons.home} {home.kind === "listing" ? "Room" : "Home"}
            </>
          ),
          person: (
            <>
              {icons.person} {p.name}
            </>
          ),
          fit: (
            <>
              {icons.fit} {fit.score}%
            </>
          ),
        }}
        sections={{
          home: <HomeThread home={home} />,
          person: <PersonThread person={person} name={p.name} />,
          fit: <FitCard fit={fit} />,
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

/** Language A — the profile as a first conversation with a future flatmate. */
export function ChatScreen({ layout = "blocks" }: { layout?: DetailsLayout }) {
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
        <Button variant="ghost" size="sm" trailingIcon={<ChevronDown />}>
          Riga
        </Button>
        <IconButton label="Notifications" icon={<Bell />} />
      </header>

      <div className={s.scroll} ref={scroller}>
        <SegmentedControl
          label="Search mode"
          fullWidth
          value={deck.mode}
          onChange={deck.changeMode}
          options={[
            { value: "people", label: "Find people", icon: <Users /> },
            { value: "rooms", label: "Find a room", icon: <Building2 /> },
          ]}
        />

        <DiscoverCard deck={{ ...deck, decide }} />
        <DiscoverDetails profile={p} match={m} layout={layout} />
      </div>

      <nav className={s.nav} aria-label="Main">
        {[
          { label: "Discover", icon: Compass },
          { label: "Likes", icon: Heart },
          { label: "Messages", icon: MessageCircle },
          { label: "My space", icon: Home },
          { label: "Profile", icon: Smile },
        ].map(({ label, icon: Icon }, i) => (
          <button
            key={label}
            type="button"
            className={s.navItem}
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
