"use client";
import { useEffect, useState } from "react";
import { Eyebrow, Heading, Text } from "@/design-system";
import "@/design-system/themes/wire.css";
import { groupIcon, type Group } from "./blocks";
import { BlocksPrototype, TabsPrototype } from "./prototypes";
import styles from "./layouts.module.css";

const model: {
  group: Group;
  name: string;
  question: string;
  fields: string[];
}[] = [
  {
    group: "home",
    name: "Home",
    question: "What is the place like?",
    fields: [
      "Rent (bills included) or search budget",
      "Available from / move-in",
      "Minimum stay",
      "Neighbourhood",
      "Photo, title and description of the room",
    ],
  },
  {
    group: "person",
    name: "Person",
    question: "Who would I live with?",
    fields: [
      "School / programme, age, verification",
      "How they describe themselves (bio)",
      "Interests",
      "Profile prompt and answer",
      "Habits: tidiness, social energy, sleep, smoking, pets (compared with yours)",
    ],
  },
  {
    group: "fit",
    name: "Fit",
    question: "Would we get along?",
    fields: [
      "Fit score",
      "What matches",
      "Things to talk about",
      "Score breakdown",
    ],
  },
];

const prototypes = [
  {
    id: "blocks",
    name: "1 · Blocks",
    idea: "Home → Person → Fit, stacked, each with its own heading and colour. Every block starts with its heading and key fact tiles.",
    pros: [
      "Everything is visible, nothing is hidden",
      "The order never changes, so the eye learns where to look",
      "The easiest layout to fit into all six design languages",
    ],
    cons: ["The page is long; you scroll to reach Fit"],
    recommended: true,
    Screen: BlocksPrototype,
  },
  {
    id: "tabs",
    name: "2 · Tabs",
    idea: "Room / Person / Fit tabs below the card. One group is visible at a time.",
    pros: [
      "The calmest view; nothing can get mixed up",
      "One tap takes you to any group",
    ],
    cons: [
      "Someone who never opens the other tabs misses information",
      "Comparing means switching back and forth between tabs",
    ],
    Screen: TabsPrototype,
  },
];

export function Layouts() {
  const [selected, setSelected] = useState(prototypes[0].id);
  useEffect(() => {
    const sync = () => {
      const h = window.location.hash.slice(1);
      if (prototypes.some((p) => p.id === h)) setSelected(h);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Eyebrow>RoomPair · Layout prototypes</Eyebrow>
        <Heading level={1} size="3xl">
          How should profile details be arranged?
        </Heading>
        <Text tone="muted" className={styles.lead}>
          RoomPair is not a dating app: people are answering two separate
          questions. First every fact was given exactly one group, then we tried
          different ways of arranging those groups on screen. The prototypes are
          colourless on purpose, so the discussion stays on layout, not style.
        </Text>
      </header>

      <section className={styles.model} aria-labelledby="model-title">
        <h2 id="model-title" className={styles.sectionTitle}>
          Content model: every fact in exactly one group
        </h2>
        <div className={styles.modelGrid} data-direction="wire">
          {model.map((g) => (
            <div
              key={g.group}
              className={styles.modelCard}
              data-group={g.group}
            >
              <p className={styles.modelHead}>
                <span>{groupIcon[g.group]}</span>
                {g.name}
              </p>
              <p className={styles.modelQuestion}>{g.question}</p>
              <ul>
                {g.fields.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className={styles.rule}>
          Rule: nothing about the place goes under Person and nothing about the
          person goes under Home. For someone without a room, Home shows the
          home they are looking for: budget, neighbourhood, dates, stay.
        </p>
      </section>

      <div className={styles.picker} role="radiogroup" aria-label="Prototype">
        {prototypes.map((p) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={selected === p.id}
            className={styles.pick}
            onClick={() => {
              setSelected(p.id);
              history.replaceState(null, "", `#${p.id}`);
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {prototypes.map(
          ({ id, name, idea, pros, cons, recommended, Screen }) => (
            <section
              key={id}
              id={id}
              className={styles.proto}
              data-selected={selected === id}
              aria-label={name}
            >
              <div className={styles.about}>
                <h2 className={styles.protoName}>
                  {name}
                  {recommended && (
                    <span className={styles.badge}>Our pick</span>
                  )}
                </h2>
                <p className={styles.idea}>{idea}</p>
                <div className={styles.lists}>
                  <div>
                    <p className={styles.listTitle}>Pros</p>
                    <ul>
                      {pros.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className={styles.listTitle}>Cons</p>
                    <ul>
                      {cons.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className={styles.phone} data-direction="wire">
                <Screen />
              </div>
            </section>
          ),
        )}
      </div>
    </div>
  );
}
