"use client";
import { useRef } from "react";
import { AnimatePresence } from "motion/react";
import {
  Bell,
  Cigarette,
  Compass,
  Handshake,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  Moon,
  PawPrint,
  RotateCcw,
  Smile,
  UserRound,
  X,
} from "lucide-react";
import { Reveal, SwipeHero } from "../shared/swipe-hero";
import {
  habitRows,
  intentLabel,
  useDeck,
  type Mode,
  type Profile,
} from "../shared/deck";
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
import s from "./collage.module.css";

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

function Blocks({ value, who }: { value: number; who: "them" | "you" }) {
  return (
    <span
      className={s.blocks}
      data-who={who}
      aria-label={`${who === "you" ? "You" : "Them"}: ${value} of 5`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} data-on={n <= value} />
      ))}
    </span>
  );
}

const groupIcon = { home: Home, person: UserRound, fit: Handshake } as const;

function GroupTitle({ group, title }: { group: GroupId; title: string }) {
  const Icon = groupIcon[group];
  return (
    <h3 className={s.groupTitle} data-group={group}>
      <Icon aria-hidden="true" /> {title}
    </h3>
  );
}

const factColors = ["lime", "pink", "blue", "mint"];

function HomeStickers({ home }: { home: HomeSection }) {
  return (
    <>
      <div className={s.stickers}>
        {home.facts.map((f, i) => (
          <span key={f.label} className={s.sticker} data-color={factColors[i]}>
            <small>{f.label}</small> {f.value}
          </span>
        ))}
      </div>
      {home.facts[0].note && (
        <p className={s.small}>
          {home.facts[0].label}: {home.facts[0].note}
        </p>
      )}
      {home.photo ? (
        <figure className={s.roomPolaroid}>
          <span className={s.tape} aria-hidden="true" />
          <img src={home.photo} alt={home.title ?? ""} />
          <figcaption>{home.title}</figcaption>
        </figure>
      ) : null}
      <p className={home.photo ? s.roomText : s.searchNote}>
        {home.description}
      </p>
    </>
  );
}

const lifestyleIcon: Record<string, typeof Moon> = {
  Sleep: Moon,
  Smoking: Cigarette,
  Pets: PawPrint,
};

function PersonStickers({
  person,
  profile: p,
}: {
  person: PersonSection;
  profile: Profile;
}) {
  const [studies, checked] = person.facts;
  return (
    <>
      <p className={s.meta}>
        {studies.value} · {studies.note}
        {checked.value === "Student email" ? " · ✓ student email (demo)" : ""}
      </p>
      <p className={s.bio}>{person.bio}</p>
      <div className={s.tags}>
        {person.interests.map((t) => (
          <span key={t} className={s.tag}>
            {t}
          </span>
        ))}
      </div>
      <div className={s.bubble}>
        <p className={s.bubbleQ}>{person.prompt.question}</p>
        <p className={s.bubbleA}>{person.prompt.answer}</p>
      </div>
      <p className={s.subTitle}>Your vibes, side by side</p>
      <div className={s.legend}>
        <span data-who="them">{p.name}</span>
        <span data-who="you">You</span>
      </div>
      {habitRows(p).map((row) => (
        <div key={row.label} className={s.meter}>
          <p className={s.meterLabel}>
            {row.label}
            <small>
              {row.scale[row.them]} / {row.scale[row.you]}
            </small>
          </p>
          <Blocks value={row.them} who="them" />
          <Blocks value={row.you} who="you" />
        </div>
      ))}
      <div className={s.lifestyle}>
        {person.habits.slice(2).map((h) => {
          const Icon = lifestyleIcon[h.label];
          return (
            <div key={h.label} className={s.lifestyleItem}>
              <Icon aria-hidden="true" />
              <p>{h.label}</p>
              <strong>{h.them}</strong>
              <small>You: {h.you}</small>
            </div>
          );
        })}
      </div>
    </>
  );
}

function FitBars({ fit }: { fit: FitSection }) {
  return (
    <>
      <div className={s.bars}>
        {fit.breakdown.map((row) => (
          <div key={row.label} className={s.barRow}>
            <p>
              {row.label}
              <strong>{row.score}</strong>
            </p>
            <span className={s.barTrack}>
              <span
                className={s.barFill}
                data-level={
                  row.score >= 90 ? "high" : row.score >= 60 ? "mid" : "low"
                }
                style={{ width: `${row.score}%` }}
              />
            </span>
          </div>
        ))}
      </div>
      {fit.discuss.length > 0 && (
        <div className={s.talk}>
          <strong>Talk about:</strong> {fit.discuss.join(" · ")}
        </div>
      )}
      <p className={s.small}>
        Based on what you both said. It&rsquo;s a vibe check, not a promise.
      </p>
    </>
  );
}
