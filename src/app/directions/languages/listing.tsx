"use client";
import { useRef } from "react";
import { AnimatePresence } from "motion/react";
import { Bell, Check } from "lucide-react";
import { IconButton } from "@/design-system";
import { Reveal, SwipeHero } from "../shared/swipe-hero";
import {
  dateLabel,
  habitRows,
  intentLabel,
  lifestyleFacts,
  priceLabel,
  priceUnit,
  useDeck,
  weightOf,
  type Mode,
} from "../shared/deck";
import s from "./listing.module.css";

/** Language A — the profile as a well-typeset listing you read before you like. */
export function ListingScreen() {
  const deck = useDeck();
  const { profile: p, match: m } = deck;
  const scroller = useRef<HTMLDivElement>(null);
  const decide = (d: "like" | "pass") => {
    deck.decide(d);
    scroller.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={s.screen}>
      <header className={s.masthead}>
        <div>
          <p className={s.wordmark}>RoomPair</p>
          <p className={s.edition}>Riga · Spring move-ins</p>
        </div>
        <IconButton label="Notifications" icon={<Bell />} />
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
            {mode === "people" ? "People" : "Rooms"}
          </button>
        ))}
        <span className={s.count}>
          No. {deck.index + 1} of {deck.total}
        </span>
      </div>

      <div className={s.scroll} ref={scroller}>
        <div className={s.plateWrap}>
          <AnimatePresence initial={false} custom={deck.exitDirection}>
            <SwipeHero
              key={deck.cardKey}
              className={s.plate}
              onDecision={decide}
              tilt={0}
              spring={{ stiffness: 220, damping: 30 }}
              exit={(dir) => ({
                x: dir * 420,
                opacity: 0,
                transition: { duration: 0.32, ease: [0.3, 0, 1, 1] },
              })}
              stamps={{
                like: {
                  className: `${s.stamp} ${s.stampLike}`,
                  label: "Interested",
                },
                pass: {
                  className: `${s.stamp} ${s.stampPass}`,
                  label: "Not for me",
                },
              }}
            >
              <img
                src={p.photo}
                alt={p.name}
                draggable={false}
                className={s.photo}
              />
            </SwipeHero>
          </AnimatePresence>
          <p className={s.caption}>
            Fig. {deck.index + 1} — {p.name} in {p.neighborhood}. Drag the
            plate, or use the buttons below.
          </p>
        </div>

        <Reveal id={deck.cardKey} className={s.sheet}>
          <p className={s.kicker}>
            {intentLabel(p)} · {p.neighborhood}, {p.city}
          </p>
          <h2 className={s.name}>
            {p.name}, <span>{p.age}</span>
          </h2>
          <p className={s.standfirst}>{p.bio}</p>

          <dl className={s.spec}>
            <div>
              <dt>{p.room ? "Rent" : "Budget"}</dt>
              <dd>
                {priceLabel(p)} <small>{priceUnit(p)}</small>
              </dd>
            </div>
            <div>
              <dt>Moving in</dt>
              <dd>{dateLabel(p.moveDate)}</dd>
            </div>
            <div>
              <dt>Staying</dt>
              <dd>{p.stayMonths} months</dd>
            </div>
            <div>
              <dt>Studies</dt>
              <dd>
                {p.occupation}, {p.university}
              </dd>
            </div>
            <div>
              <dt>Checked</dt>
              <dd>{p.verified ? "Student email (demo)" : "Not yet"}</dd>
            </div>
          </dl>

          <figure className={s.quote}>
            <figcaption>{p.prompt.question}</figcaption>
            <blockquote>“{p.prompt.answer}”</blockquote>
          </figure>

          <section className={s.section}>
            <h3 className={s.sectionTitle}>House habits</h3>
            <table className={s.table}>
              <thead>
                <tr>
                  <th scope="col" />
                  <th scope="col">{p.name}</th>
                  <th scope="col">You</th>
                </tr>
              </thead>
              <tbody>
                {habitRows(p).map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    <td>
                      <Dots value={row.them} /> {row.scale[row.them]}
                    </td>
                    <td>
                      <Dots value={row.you} /> {row.scale[row.you]}
                    </td>
                  </tr>
                ))}
                {lifestyleFacts(p).map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    <td>{row.them}</td>
                    <td>{row.you}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {p.room && (
            <section className={s.section}>
              <h3 className={s.sectionTitle}>The room</h3>
              <img
                src={p.room.photo}
                alt={p.room.title}
                className={s.roomPhoto}
              />
              <div className={s.roomHead}>
                <p className={s.roomTitle}>{p.room.title}</p>
                <p className={s.roomPrice}>€{p.room.price}</p>
              </div>
              <p className={s.body}>{p.room.description}</p>
            </section>
          )}

          <section className={s.section}>
            <h3 className={s.sectionTitle}>How you compare</h3>
            <p className={s.total}>
              {m.score}
              <span> / 100 everyday fit</span>
            </p>
            <table className={s.ledger}>
              <thead>
                <tr>
                  <th scope="col">Factor</th>
                  <th scope="col">Weight</th>
                  <th scope="col">Match</th>
                </tr>
              </thead>
              <tbody>
                {m.breakdown.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">
                      {row.label}
                      <small>{row.detail.replace(/ · \d+% weight/, "")}</small>
                    </th>
                    <td>{weightOf(row.detail)}%</td>
                    <td>
                      <span className={s.bar}>
                        <span style={{ width: `${row.score}%` }} />
                      </span>
                      {row.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {m.considerations.length > 0 && (
              <div className={s.discuss}>
                <p className={s.discussTitle}>Worth talking about</p>
                <ul>
                  {m.considerations.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
            <ul className={s.reasons}>
              {m.reasons.map((r) => (
                <li key={r}>
                  <Check aria-hidden="true" /> {r}
                </li>
              ))}
            </ul>
            <p className={s.footnote}>
              A comparison of what you both said about everyday life. Not a
              prediction of how living together will go.
            </p>
          </section>

          <p className={s.colophon}>
            <button type="button">Report</button> ·{" "}
            <button type="button">Block</button>
          </p>
        </Reveal>
      </div>

      <footer className={s.decisionBar}>
        <button
          type="button"
          className={s.undo}
          onClick={deck.undo}
          disabled={!deck.canUndo}
        >
          Undo
        </button>
        <button type="button" className={s.pass} onClick={() => decide("pass")}>
          Not for me
        </button>
        <button type="button" className={s.like} onClick={() => decide("like")}>
          Interested
        </button>
      </footer>

      <nav className={s.nav} aria-label="Main">
        {["Discover", "Likes", "Messages", "My space", "Profile"].map(
          (label, i) => (
            <a
              key={label}
              href="#"
              aria-current={i === 0 ? "page" : undefined}
              onClick={(e) => e.preventDefault()}
            >
              {label}
            </a>
          ),
        )}
      </nav>
    </div>
  );
}

function Dots({ value }: { value: number }) {
  return (
    <span className={s.dots} aria-label={`${value} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} data-on={n <= value} />
      ))}
    </span>
  );
}
