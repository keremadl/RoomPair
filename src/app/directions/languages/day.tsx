"use client";
import { useRef, type ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import {
  Bell,
  BookOpen,
  Building2,
  Check,
  Coffee,
  Compass,
  Heart,
  Home,
  MessageCircle,
  Moon,
  RotateCcw,
  Smile,
  Sun,
  Sunset,
  Users,
  X,
} from "lucide-react";
import { Button, IconButton, SegmentedControl } from "@/design-system";
import { Reveal, SwipeHero } from "../shared/swipe-hero";
import {
  dayClock,
  sleepLabel,
  socialEvening,
  socialLabel,
  tidinessLabel,
  useDeck,
  you,
} from "../shared/deck";
import s from "./day.module.css";

type Time = "morning" | "day" | "evening" | "night";

/** Language D — the profile told as a day you would share. */
export function DayScreen() {
  const deck = useDeck();
  const { profile: p, match: m } = deck;
  const scroller = useRef<HTMLDivElement>(null);
  const decide = (d: "like" | "pass") => {
    deck.decide(d);
    scroller.current?.scrollTo({ top: 0, behavior: "smooth" });
  };
  const them = dayClock[p.habits.sleep];
  const mine = dayClock[you.sleep];
  const isEarly = p.habits.sleep === "early";

  return (
    <div className={s.screen}>
      <header className={s.top}>
        <span className={s.logo}>roompair</span>
        <span className={s.today}>Riga</span>
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

        <div className={s.stage}>
          <AnimatePresence initial={false} custom={deck.exitDirection}>
            <SwipeHero
              key={deck.cardKey}
              className={s.card}
              onDecision={decide}
              tilt={10}
              exit={(dir) => ({
                x: dir * 460,
                rotate: dir * 10,
                opacity: 0,
                transition: { duration: 0.3 },
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
                src={p.photo}
                alt={p.name}
                draggable={false}
                className={s.photo}
              />
              <div className={s.cardFoot}>
                <div>
                  <h2 className={s.name}>
                    {p.name}, {p.age}
                  </h2>
                  <p className={s.sub}>
                    {p.intent === "have-room"
                      ? "Has a room"
                      : "Looking together"}{" "}
                    · {p.neighborhood}
                  </p>
                </div>
                <span
                  className={s.rhythm}
                  data-time={
                    isEarly
                      ? "morning"
                      : p.habits.sleep === "late"
                        ? "night"
                        : "day"
                  }
                >
                  {isEarly ? (
                    <Sun />
                  ) : p.habits.sleep === "late" ? (
                    <Moon />
                  ) : (
                    <Coffee />
                  )}
                  {sleepLabel[p.habits.sleep]}
                </span>
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
            Like
          </Button>
        </div>

        <Reveal id={deck.cardKey} className={s.details}>
          <p className={s.bio}>{p.bio}</p>

          <section>
            <h3 className={s.title}>A day with {p.name}</h3>
            <p className={s.lead}>
              How your days would fit together under one roof.
            </p>
            <ol className={s.timeline}>
              <Moment
                time="morning"
                clock={them.wake}
                icon={<Sun />}
                title="Waking up"
                same={them.wake === mine.wake}
              >
                {p.name} is up around {them.wake}. You: around {mine.wake}.
              </Moment>
              <Moment
                time="day"
                clock="10:00"
                icon={<BookOpen />}
                title="During the day"
              >
                {p.occupation} at {p.university}.
              </Moment>
              <Moment
                time="day"
                clock="13:00"
                icon={<Coffee />}
                title="In the kitchen"
              >
                <span className={s.quote}>
                  <strong>{p.prompt.question}:</strong> {p.prompt.answer}
                </span>
              </Moment>
              <Moment
                time="evening"
                clock="19:00"
                icon={<Sunset />}
                title="Evenings"
                same={p.habits.social === you.social}
              >
                {socialEvening[p.habits.social]} (
                {socialLabel[p.habits.social].toLowerCase()}). You:{" "}
                {socialLabel[you.social].toLowerCase()}.
              </Moment>
              <Moment
                time="evening"
                clock="21:00"
                icon={<Home />}
                title="Keeping the place tidy"
                same={p.habits.cleanliness === you.cleanliness}
              >
                {tidinessLabel[p.habits.cleanliness]} ({p.habits.cleanliness}
                /5). You: {tidinessLabel[you.cleanliness].toLowerCase()} (
                {you.cleanliness}/5).{" "}
                {p.habits.smoking ? "Smokes." : "Smoke-free."}{" "}
                {p.habits.pets ? "Has a pet." : "No pets."}
              </Moment>
              <Moment
                time="night"
                clock={them.bed}
                icon={<Moon />}
                title="Quiet hours"
                same={them.bed === mine.bed}
              >
                Lights out around {them.bed}. You: around {mine.bed}.
              </Moment>
            </ol>
          </section>

          <section className={s.panel}>
            <h3 className={s.title}>Moving in</h3>
            <MoveCalendar theirs={p.moveDate} yours={you.moveDate} />
            <p className={s.stay}>
              {p.name} wants to stay <strong>{p.stayMonths} months</strong>. You
              said {you.stayMonths}.
            </p>
          </section>

          <section className={s.panel}>
            <h3 className={s.title}>Money</h3>
            <BudgetBar
              min={you.budgetMin}
              max={you.budgetMax}
              price={p.room?.price}
              range={p.budget}
            />
          </section>

          {p.room && (
            <section className={s.panel}>
              <img
                src={p.room.photo}
                alt={p.room.title}
                className={s.roomPhoto}
              />
              <h3 className={s.roomTitle}>{p.room.title}</h3>
              <p className={s.muted}>{p.room.description}</p>
            </section>
          )}

          <section className={s.fit}>
            <p className={s.score}>
              {m.score}%<span> of your days line up</span>
            </p>
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
            <dl className={s.breakdown}>
              {m.breakdown.map((b) => (
                <div key={b.label}>
                  <dt>{b.label}</dt>
                  <dd>
                    <span className={s.meter}>
                      <span style={{ width: `${b.score}%` }} />
                    </span>
                    {b.score}
                  </dd>
                </div>
              ))}
            </dl>
            <p className={s.muted}>
              Based on what you both said. Not a prediction.
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
          { label: "Messages", icon: MessageCircle },
          { label: "My space", icon: Home },
          { label: "Profile", icon: Smile },
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

function Moment({
  time,
  clock,
  icon,
  title,
  same,
  children,
}: {
  time: Time;
  clock: string;
  icon: ReactNode;
  title: string;
  same?: boolean;
  children: ReactNode;
}) {
  return (
    <li className={s.moment} data-time={time}>
      <span className={s.clock}>{clock}</span>
      <span className={s.node}>{icon}</span>
      <div className={s.momentBody}>
        <p className={s.momentTitle}>
          {title}
          {same !== undefined && (
            <span className={same ? s.same : s.differ}>
              {same ? "Same as you" : "A bit different"}
            </span>
          )}
        </p>
        <p className={s.momentText}>{children}</p>
      </div>
    </li>
  );
}

function MoveCalendar({ theirs, yours }: { theirs: string; yours: string }) {
  const d = new Date(theirs);
  const y = new Date(yours);
  const year = d.getFullYear();
  const month = d.getMonth();
  const first = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array(first).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  const yourDay =
    y.getFullYear() === year && y.getMonth() === month ? y.getDate() : null;
  return (
    <div className={s.calendar}>
      <p className={s.month}>
        {d.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
      </p>
      <div className={s.weekdays} aria-hidden="true">
        {["M", "T", "W", "T", "F", "S", "S"].map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
      <div className={s.days}>
        {cells.map((day, i) => (
          <span
            key={i}
            className={s.day}
            data-theirs={day === d.getDate()}
            data-yours={day !== null && day === yourDay}
          >
            {day}
          </span>
        ))}
      </div>
      <p className={s.legend}>
        <span data-key="theirs" /> Their move-in <span data-key="yours" /> Yours
      </p>
    </div>
  );
}

function BudgetBar({
  min,
  max,
  price,
  range,
}: {
  min: number;
  max: number;
  price?: number;
  range: [number, number];
}) {
  const lo = 200;
  const hi = 900;
  const at = (v: number) => `${((v - lo) / (hi - lo)) * 100}%`;
  return (
    <div className={s.budget}>
      <div className={s.track}>
        <span
          className={s.yourRange}
          style={{ left: at(min), width: `calc(${at(max)} - ${at(min)})` }}
        />
        {price ? (
          <span className={s.priceMark} style={{ left: at(price) }}>
            <span>€{price}</span>
          </span>
        ) : (
          <span
            className={s.theirRange}
            style={{
              left: at(range[0]),
              width: `calc(${at(range[1])} - ${at(range[0])})`,
            }}
          />
        )}
      </div>
      <p className={s.budgetText}>
        {price ? (
          <>
            Rent is <strong>€{price} a month</strong>. Your budget is €{min}–€
            {max}, so it fits.
          </>
        ) : (
          <>
            Their budget is{" "}
            <strong>
              €{range[0]}–€{range[1]}
            </strong>
            , yours is €{min}–€{max}.
          </>
        )}
      </p>
    </div>
  );
}
