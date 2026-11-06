"use client";
import { useRef, type ReactNode } from "react";
import { Circle, UserPen } from "@/design-system/icons";
import { Button, EmptyState, Stagger } from "@/design-system";
import { DeckEnd } from "@/design-system/languages/card/DeckEnd";
import {
  defaultLanguage,
  defaultLayout,
  discoverParts,
} from "@/design-system/languages";
import type { Decision, DiscoverDeck } from "@/lib/discover/deck";
import { useI18n } from "@/lib/i18n";
import type { Step } from "@/lib/profile";
import type { Preferences, Profile } from "@/lib/types";
import v from "./views.module.css";

/**
 * Discover: one swipe card, and below it the full profile (Home → Person →
 * Fit tabs) for whoever scrolls down. Room seekers see people who have a
 * room, room first; hosts see people looking for a room. A decision brings
 * the next card back up.
 */
export function DiscoverView({
  deck,
  roomFirst,
  canUndo,
  rankedCount,
  canBrowseAgain = true,
  seen = { liked: 0, skipped: 0, faces: [] },
  onFilters,
  onBrowseAgain,
  onUndo,
  onReport,
  viewer,
  preview = false,
  showUndo = true,
  children,
}: {
  deck: DiscoverDeck | null;
  /** The viewer is looking for a room: show the room before the person. */
  roomFirst: boolean;
  canUndo: boolean;
  rankedCount: number;
  /** Someone you have not matched with could come back into the deck. */
  canBrowseAgain?: boolean;
  /** What you did with this deck: counts and the last faces you saw. */
  seen?: { liked: number; skipped: number; faces: string[] };
  onFilters: () => void;
  onBrowseAgain: () => void;
  onUndo: () => void;
  onReport: (p: Profile) => void;
  /** Your own answers, compared with theirs in the details. */
  viewer: Preferences;
  /** The card without its buttons (e.g. someone you already liked). */
  preview?: boolean;
  /** Hide the undo button (a single person, e.g. from Likes). */
  showUndo?: boolean;
  /** Shown between the card and the details, e.g. a status or a button. */
  children?: ReactNode;
}) {
  const { t } = useI18n();
  const { Card, Details } = discoverParts[defaultLanguage];
  const details = useRef<HTMLDivElement>(null);
  const reduced = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // After a decision the next card's top should be in view again.
  const decide = (d: Decision) => {
    deck?.decide(d);
    if (window.scrollY > 0)
      window.scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" });
  };
  return (
    <>
      {deck ? (
        <>
          <Card
            deck={{ ...deck, decide }}
            roomFirst={roomFirst}
            preview={preview}
            showUndo={showUndo}
          />
          {children}
          <div
            ref={details}
            className={v.discoverDetails}
            aria-label={t("About {name}", { name: deck.profile.name })}
            role="region"
          >
            <Details
              key={deck.profile.id}
              profile={deck.profile}
              match={deck.match}
              layout={defaultLayout}
              viewer={viewer}
              onReport={() => onReport(deck.profile)}
            />
          </div>
        </>
      ) : rankedCount === 0 ? (
        <DeckEnd
          title={t("Nobody fits these filters")}
          body={t(
            "Widen your budget, move-in date or must-haves to see more people.",
          )}
          onUndo={canUndo ? onUndo : undefined}
        >
          <Button onClick={onFilters} fullWidth>
            {t("Change filters")}
          </Button>
        </DeckEnd>
      ) : (
        <DeckEnd
          title={t("That's everyone for now")}
          body={
            canBrowseAgain
              ? t("{count} people in {city} fit your filters.", {
                  count: rankedCount,
                  city: viewer.city,
                })
              : t(
                  "You have matched with everyone who fits. Change your filters to meet more people.",
                )
          }
          faces={seen.faces}
          stats={[
            t("{count} liked", { count: seen.liked }),
            t("{count} skipped", { count: seen.skipped }),
          ]}
          onUndo={canUndo ? onUndo : undefined}
        >
          {canBrowseAgain && (
            <Button onClick={onBrowseAgain} fullWidth>
              {t("Go through them again")}
            </Button>
          )}
          <Button
            variant={canBrowseAgain ? "secondary" : "primary"}
            onClick={onFilters}
            fullWidth
          >
            {t("Change filters")}
          </Button>
        </DeckEnd>
      )}
    </>
  );
}

/**
 * Shown instead of Discover while required profile fields are missing:
 * nobody sees you, and you cannot team up, until they are filled in.
 */
export function ProfileGate({
  missing,
  onComplete,
}: {
  missing: Step[];
  onComplete: () => void;
}) {
  const { t } = useI18n();
  return (
    <EmptyState
      icon={<UserPen />}
      title={t("Finish your profile to start")}
      body={t(
        "People only see you, and you can only team up, once these are done:",
      )}
      action={{ label: t("Complete my profile"), onClick: onComplete }}
    >
      <Stagger className={v.gateList}>
        {missing.map((step) => (
          <li key={step.id}>
            <Circle aria-hidden="true" /> {t(step.label)}
          </li>
        ))}
      </Stagger>
    </EmptyState>
  );
}
