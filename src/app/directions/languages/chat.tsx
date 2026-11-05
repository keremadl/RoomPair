"use client";
import { useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  Building2,
  Check,
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
import { Avatar, Button, IconButton, SegmentedControl } from "@/design-system";
import { SwipeHero } from "../shared/swipe-hero";
import {
  dateLabel,
  habitRows,
  lifestyleFacts,
  useDeck,
  type Profile,
} from "../shared/deck";
import s from "./chat.module.css";

/** Language A — the profile as a first conversation with a future flatmate. */
export function ChatScreen() {
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
              <span className={s.fit}>{m.score}% fit</span>
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

        <Thread key={deck.cardKey} profile={p} match={m} />
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

type Line = { from: "you" | "them" | "note"; body: ReactNode };

function Thread({
  profile: p,
  match: m,
}: {
  profile: Profile;
  match: ReturnType<typeof useDeck>["match"];
}) {
  const rent = p.room
    ? `€${p.room.price} a month, with estimated bills included.`
    : `Somewhere between €${p.budget[0]} and €${p.budget[1]} a month.`;
  const lines: Line[] = [
    { from: "you", body: "Hi! What are you looking for?" },
    {
      from: "them",
      body:
        p.intent === "have-room"
          ? `I have a room in ${p.neighborhood} and I'm looking for a flatmate.`
          : "I'm looking for a place to share. Happy to search together.",
    },
    { from: "them", body: p.bio },
    {
      from: "you",
      body: p.room ? "How much is the rent?" : "What's your budget?",
    },
    { from: "them", body: rent },
    { from: "you", body: "When do you want to move in?" },
    {
      from: "them",
      body: `From ${dateLabel(p.moveDate)}, for about ${p.stayMonths} months.`,
    },
  ];
  if (p.room) {
    lines.push({ from: "you", body: "Can I see the room?" });
    lines.push({
      from: "them",
      body: (
        <>
          <img
            src={p.room.photo}
            alt={p.room.title}
            className={s.bubbleImage}
          />
          <strong className={s.bubbleTitle}>{p.room.title}</strong>
          {p.room.description}
        </>
      ),
    });
  }
  lines.push({ from: "you", body: `${p.prompt.question}?` });
  lines.push({ from: "them", body: p.prompt.answer });
  lines.push({ from: "you", body: "How do you like to live day to day?" });
  lines.push({
    from: "them",
    body: (
      <ul className={s.habits}>
        {habitRows(p).map((r) => (
          <li key={r.label}>
            <span>{r.label}</span>
            <strong>{r.scale[r.them]}</strong>
            <Same same={r.them === r.you} you={r.scale[r.you]} />
          </li>
        ))}
        {lifestyleFacts(p).map((f) => (
          <li key={f.label}>
            <span>{f.label}</span>
            <strong>{f.them}</strong>
            <Same
              same={
                f.them === f.you || (f.label === "Pets" && f.them === "No pets")
              }
              you={f.you}
            />
          </li>
        ))}
      </ul>
    ),
  });

  return (
    <section className={s.thread} aria-label={`Getting to know ${p.name}`}>
      <div className={s.threadHead}>
        <Avatar name={p.name} src={p.photo} size="md" />
        <div>
          <h3 className={s.threadTitle}>Get to know {p.name}</h3>
          <p className={s.threadSub}>
            Answers from {p.name}&rsquo;s profile, as a conversation.
          </p>
        </div>
      </div>

      <ol className={s.messages}>
        {lines.map((line, i) => (
          <motion.li
            key={i}
            className={s.message}
            data-from={line.from}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 8) * 0.06, duration: 0.3 }}
          >
            <div className={s.bubble}>{line.body}</div>
          </motion.li>
        ))}
      </ol>

      <div className={s.summary}>
        <p className={s.summaryScore}>
          {m.score}% <span>everyday fit</span>
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
            <strong>Worth talking about:</strong> {m.considerations.join(", ")}
          </p>
        )}
        <details className={s.details}>
          <summary>How we worked this out</summary>
          <ul>
            {m.breakdown.map((b) => (
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

      <p className={s.report}>
        {p.verified ? `${p.name}'s student email was checked (demo). ` : ""}
        <button type="button">Report</button> ·{" "}
        <button type="button">Block</button>
      </p>
    </section>
  );
}

function Same({ same, you }: { same: boolean; you: string }) {
  return same ? (
    <em className={s.same}>
      <Check aria-hidden="true" /> Same as you
    </em>
  ) : (
    <em className={s.diff}>You: {you}</em>
  );
}
