"use client";
import { useRef } from "react";
import { AnimatePresence } from "motion/react";
import {
  Bell,
  CalendarDays,
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
  Timer,
  X,
} from "lucide-react";
import { Reveal, SwipeHero } from "../shared/swipe-hero";
import {
  shortDate,
  sleepLabel,
  useDeck,
  you,
  type Mode,
  type Profile,
} from "../shared/deck";
import s from "./card.module.css";

/** Language F — every person is a collectible character card. */
export function CardScreen() {
  const deck = useDeck();
  const { profile: p, match: m } = deck;
  const scroller = useRef<HTMLDivElement>(null);
  const decide = (d: "like" | "pass") => {
    deck.decide(d);
    scroller.current?.scrollTo({ top: 0, behavior: "smooth" });
  };
  const host = p.intent === "have-room";

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
                    <small>LV</small>
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
                <div className={s.coins}>
                  <span>
                    <strong>
                      {p.room ? `€${p.room.price}` : `€${p.budget[1]}`}
                    </strong>
                    {p.room ? "/mo" : " max"}
                  </span>
                  <span>
                    <CalendarDays aria-hidden="true" /> {shortDate(p.moveDate)}
                  </span>
                  <span>
                    <Timer aria-hidden="true" /> {p.stayMonths} mo
                  </span>
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
          <button
            type="button"
            className={s.skip}
            onClick={() => decide("pass")}
          >
            <X /> Skip
          </button>
          <button
            type="button"
            className={s.team}
            onClick={() => decide("like")}
          >
            <Heart /> Team up
          </button>
        </div>

        <Reveal id={deck.cardKey} className={s.details}>
          <section className={s.box}>
            <h3 className={s.title}>Bio</h3>
            <p>{p.bio}</p>
            <h3 className={s.subTitle}>Abilities</h3>
            <ul className={s.abilities}>
              {p.tags.map((t) => (
                <li key={t}>
                  <Sparkles aria-hidden="true" /> {t}
                </li>
              ))}
            </ul>
          </section>

          <section className={s.box}>
            <h3 className={s.title}>{p.prompt.question}</h3>
            <p className={s.quote}>{p.prompt.answer}</p>
          </section>

          <section className={s.box}>
            <h3 className={s.title}>Stats vs. you</h3>
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
              <Trait
                ok={p.habits.sleep === you.sleep}
                text={`Sleep: ${sleepLabel[p.habits.sleep]} (you: ${sleepLabel[you.sleep]})`}
              />
              <Trait
                ok={!p.habits.smoking}
                text={p.habits.smoking ? "Smokes" : "Smoke-free"}
              />
              <Trait
                ok
                text={
                  p.habits.pets ? "Has a pet (you welcome pets)" : "No pets"
                }
              />
            </ul>
          </section>

          {p.room && <RoomItem profile={p} />}

          <section className={s.box}>
            <div className={s.xpHead}>
              <h3 className={s.title}>Team fit</h3>
              <strong>{m.score} XP</strong>
            </div>
            <div
              className={s.xp}
              role="img"
              aria-label={`${m.score} out of 100`}
            >
              <span style={{ width: `${m.score}%` }} />
            </div>
            <h3 className={s.subTitle}>Quests</h3>
            <ul className={s.quests}>
              {m.reasons.map((r) => (
                <li key={r} data-done="true">
                  <Check aria-hidden="true" /> {r}
                </li>
              ))}
              {m.considerations.map((c) => (
                <li key={c} data-done="false">
                  <Circle aria-hidden="true" /> Talk about: {c}
                </li>
              ))}
              <li data-done="false">
                <Circle aria-hidden="true" /> Agree on house rules together
              </li>
            </ul>
            <h3 className={s.subTitle}>Score sheet</h3>
            <dl className={s.sheet}>
              {m.breakdown.map((b) => (
                <div key={b.label}>
                  <dt>{b.label}</dt>
                  <dd>{b.score}</dd>
                </div>
              ))}
            </dl>
            <p className={s.note}>
              XP compares what you both said. It is not a prediction.
            </p>
          </section>

          <p className={s.report}>
            <button type="button">Report</button> ·{" "}
            <button type="button">Block</button>
          </p>
        </Reveal>
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className={s.stat}>
      <span>{label}</span>
      <span className={s.pips} aria-label={`${value} of 5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <i key={n} data-on={n <= value} />
        ))}
      </span>
    </div>
  );
}

function Versus({
  label,
  them,
  mine,
  name,
}: {
  label: string;
  them: number;
  mine: number;
  name: string;
}) {
  return (
    <div className={s.versus}>
      <p>
        {label}
        {them === mine && <span className={s.match}>Match</span>}
      </p>
      <div className={s.vsRow}>
        <span>{name}</span>
        <span className={s.pips} data-who="them">
          {[1, 2, 3, 4, 5].map((n) => (
            <i key={n} data-on={n <= them} />
          ))}
        </span>
      </div>
      <div className={s.vsRow}>
        <span>You</span>
        <span className={s.pips} data-who="you">
          {[1, 2, 3, 4, 5].map((n) => (
            <i key={n} data-on={n <= mine} />
          ))}
        </span>
      </div>
    </div>
  );
}

function Trait({ ok, text }: { ok: boolean; text: string }) {
  return (
    <li data-ok={ok}>
      {ok ? <Check aria-hidden="true" /> : <Circle aria-hidden="true" />} {text}
    </li>
  );
}

function RoomItem({ profile: p }: { profile: Profile }) {
  if (!p.room) return null;
  return (
    <section className={s.item}>
      <img src={p.room.photo} alt={p.room.title} />
      <div>
        <p className={s.itemKind}>
          <KeyRound aria-hidden="true" /> Item: room
        </p>
        <h3 className={s.title}>{p.room.title}</h3>
        <p className={s.itemPrice}>€{p.room.price} / month</p>
        <p>{p.room.description}</p>
      </div>
    </section>
  );
}
