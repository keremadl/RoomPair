"use client";
import { useRef } from "react";
import { AnimatePresence } from "motion/react";
import { Bell, Check, Heart, MapPin, RotateCcw, X } from "lucide-react";
import { Reveal, SwipeHero } from "../shared/swipe-hero";
import {
  habitRows,
  lifestyleFacts,
  shortDate,
  useDeck,
  type Mode,
} from "../shared/deck";
import s from "./poster.module.css";

/** Language C — flat colour bands and huge numbers on a square grid. */
export function PosterScreen() {
  const deck = useDeck();
  const { profile: p, match: m } = deck;
  const scroller = useRef<HTMLDivElement>(null);
  const decide = (d: "like" | "pass") => {
    deck.decide(d);
    scroller.current?.scrollTo({ top: 0 });
  };
  const price = p.room ? `€${p.room.price}` : `€${p.budget[1]}`;

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

        <Reveal id={deck.cardKey}>
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

          <section className={s.grid} aria-label="Key facts">
            <div className={s.tile} data-band="sky">
              <strong>{price}</strong>
              <span>{p.room ? "a month" : "max budget"}</span>
            </div>
            <div className={s.tile} data-band="mint">
              <strong>{shortDate(p.moveDate)}</strong>
              <span>move in</span>
            </div>
            <div className={s.tile} data-band="lilac">
              <strong>{p.stayMonths}</strong>
              <span>months</span>
            </div>
            <div className={s.tile} data-band="ink">
              <strong>{m.score}%</strong>
              <span>everyday fit</span>
            </div>
          </section>

          <section className={s.band}>
            <p className={s.bio}>{p.bio}</p>
            <p className={s.meta}>
              {p.occupation} at {p.university}
              {p.verified ? " · student email checked (demo)" : ""}
            </p>
            <p className={s.tags}>{p.tags.join(" / ")}</p>
          </section>

          <section className={s.band} data-band="blue">
            <p className={s.question}>{p.prompt.question}</p>
            <p className={s.answer}>{p.prompt.answer}</p>
          </section>

          <section className={s.band}>
            <h3 className={s.title}>Day to day</h3>
            <div className={s.compare}>
              <div className={s.compareHead}>
                <span />
                <span>{p.name}</span>
                <span>You</span>
              </div>
              {habitRows(p).map((r) => (
                <div key={r.label} className={s.compareRow}>
                  <span className={s.compareLabel}>{r.label}</span>
                  <span className={s.big} data-same={r.them === r.you}>
                    {r.them}
                    <small>/5</small>
                  </span>
                  <span className={s.big}>
                    {r.you}
                    <small>/5</small>
                  </span>
                </div>
              ))}
              {lifestyleFacts(p).map((f) => (
                <div key={f.label} className={s.compareRow}>
                  <span className={s.compareLabel}>{f.label}</span>
                  <span className={s.word}>{f.them}</span>
                  <span className={s.word}>{f.you}</span>
                </div>
              ))}
            </div>
          </section>

          {p.room && (
            <section className={s.room}>
              <img src={p.room.photo} alt={p.room.title} />
              <div className={s.roomBand}>
                <p className={s.roomPrice}>€{p.room.price}</p>
                <h3 className={s.roomTitle}>{p.room.title}</h3>
                <p className={s.roomText}>{p.room.description}</p>
              </div>
            </section>
          )}

          <section className={s.band} data-band="sky">
            <p className={s.score}>
              {m.score}
              <span>/100 fit</span>
            </p>
            <div className={s.bars}>
              {m.breakdown.map((b) => (
                <div key={b.label} className={s.barRow}>
                  <span>{b.label}</span>
                  <strong>{b.score}</strong>
                  <span className={s.barTrack}>
                    <span style={{ width: `${b.score}%` }} />
                  </span>
                </div>
              ))}
            </div>
            <ul className={s.reasons}>
              {m.reasons.map((r) => (
                <li key={r}>
                  <Check aria-hidden="true" /> {r}
                </li>
              ))}
            </ul>
            {m.considerations.length > 0 && (
              <p className={s.talk}>
                Talk about: {m.considerations.join(", ")}
              </p>
            )}
            <p className={s.note}>
              Compares what you both said. Not a prediction.
            </p>
          </section>

          <p className={s.report}>
            <button type="button">Report</button>
            <button type="button">Block</button>
          </p>
        </Reveal>
      </div>

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
