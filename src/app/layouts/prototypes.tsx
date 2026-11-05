"use client";
import { useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { SwipeHero, Reveal } from "../directions/shared/swipe-hero";
import { useDeck, type Decision } from "../directions/shared/deck";
import {
  fitSection,
  homeSection,
  personSection,
} from "../directions/shared/sections";
import {
  ActionBar,
  FactGrid,
  FitBody,
  GroupHeader,
  HomeBody,
  PersonBody,
  PersonCard,
  Phone,
  groupIcon,
  type Group,
} from "./blocks";
import s from "./prototypes.module.css";

const exit = (dir: number) => ({
  x: dir * 420,
  rotate: dir * 8,
  opacity: 0,
  transition: { duration: 0.25 },
});

/** Shared wiring: deck state, scroll-to-top after a decision, grouped content. */
function useProfile() {
  const deck = useDeck();
  const scrollRef = useRef<HTMLDivElement>(null);
  const decide = (d: Decision) => {
    deck.decide(d);
    scrollRef.current?.scrollTo({ top: 0 });
  };
  const p = deck.profile;
  return {
    deck,
    p,
    decide,
    scrollRef,
    home: homeSection(p),
    person: personSection(p),
    fit: fitSection(deck.match),
    actions: (
      <ActionBar
        onPass={() => decide("pass")}
        onLike={() => decide("like")}
        onUndo={deck.undo}
        canUndo={deck.canUndo}
      />
    ),
  };
}

function Card({
  deck,
  p,
  decide,
  className = s.card,
}: Pick<ReturnType<typeof useProfile>, "deck" | "p" | "decide"> & {
  className?: string;
}) {
  return (
    <div className={s.stage}>
      <AnimatePresence initial={false} custom={deck.exitDirection}>
        <SwipeHero
          key={deck.cardKey}
          className={className}
          onDecision={decide}
          tilt={8}
          exit={exit}
        >
          <PersonCard
            photo={p.photo}
            name={p.name}
            age={p.age}
            line={`${p.intent === "have-room" ? "Has a room" : "Looking together"} · ${p.neighborhood}`}
          />
        </SwipeHero>
      </AnimatePresence>
    </div>
  );
}

/* ── 1. Tabs ─────────────────────────────────────────────────────────── */

export function TabsPrototype() {
  const v = useProfile();
  const [tab, setTab] = useState<Group>("home");
  const tabs: { id: Group; label: string }[] = [
    { id: "home", label: v.home.kind === "listing" ? "Room" : "Home" },
    { id: "person", label: "Person" },
    { id: "fit", label: `Fit ${v.fit.score}%` },
  ];
  return (
    <Phone actions={v.actions} scrollRef={v.scrollRef}>
      <Card {...v} />
      <div className={s.tabs} role="tablist" aria-label="Profile sections">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            data-group={t.id}
            className={s.tab}
            onClick={() => setTab(t.id)}
          >
            {groupIcon[t.id]}
            {t.label}
          </button>
        ))}
      </div>
      <Reveal id={`${v.deck.cardKey}-${tab}`} className={s.tabPanel}>
        {tab === "home" && (
          <>
            <GroupHeader group="home" title={v.home.heading} />
            <FactGrid facts={v.home.facts} group="home" />
            <HomeBody home={v.home} />
          </>
        )}
        {tab === "person" && (
          <>
            <GroupHeader group="person" title={v.person.heading} />
            <FactGrid facts={v.person.facts} group="person" />
            <PersonBody person={v.person} name={v.p.name} />
          </>
        )}
        {tab === "fit" && (
          <>
            <GroupHeader group="fit" title="How you fit" />
            <FitBody fit={v.fit} />
          </>
        )}
      </Reveal>
    </Phone>
  );
}

/* ── 2. Stacked blocks ───────────────────────────────────────────────── */

export function BlocksPrototype() {
  const v = useProfile();
  return (
    <Phone actions={v.actions} scrollRef={v.scrollRef}>
      <Card {...v} />
      <Reveal id={v.deck.cardKey} className={s.blocks}>
        <section className={s.block} data-group="home">
          <GroupHeader group="home" title={v.home.heading} />
          <FactGrid facts={v.home.facts} group="home" />
          <HomeBody home={v.home} />
        </section>
        <section className={s.block} data-group="person">
          <GroupHeader group="person" title={v.person.heading} />
          <FactGrid facts={v.person.facts} group="person" />
          <PersonBody person={v.person} name={v.p.name} />
        </section>
        <section className={s.block} data-group="fit">
          <GroupHeader group="fit" title="How you fit" />
          <FitBody fit={v.fit} />
        </section>
      </Reveal>
    </Phone>
  );
}

/* ── 3. At a glance + accordion ──────────────────────────────────────── */

export function GlancePrototype() {
  const v = useProfile();
  const [rent, available, stay] = v.home.facts;
  return (
    <Phone actions={v.actions} scrollRef={v.scrollRef}>
      <Card {...v} />
      <Reveal id={v.deck.cardKey}>
        <section className={s.glance} aria-label="At a glance">
          <p className={s.glanceTitle}>At a glance</p>
          <div className={s.glanceGrid}>
            <div data-group="home">
              <span>{rent.label}</span>
              <strong>{rent.value}</strong>
            </div>
            <div data-group="home">
              <span>{available.label}</span>
              <strong>{available.value}</strong>
            </div>
            <div data-group="home">
              <span>{stay.label}</span>
              <strong>{stay.value}</strong>
            </div>
            <div data-group="fit">
              <span>Fit</span>
              <strong>{v.fit.score}%</strong>
            </div>
          </div>
        </section>
        <div className={s.accordions}>
          <Accordion
            group="home"
            title={v.home.heading}
            summary={v.home.summary}
            open
          >
            <FactGrid facts={v.home.facts.slice(3)} group="home" />
            <HomeBody home={v.home} />
          </Accordion>
          <Accordion
            group="person"
            title={v.person.heading}
            summary={v.person.summary}
          >
            <PersonBody person={v.person} name={v.p.name} showFacts />
          </Accordion>
          <Accordion group="fit" title="How you fit" summary={v.fit.summary}>
            <FitBody fit={v.fit} />
          </Accordion>
        </div>
      </Reveal>
    </Phone>
  );
}

function Accordion({
  group,
  title,
  summary,
  open = false,
  children,
}: {
  group: Group;
  title: string;
  summary: string;
  open?: boolean;
  children: React.ReactNode;
}) {
  // The summary previews a closed section; once open, the content says it.
  const [isOpen, setIsOpen] = useState(open);
  return (
    <details
      className={s.accordion}
      data-group={group}
      open={open}
      onToggle={(e) => setIsOpen(e.currentTarget.open)}
    >
      <summary>
        <GroupHeader
          group={group}
          title={title}
          summary={isOpen ? undefined : summary}
          as="span"
        />
        <ChevronDown aria-hidden="true" className={s.chevron} />
      </summary>
      <div className={s.accordionBody}>{children}</div>
    </details>
  );
}

/* ── 4. Room first ───────────────────────────────────────────────────── */

export function RoomFirstPrototype() {
  const v = useProfile();
  const listing = v.home.kind === "listing";
  return (
    <Phone actions={v.actions} scrollRef={v.scrollRef}>
      <div className={s.stage}>
        <AnimatePresence initial={false} custom={v.deck.exitDirection}>
          <SwipeHero
            key={v.deck.cardKey}
            className={s.card}
            onDecision={v.decide}
            tilt={8}
            exit={exit}
          >
            {listing ? (
              <>
                <img
                  src={v.home.photo}
                  alt={v.home.title}
                  draggable={false}
                  className={s.roomCardPhoto}
                />
                <div className={s.roomCardLabel}>
                  <p className={s.roomCardPrice}>
                    {v.home.facts[0].value}
                    <span> / month · {v.p.neighborhood}</span>
                  </p>
                  <div className={s.host}>
                    <img src={v.p.photo} alt="" />
                    <span>
                      <strong>
                        {v.p.name}, {v.p.age}
                      </strong>{" "}
                      lives here · {v.p.occupation}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <PersonCard
                photo={v.p.photo}
                name={v.p.name}
                age={v.p.age}
                line={`Looking together · ${v.p.neighborhood}`}
              />
            )}
          </SwipeHero>
        </AnimatePresence>
      </div>
      <Reveal id={v.deck.cardKey} className={s.blocks}>
        <section className={s.block} data-group="home">
          <GroupHeader
            group="home"
            title={listing ? (v.home.title ?? v.home.heading) : v.home.heading}
          />
          <FactGrid facts={v.home.facts} group="home" />
          <p className={s.plain}>{v.home.description}</p>
        </section>
        <section className={s.block} data-group="person">
          <GroupHeader
            group="person"
            title={listing ? `Your flatmate: ${v.p.name}` : v.person.heading}
          />
          <PersonBody person={v.person} name={v.p.name} showFacts />
        </section>
        <section className={s.block} data-group="fit">
          <GroupHeader group="fit" title="How you fit" />
          <FitBody fit={v.fit} />
        </section>
      </Reveal>
    </Phone>
  );
}
