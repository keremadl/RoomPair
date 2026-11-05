"use client";
import type { ReactNode } from "react";
import {
  Bell,
  Handshake,
  Heart,
  Home,
  MessageCircle,
  RotateCcw,
  Smile,
  Compass,
  UserRound,
  X,
} from "lucide-react";
import type {
  Fact,
  FitSection,
  HomeSection,
  PersonSection,
} from "@/lib/discover/sections";
import {
  CompareTable,
  FactGrid as CoreFactGrid,
  ReasonList,
  ScoreBars,
} from "@/design-system";
import s from "./blocks.module.css";

export type Group = "home" | "person" | "fit";

export const groupIcon: Record<Group, ReactNode> = {
  home: <Home aria-hidden="true" />,
  person: <UserRound aria-hidden="true" />,
  fit: <Handshake aria-hidden="true" />,
};

/** Wireframe phone chrome: top bar, scroll area, actions, tab bar. */
export function Phone({
  children,
  actions,
  scrollRef,
}: {
  children: ReactNode;
  actions: ReactNode;
  scrollRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div className={s.screen}>
      <header className={s.top}>
        <span className={s.logo}>roompair</span>
        <span className={s.city}>Riga</span>
        <Bell aria-hidden="true" className={s.bell} />
      </header>
      <div className={s.scroll} ref={scrollRef}>
        {children}
      </div>
      {actions}
      <nav className={s.nav} aria-label="Main">
        {[
          { label: "Discover", icon: Compass },
          { label: "Likes", icon: Heart },
          { label: "Messages", icon: MessageCircle },
          { label: "My space", icon: Home },
          { label: "Profile", icon: Smile },
        ].map(({ label, icon: Icon }, i) => (
          <span key={label} data-current={i === 0}>
            <Icon aria-hidden="true" />
            {label}
          </span>
        ))}
      </nav>
    </div>
  );
}

export function ActionBar({
  onPass,
  onLike,
  onUndo,
  canUndo,
}: {
  onPass: () => void;
  onLike: () => void;
  onUndo: () => void;
  canUndo: boolean;
}) {
  return (
    <div className={s.actions}>
      <button
        type="button"
        className={s.undo}
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="Undo"
      >
        <RotateCcw />
      </button>
      <button type="button" className={s.pass} onClick={onPass}>
        <X /> Pass
      </button>
      <button type="button" className={s.like} onClick={onLike}>
        <Heart /> Like
      </button>
    </div>
  );
}

export function GroupHeader({
  group,
  title,
  summary,
  as: Tag = "h3",
}: {
  group: Group;
  title: string;
  summary?: string;
  as?: "h3" | "span";
}) {
  return (
    <div className={s.groupHeader} data-group={group}>
      <span className={s.groupIcon}>{groupIcon[group]}</span>
      <span className={s.groupText}>
        <Tag className={s.groupTitle}>{title}</Tag>
        {summary && <span className={s.groupSummary}>{summary}</span>}
      </span>
    </div>
  );
}

export function FactGrid({ facts, group }: { facts: Fact[]; group: Group }) {
  return (
    <div data-group={group} className={s.facts}>
      <CoreFactGrid facts={facts} />
    </div>
  );
}

export function HomeBody({ home }: { home: HomeSection }) {
  return (
    <div className={s.body}>
      {home.photo && (
        <img src={home.photo} alt={home.title ?? ""} className={s.roomPhoto} />
      )}
      {home.title && <p className={s.bodyTitle}>{home.title}</p>}
      <p className={s.text}>{home.description}</p>
    </div>
  );
}

export function PersonBody({
  person,
  name,
  showFacts = false,
}: {
  person: PersonSection;
  name: string;
  showFacts?: boolean;
}) {
  return (
    <div className={s.body}>
      {showFacts && <FactGrid facts={person.facts} group="person" />}
      <p className={s.text}>{person.bio}</p>
      <div className={s.chips}>
        {person.interests.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
      <div className={s.prompt}>
        <p className={s.promptQ}>{person.prompt.question}</p>
        <p className={s.promptA}>{person.prompt.answer}</p>
      </div>
      <p className={s.subTitle}>Everyday habits</p>
      <HabitTable rows={person.habits} name={name} />
    </div>
  );
}

export function HabitTable({
  rows,
  name,
}: {
  rows: PersonSection["habits"];
  name: string;
}) {
  return <CompareTable rows={rows} name={name} />;
}

export function FitBody({ fit }: { fit: FitSection }) {
  return (
    <div className={s.body}>
      <p className={s.score}>
        {fit.score}%<span> everyday fit</span>
      </p>
      <ReasonList reasons={fit.reasons} discuss={fit.discuss} />
      <ScoreBars items={fit.breakdown} />
      <p className={s.note}>Compares what you both said. Not a prediction.</p>
    </div>
  );
}

/** The swipeable photo card, person-first. */
export function PersonCard({
  photo,
  name,
  age,
  line,
}: {
  photo: string;
  name: string;
  age: number;
  line: string;
}) {
  return (
    <>
      <img src={photo} alt={name} draggable={false} className={s.cardPhoto} />
      <div className={s.cardLabel}>
        <h2 className={s.cardName}>
          {name}, {age}
        </h2>
        <p className={s.cardLine}>{line}</p>
      </div>
    </>
  );
}

export { s as blockStyles };
