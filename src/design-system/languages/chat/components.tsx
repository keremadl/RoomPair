"use client";
import { type ReactNode } from "react";
import { motion } from "motion/react";
import { Check, Handshake, Home, UserRound } from "lucide-react";
import { type GroupId } from "@/design-system/components/ProfileDetails/ProfileDetails";
import {
  type FitSection,
  type HomeSection,
  type PersonSection,
} from "@/lib/discover/sections";
import s from "./styles.module.css";

export const icons: Record<GroupId, ReactNode> = {
  home: <Home aria-hidden="true" />,
  person: <UserRound aria-hidden="true" />,
  fit: <Handshake aria-hidden="true" />,
};

export function Divider({ group, title }: { group: GroupId; title: string }) {
  return (
    <h3 className={s.divider} data-group={group}>
      <span>
        {icons[group]} {title}
      </span>
    </h3>
  );
}

export type Line = { from: "you" | "them"; body: ReactNode };

export function Thread({ lines }: { lines: Line[] }) {
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

export function HomeThread({ home }: { home: HomeSection }) {
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

export function PersonThread({
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

export function FitCard({ fit }: { fit: FitSection }) {
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
