"use client";
import { useRef, type ReactNode } from "react";
import { Circle, RotateCcw, Sparkles, UserPen } from "@/design-system/icons";
import { Button, EmptyState, Stagger } from "@/design-system";
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
 * room, room first; hosts see people looking for a room. The arrow on the
 * card scrolls to the details; a decision brings the next card back up.
 */
export function DiscoverView({
  deck,
  roomFirst,
  canUndo,
  rankedCount,
  savedRooms,
  onFilters,
  onBrowseAgain,
  onUndo,
  onToggleRoom,
  onReport,
  viewer,
  preview = false,
  children,
}: {
  deck: DiscoverDeck | null;
  /** The viewer is looking for a room: show the room before the person. */
  roomFirst: boolean;
  canUndo: boolean;
  rankedCount: number;
  savedRooms: string[];
  onFilters: () => void;
  onBrowseAgain: () => void;
  onUndo: () => void;
  onToggleRoom: (id: string) => void;
  onReport: (p: Profile) => void;
  /** Your own answers, compared with theirs in the details. */
  viewer: Preferences;
  /** The card without its buttons (e.g. someone you already liked). */
  preview?: boolean;
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
  const roomId = deck?.profile.room ? `room-${deck.profile.id}` : null;
  const saved = roomId ? savedRooms.includes(roomId) : false;
  return (
    <>
      {deck ? (
        <>
          <Card
            deck={{ ...deck, decide }}
            roomFirst={roomFirst}
            onInfo={() =>
              details.current?.scrollIntoView({
                behavior: reduced() ? "auto" : "smooth",
                block: "start",
              })
            }
            saved={saved}
            onSave={roomId ? () => onToggleRoom(roomId) : undefined}
            preview={preview}
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
        <EmptyState
          icon={<Sparkles />}
          title={t("Nobody fits these filters")}
          body={t(
            "Widen your budget, move-in date or must-haves to see more people.",
          )}
          action={{ label: t("Change filters"), onClick: onFilters }}
        />
      ) : (
        <EmptyState
          icon={<Sparkles />}
          title={t("You have seen everyone")}
          body={t(
            "Change your filters, or go through the people you skipped again.",
          )}
          action={{ label: t("Change filters"), onClick: onFilters }}
          secondary={{
            label: t("Browse everyone again"),
            onClick: onBrowseAgain,
          }}
        />
      )}
      {!deck && canUndo && (
        <div className={v.centered}>
          <Button variant="ghost" leadingIcon={<RotateCcw />} onClick={onUndo}>
            {t("discover.undo")}
          </Button>
        </div>
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
