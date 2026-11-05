"use client";
import { Check } from "lucide-react";
import { habitRows, type Profile } from "@/lib/discover/deck";
import { type GroupId } from "@/design-system/components/ProfileDetails/ProfileDetails";
import {
  type FitSection,
  type HomeSection,
  type PersonSection,
} from "@/lib/discover/sections";
import s from "./styles.module.css";

export function Band({ group, title }: { group: GroupId; title: string }) {
  return (
    <h3 className={s.groupBand} data-group={group}>
      {title}
    </h3>
  );
}

export const tileColors = ["sky", "mint", "lilac", "paper"];

export function HomeBands({ home }: { home: HomeSection }) {
  return (
    <>
      <div className={s.grid}>
        {home.facts.map((f, i) => (
          <div
            key={f.label}
            className={s.tile}
            data-band={tileColors[i]}
            data-long={f.value.length > 11}
          >
            <span className={s.tileLabel}>{f.label}</span>
            <strong>{f.value}</strong>
            {f.note && <span>{f.note}</span>}
          </div>
        ))}
      </div>
      {home.photo ? (
        <div className={s.room}>
          <img src={home.photo} alt={home.title ?? ""} />
          <div className={s.roomBand}>
            <p className={s.roomTitle}>{home.title}</p>
            <p className={s.roomText}>{home.description}</p>
          </div>
        </div>
      ) : (
        <div className={s.band}>
          <p className={s.bio}>{home.description}</p>
        </div>
      )}
    </>
  );
}

export function PersonBands({
  person,
  profile: p,
}: {
  person: PersonSection;
  profile: Profile;
}) {
  const [studies, checked] = person.facts;
  return (
    <>
      <div className={s.band}>
        <p className={s.bio}>{person.bio}</p>
        <p className={s.meta}>
          {studies.value} at {studies.note}
          {checked.value === "Student email"
            ? " · student email checked (demo)"
            : ""}
        </p>
        <p className={s.tags}>{person.interests.join(" / ")}</p>
      </div>
      <div className={s.band} data-band="blue">
        <p className={s.question}>{person.prompt.question}</p>
        <p className={s.answer}>{person.prompt.answer}</p>
      </div>
      <div className={s.band}>
        <p className={s.title}>Day to day</p>
        <div className={s.compare}>
          <div className={s.compareHead}>
            <span />
            <span>{p.name}</span>
            <span>You</span>
          </div>
          {habitRows(p).map((r) => (
            <div key={r.label} className={s.compareRow}>
              <span className={s.compareLabel}>{r.label}</span>
              <span className={s.big} data-same={r.them === r.you}>
                {r.them}
                <small>/5</small>
              </span>
              <span className={s.big}>
                {r.you}
                <small>/5</small>
              </span>
            </div>
          ))}
          {person.habits.slice(2).map((h) => (
            <div key={h.label} className={s.compareRow}>
              <span className={s.compareLabel}>{h.label}</span>
              <span className={s.word}>{h.them}</span>
              <span className={s.word}>{h.you}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function FitBand({ fit }: { fit: FitSection }) {
  return (
    <div className={s.band} data-band="mint">
      <p className={s.score}>
        {fit.score}
        <span>/100 fit</span>
      </p>
      <div className={s.bars}>
        {fit.breakdown.map((b) => (
          <div key={b.label} className={s.barRow}>
            <span>{b.label}</span>
            <strong>{b.score}</strong>
            <span className={s.barTrack}>
              <span style={{ width: `${b.score}%` }} />
            </span>
          </div>
        ))}
      </div>
      <ul className={s.reasons}>
        {fit.reasons.map((r) => (
          <li key={r}>
            <Check aria-hidden="true" /> {r}
          </li>
        ))}
      </ul>
      {fit.discuss.length > 0 && (
        <p className={s.talk}>Talk about: {fit.discuss.join(", ")}</p>
      )}
      <p className={s.note}>Compares what you both said. Not a prediction.</p>
    </div>
  );
}
