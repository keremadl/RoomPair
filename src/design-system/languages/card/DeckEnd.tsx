"use client";
import type { ReactNode } from "react";
import { RotateCcw } from "@/design-system/icons";
import { useText } from "@/design-system/text/TextProvider";
import { Stagger } from "@/design-system/components/Motion/Motion";
import w from "./swipe.module.css";
import d from "./deckend.module.css";

/**
 * What sits where the swipe card was once the deck is empty: an empty card
 * slot of the same size, with the faces of the last people you saw fanned
 * like a hand of cards (no stock icon), the real numbers, and the actions.
 * The undo button keeps its place and look from the card's action row.
 */
export function DeckEnd({
  title,
  body,
  faces = [],
  stats = [],
  children,
  onUndo,
}: {
  title: string;
  body: string;
  /** Photos of the last people you saw; up to three are fanned out. */
  faces?: string[];
  /** Small facts, e.g. "4 liked", "7 skipped". */
  stats?: string[];
  /** The buttons. */
  children: ReactNode;
  onUndo?: () => void;
}) {
  const t = useText();
  const hand = faces.slice(0, 3);
  return (
    <div className={w.wrap}>
      <section className={d.slot} aria-labelledby="deck-end-title">
        {hand.length > 0 ? (
          <div className={d.hand} data-count={hand.length} aria-hidden="true">
            {hand.map((src, i) => (
              <img key={src} src={src} alt="" data-i={i} />
            ))}
          </div>
        ) : (
          <div className={d.hand} data-count="0" aria-hidden="true">
            <span className={d.blank} />
          </div>
        )}
        <h2 className={d.title} id="deck-end-title">
          {title}
        </h2>
        <p className={d.body}>{body}</p>
        {stats.length > 0 && (
          <Stagger as="ul" className={d.stats}>
            {stats.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </Stagger>
        )}
        <div className={d.actions}>{children}</div>
      </section>
      {onUndo && (
        <div className={w.actions}>
          <button
            type="button"
            className={w.round}
            data-kind="undo"
            onClick={onUndo}
            aria-label={t("Undo")}
          >
            <RotateCcw />
          </button>
        </div>
      )}
    </div>
  );
}
