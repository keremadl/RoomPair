"use client";
import { useRef } from "react";
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
  MapPin,
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
import {
  Reveal,
  SwipeHero,
} from "@/design-system/components/SwipeCard/SwipeCard";
import {
  dayClock,
  sleepLabel,
  socialEvening,
  socialLabel,
  tidinessLabel,
  useDeck,
  you,
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
import { Moment, MoveCalendar, BudgetBar, GroupTitle } from "./components";

/** Language D — the profile told as a day you would share. */
export function DayScreen({ layout = "blocks" }: { layout?: DetailsLayout }) {
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
              home: <GroupTitle group="home" title={home.heading} />,
              person: (
                <GroupTitle group="person" title={`A day with ${p.name}`} />
              ),
              fit: <GroupTitle group="fit" title="How your days line up" />,
            }}
            tabLabels={{
              home: home.kind === "listing" ? "Room" : "Home",
              person: p.name,
              fit: `Fit ${fit.score}%`,
            }}
            sections={{
              home: (
                <>
                  <section className={s.panel}>
                    <h4 className={s.title}>Moving in</h4>
                    <MoveCalendar theirs={p.moveDate} yours={you.moveDate} />
                    <p className={s.stay}>
                      {home.kind === "listing"
                        ? "Minimum stay"
                        : `${p.name} wants to stay`}{" "}
                      <strong>{p.stayMonths} months</strong>. You said{" "}
                      {you.stayMonths}.
                    </p>
                  </section>
                  <section className={s.panel}>
                    <h4 className={s.title}>
                      {home.kind === "listing" ? "Rent" : "Budget"}
                    </h4>
                    <BudgetBar
                      min={you.budgetMin}
                      max={you.budgetMax}
                      price={p.room?.price}
                      range={p.budget}
                    />
                  </section>
                  <section className={s.panel}>
                    {home.photo && (
                      <img
                        src={home.photo}
                        alt={home.title ?? ""}
                        className={s.roomPhoto}
                      />
                    )}
                    <h4 className={s.roomTitle}>
                      {home.title ?? home.heading}
                    </h4>
                    <p className={s.muted}>{home.description}</p>
                    <p className={s.area}>
                      <MapPin aria-hidden="true" /> {home.facts[3].value}
                    </p>
                  </section>
                </>
              ),
              person: (
                <>
                  <p className={s.bio}>{person.bio}</p>
                  <p className={s.muted}>
                    {person.facts[0].value} at {person.facts[0].note}
                    {person.facts[1].value === "Student email"
                      ? " · student email checked (demo)"
                      : ""}
                  </p>
                  <div className={s.chips}>
                    {person.interests.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                  <ol className={s.timeline}>
                    <Moment
                      time="morning"
                      clock={them.wake}
                      icon={<Sun />}
                      title="Waking up"
                      same={them.wake === mine.wake}
                    >
                      {p.name} is up around {them.wake}. You: around {mine.wake}
                      .
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
                      {tidinessLabel[p.habits.cleanliness]} (
                      {p.habits.cleanliness}
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
                </>
              ),
              fit: (
                <section className={s.fit}>
                  <p className={s.score}>
                    {fit.score}%<span> of your days line up</span>
                  </p>
                  <ul className={s.reasons}>
                    {fit.reasons.map((r) => (
                      <li key={r}>
                        <Check aria-hidden="true" /> {r}
                      </li>
                    ))}
                  </ul>
                  {fit.discuss.length > 0 && (
                    <p className={s.talk}>
                      Talk about: {fit.discuss.join(", ")}
                    </p>
                  )}
                  <dl className={s.breakdown}>
                    {fit.breakdown.map((b) => (
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
              ),
            }}
          />
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
