"use client";
import { useRef } from "react";
import { AnimatePresence } from "motion/react";
import {
  Bell,
  CalendarDays,
  Cigarette,
  Compass,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  Moon,
  PawPrint,
  RotateCcw,
  Smile,
  Timer,
  Wallet,
  X,
} from "lucide-react";
import { Reveal, SwipeHero } from "../shared/swipe-hero";
import {
  habitRows,
  intentLabel,
  lifestyleFacts,
  priceLabel,
  priceUnit,
  shortDate,
  useDeck,
  type Mode,
} from "../shared/deck";
import s from "./collage.module.css";

const lifestyleIcon = {
  Sleep: Moon,
  Smoking: Cigarette,
  Pets: PawPrint,
} as const;

/** Language B — a fridge door of polaroids and stickers. */
export function CollageScreen() {
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
          <div className={s.stickers}>
            <span className={s.sticker} data-color="lime">
              <Wallet /> {priceLabel(p)} <small>{priceUnit(p)}</small>
            </span>
            <span className={s.sticker} data-color="pink">
              <CalendarDays /> {shortDate(p.moveDate)}
            </span>
            <span className={s.sticker} data-color="blue">
              <Timer /> {p.stayMonths} mo
            </span>
            <span className={s.sticker} data-color="mint">
              <MapPin /> {p.neighborhood}
            </span>
          </div>

          <p className={s.bio}>{p.bio}</p>
          <p className={s.meta}>
            {p.occupation} · {p.university}
            {p.verified ? " · ✓ student email (demo)" : ""}
          </p>

          <div className={s.tags}>
            {p.tags.map((t) => (
              <span key={t} className={s.tag}>
                {t}
              </span>
            ))}
          </div>

          <div className={s.bubble}>
            <p className={s.bubbleQ}>{p.prompt.question}</p>
            <p className={s.bubbleA}>{p.prompt.answer}</p>
          </div>

          <section className={s.block}>
            <h3 className={s.blockTitle}>Your vibes, side by side</h3>
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
              {lifestyleFacts(p).map((f) => {
                const Icon =
                  lifestyleIcon[f.label as keyof typeof lifestyleIcon];
                return (
                  <div key={f.label} className={s.lifestyleItem}>
                    <Icon aria-hidden="true" />
                    <p>{f.label}</p>
                    <strong>{f.them}</strong>
                    <small>You: {f.you}</small>
                  </div>
                );
              })}
            </div>
          </section>

          {p.room && (
            <section className={s.block}>
              <h3 className={s.blockTitle}>The room</h3>
              <figure className={s.roomPolaroid}>
                <span className={s.tape} aria-hidden="true" />
                <img src={p.room.photo} alt={p.room.title} />
                <figcaption>{p.room.title}</figcaption>
                <span className={s.priceSticker}>€{p.room.price}</span>
              </figure>
              <p className={s.roomText}>{p.room.description}</p>
            </section>
          )}

          <section className={s.block}>
            <h3 className={s.blockTitle}>Why {m.score}%?</h3>
            <div className={s.bars}>
              {m.breakdown.map((row) => (
                <div key={row.label} className={s.barRow}>
                  <p>
                    {row.label}
                    <strong>{row.score}</strong>
                  </p>
                  <span className={s.barTrack}>
                    <span
                      className={s.barFill}
                      data-level={
                        row.score >= 90
                          ? "high"
                          : row.score >= 60
                            ? "mid"
                            : "low"
                      }
                      style={{ width: `${row.score}%` }}
                    />
                  </span>
                </div>
              ))}
            </div>
            {m.considerations.length > 0 && (
              <div className={s.talk}>
                <strong>Talk about:</strong> {m.considerations.join(" · ")}
              </div>
            )}
            <p className={s.small}>
              Based on what you both said. It&rsquo;s a vibe check, not a
              promise.
            </p>
          </section>

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
