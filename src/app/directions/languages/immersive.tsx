"use client";
import { useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Compass,
  GraduationCap,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  Smile,
  Timer,
  Wallet,
  X,
} from "lucide-react";
import { Reveal, SwipeHero } from "../shared/swipe-hero";
import {
  dateLabel,
  intentLabel,
  priceLabel,
  priceUnit,
  socialLabel,
  tidinessLabel,
  useDeck,
  you,
  type Mode,
} from "../shared/deck";
import type { SleepSchedule } from "@/lib/types";
import s from "./immersive.module.css";

const sleepStops: SleepSchedule[] = ["early", "flexible", "late"];

/** Language C — full-screen photo, the interface steps back. */
export function ImmersiveScreen() {
  const deck = useDeck();
  const { profile: p, match: m } = deck;
  const scroller = useRef<HTMLDivElement>(null);
  const [photo, setPhoto] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const photos = p.photos.length ? p.photos : [p.photo];
  const decide = (d: "like" | "pass") => {
    deck.decide(d);
    setPhoto(0);
    scroller.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={s.screen}>
      <img src={p.photo} alt="" aria-hidden="true" className={s.backdrop} />
      <div className={s.backdropShade} />

      <header className={s.top} data-scrolled={scrolled}>
        <span className={s.logo}>roompair</span>
        <div className={s.modes} role="radiogroup" aria-label="Search mode">
          {(["people", "rooms"] as Mode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={deck.mode === mode}
              className={s.mode}
              onClick={() => {
                deck.changeMode(mode);
                setPhoto(0);
              }}
            >
              {mode === "people" ? "People" : "Rooms"}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={s.glassButton}
          aria-label="Notifications"
        >
          <Bell />
        </button>
      </header>

      <div
        className={s.scroll}
        ref={scroller}
        onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 40)}
      >
        <div className={s.heroStage}>
          <AnimatePresence initial={false} custom={deck.exitDirection}>
            <SwipeHero
              key={deck.cardKey}
              className={s.hero}
              onDecision={decide}
              tilt={8}
              spring={{ stiffness: 160, damping: 26 }}
              exit={(dir) => ({
                x: dir * 460,
                opacity: 0,
                scale: 0.94,
                transition: { duration: 0.45, ease: [0.3, 0, 0.2, 1] },
              })}
              stamps={{
                like: {
                  className: `${s.stamp} ${s.stampLike}`,
                  label: "Roommate?",
                },
                pass: { className: `${s.stamp} ${s.stampPass}`, label: "Pass" },
              }}
            >
              <img
                src={photos[photo]}
                alt={`${p.name}, photo ${photo + 1}`}
                draggable={false}
                className={s.heroPhoto}
              />
              <div className={s.scrimTop} />
              <div className={s.scrim} />
              <div className={s.stories} aria-hidden="true">
                {photos.map((ph, i) => (
                  <span key={ph} data-on={i <= photo} />
                ))}
              </div>
              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    className={s.tapPrev}
                    aria-label="Previous photo"
                    onClick={() => setPhoto((i) => Math.max(0, i - 1))}
                  />
                  <button
                    type="button"
                    className={s.tapNext}
                    aria-label="Next photo"
                    onClick={() =>
                      setPhoto((i) => Math.min(photos.length - 1, i + 1))
                    }
                  />
                </>
              )}
              <div className={s.heroText}>
                <p className={s.intent}>
                  <span /> {intentLabel(p)} · {p.neighborhood}
                </p>
                <h2 className={s.name}>
                  {p.name}
                  <span>{p.age}</span>
                </h2>
                <p className={s.heroMeta}>
                  {priceLabel(p)} {priceUnit(p)} · from {dateLabel(p.moveDate)}
                </p>
                <p className={s.scrollHint}>
                  <ChevronDown aria-hidden="true" /> Scroll for {p.name}&rsquo;s
                  story
                </p>
              </div>
            </SwipeHero>
          </AnimatePresence>
        </div>

        <Reveal id={deck.cardKey} className={s.details}>
          <section className={s.glass}>
            <p className={s.lead}>{p.bio}</p>
            <ul className={s.facts}>
              <li>
                <Wallet /> <span>{p.room ? "Rent" : "Budget"}</span>{" "}
                {priceLabel(p)} <small>{priceUnit(p)}</small>
              </li>
              <li>
                <CalendarDays /> <span>Moving in</span> {dateLabel(p.moveDate)}
              </li>
              <li>
                <Timer /> <span>Staying</span> {p.stayMonths} months
              </li>
              <li>
                <MapPin /> <span>Area</span> {p.neighborhood}, {p.city}
              </li>
              <li>
                <GraduationCap /> <span>Studies</span> {p.university}
              </li>
              {p.verified && (
                <li>
                  <ShieldCheck /> <span>Checked</span> Student email (demo)
                </li>
              )}
            </ul>
          </section>

          <section className={s.quote}>
            <p className={s.quoteQ}>{p.prompt.question}</p>
            <p className={s.quoteA}>{p.prompt.answer}</p>
          </section>

          <section className={s.glass}>
            <h3 className={s.title}>Daily rhythm</h3>
            <div className={s.legend}>
              <span data-who="them">{p.name}</span>
              <span data-who="you">You</span>
            </div>
            <Track
              label="Tidiness"
              them={p.habits.cleanliness}
              you={you.cleanliness}
              ends={[tidinessLabel[1], tidinessLabel[5]]}
            />
            <Track
              label="Social energy"
              them={p.habits.social}
              you={you.social}
              ends={[socialLabel[1], socialLabel[5]]}
            />
            <Track
              label="Sleep"
              steps={3}
              them={sleepStops.indexOf(p.habits.sleep) + 1}
              you={sleepStops.indexOf(you.sleep) + 1}
              ends={["Early", "Late"]}
            />
            <p className={s.note}>
              {p.habits.smoking ? "Smokes" : "Smoke-free"} ·{" "}
              {p.habits.pets ? "Has a pet" : "No pets"}
            </p>
          </section>

          {p.room && (
            <section className={s.room}>
              <img src={p.room.photo} alt={p.room.title} />
              <div className={s.roomText}>
                <p className={s.roomPrice}>€{p.room.price} / month</p>
                <h3 className={s.roomTitle}>{p.room.title}</h3>
                <p>{p.room.description}</p>
              </div>
            </section>
          )}

          <section className={s.glass}>
            <p className={s.score}>
              {m.score}
              <span>% everyday fit</span>
            </p>
            <div className={s.lines}>
              {m.breakdown.map((row) => (
                <div key={row.label} className={s.line}>
                  <span>{row.label}</span>
                  <span className={s.lineTrack}>
                    <span style={{ width: `${row.score}%` }} />
                  </span>
                  <span className={s.lineValue}>{row.score}</span>
                </div>
              ))}
            </div>
            {m.considerations.length > 0 && (
              <p className={s.talk}>
                Worth talking about: {m.considerations.join(" · ")}
              </p>
            )}
            <p className={s.note}>
              A comparison of what you both said. Not a prediction.
            </p>
          </section>

          <p className={s.report}>
            <button type="button">Report</button>
            <button type="button">Block</button>
          </p>
        </Reveal>
      </div>

      <div className={s.dock}>
        <button
          type="button"
          className={s.dockSmall}
          aria-label="Undo"
          onClick={deck.undo}
          disabled={!deck.canUndo}
        >
          <RotateCcw />
        </button>
        <button
          type="button"
          className={s.dockPass}
          aria-label="Pass"
          onClick={() => decide("pass")}
        >
          <X />
        </button>
        <button
          type="button"
          className={s.dockLike}
          onClick={() => decide("like")}
        >
          <Heart /> Like
        </button>
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
            aria-label={label}
            aria-current={i === 0 ? "page" : undefined}
          >
            <Icon />
          </button>
        ))}
      </nav>
    </div>
  );
}

function Track({
  label,
  them,
  you: mine,
  steps = 5,
  ends,
}: {
  label: string;
  them: number;
  you: number;
  steps?: number;
  ends: [string, string];
}) {
  const at = (v: number) => `${((v - 1) / (steps - 1)) * 100}%`;
  return (
    <div className={s.track}>
      <p className={s.trackLabel}>{label}</p>
      <div
        className={s.trackLine}
        role="img"
        aria-label={`${label}: them ${them} of ${steps}, you ${mine} of ${steps}`}
      >
        {Array.from({ length: steps }, (_, i) => (
          <span key={i} className={s.tick} style={{ left: at(i + 1) }} />
        ))}
        <span className={s.dotThem} style={{ left: at(them) }} />
        <span className={s.dotYou} style={{ left: at(mine) }} />
      </div>
      <p className={s.trackEnds}>
        <span>{ends[0]}</span>
        <span>{ends[1]}</span>
      </p>
    </div>
  );
}
