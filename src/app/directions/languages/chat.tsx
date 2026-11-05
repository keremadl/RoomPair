"use client";
import { useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  Building2,
  Check,
  ChevronDown,
  Compass,
  Handshake,
  Heart,
  Home,
  MessageCircle,
  RotateCcw,
  Smile,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Button, IconButton, SegmentedControl } from "@/design-system";
import { SwipeHero, Reveal } from "../shared/swipe-hero";
import { useDeck } from "../shared/deck";
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
import s from "./chat.module.css";

const icons: Record<GroupId, ReactNode> = {
  home: <Home aria-hidden="true" />,
  person: <UserRound aria-hidden="true" />,
  fit: <Handshake aria-hidden="true" />,
};

/** Language A — the profile as a first conversation with a future flatmate. */
export function ChatScreen({ layout = "blocks" }: { layout?: DetailsLayout }) {
  const deck = useDeck();
  const { profile: p, match: m } = deck;
  const scroller = useRef<HTMLDivElement>(null);
  const decide = (d: "like" | "pass") => {
    deck.decide(d);
    scroller.current?.scrollTo({ top: 0, behavior: "smooth" });
  };
  const home = homeSection(p);
  const person = personSection(p);
  const fit = fitSection(m);
  const titles: Record<GroupId, string> = {
    home: home.heading,
    person: person.heading,
    fit: "How you fit",
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
                  {p.intent === "have-room" ? "Has a room" : "Looking together"}{" "}
                  · {p.neighborhood}
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

        <Reveal id={deck.cardKey}>
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

function Divider({ group, title }: { group: GroupId; title: string }) {
  return (
    <h3 className={s.divider} data-group={group}>
      <span>
        {icons[group]} {title}
      </span>
    </h3>
  );
}

type Line = { from: "you" | "them"; body: ReactNode };

function Thread({ lines }: { lines: Line[] }) {
  return (
    <ol className={s.messages}>
      {lines.map((line, i) => (
        <motion.li
          key={i}
          className={s.message}
          data-from={line.from}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(i, 6) * 0.05, duration: 0.25 }}
        >
          <div className={s.bubble}>{line.body}</div>
        </motion.li>
      ))}
    </ol>
  );
}

function HomeThread({ home }: { home: HomeSection }) {
  const listing = home.kind === "listing";
  return (
    <>
      <dl className={s.factCard}>
        {home.facts.map((f) => (
          <div key={f.label}>
            <dt>{f.label}</dt>
            <dd>
              {f.value}
              {f.note && <small> {f.note}</small>}
            </dd>
          </div>
        ))}
      </dl>
      <Thread
        lines={[
          {
            from: "you",
            body: listing
              ? "Can you tell me about the room?"
              : "What kind of place are you looking for?",
          },
          {
            from: "them",
            body: (
              <>
                {home.photo && (
                  <img
                    src={home.photo}
                    alt={home.title ?? ""}
                    className={s.bubbleImage}
                  />
                )}
                {home.title && (
                  <strong className={s.bubbleTitle}>{home.title}</strong>
                )}
                {home.description}
              </>
            ),
          },
        ]}
      />
    </>
  );
}

function PersonThread({
  person,
  name,
}: {
  person: PersonSection;
  name: string;
}) {
  const [studies, checked] = person.facts;
  return (
    <>
      <p className={s.meta}>
        {studies.value} at {studies.note}
        {checked.value === "Student email"
          ? " · student email checked (demo)"
          : ""}
      </p>
      <Thread
        lines={[
          { from: "you", body: "Tell me a bit about yourself!" },
          { from: "them", body: person.bio },
          {
            from: "them",
            body: (
              <span className={s.chips}>
                {person.interests.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </span>
            ),
          },
          { from: "you", body: `${person.prompt.question}?` },
          { from: "them", body: person.prompt.answer },
          { from: "you", body: "How do you like to live day to day?" },
          {
            from: "them",
            body: (
              <ul className={s.habits}>
                {person.habits.map((h) => (
                  <li key={h.label}>
                    <span>{h.label}</span>
                    <strong>{h.them}</strong>
                    {h.same ? (
                      <em className={s.same}>
                        <Check aria-hidden="true" /> Works with you
                      </em>
                    ) : (
                      <em className={s.diff}>You: {h.you}</em>
                    )}
                  </li>
                ))}
              </ul>
            ),
          },
        ]}
      />
      <p className={s.threadNote}>
        Answers from {name}&rsquo;s profile, shown as a conversation.
      </p>
    </>
  );
}

function FitCard({ fit }: { fit: FitSection }) {
  return (
    <div className={s.summary}>
      <p className={s.summaryScore}>
        {fit.score}% <span>everyday fit</span>
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
          <strong>Worth talking about:</strong> {fit.discuss.join(", ")}
        </p>
      )}
      <details className={s.details}>
        <summary>How we worked this out</summary>
        <ul>
          {fit.breakdown.map((b) => (
            <li key={b.label}>
              <span>{b.label}</span>
              <span>{b.score}/100</span>
              <small>{b.detail}</small>
            </li>
          ))}
        </ul>
      </details>
      <p className={s.note}>
        This compares what you both said. It is not a promise about living
        together.
      </p>
    </div>
  );
}
