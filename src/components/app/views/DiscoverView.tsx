"use client";
import { RotateCcw, Sparkles } from "lucide-react";
import { Button, EmptyState } from "@/design-system";
import { defaultLanguage, discoverParts } from "@/design-system/languages";
import type { DiscoverDeck } from "@/lib/discover/deck";
import { useI18n } from "@/lib/i18n";
import type { Profile } from "@/lib/types";
import v from "./views.module.css";

/**
 * Discover: one swipe card. Room seekers see people who have a room, room
 * first; hosts see people looking for a room. The info button opens the
 * full profile (Home → Person → Fit tabs).
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
  onOpenProfile,
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
  /** Opens the full profile (Home → Person → Fit tabs). */
  onOpenProfile: (p: Profile) => void;
}) {
  const { t } = useI18n();
  const { Card } = discoverParts[defaultLanguage];
  const roomId = deck?.profile.room ? `room-${deck.profile.id}` : null;
  const saved = roomId ? savedRooms.includes(roomId) : false;
  return (
    <>
      {deck ? (
        <Card
          deck={deck}
          roomFirst={roomFirst}
          onInfo={() => onOpenProfile(deck.profile)}
          saved={saved}
          onSave={roomId ? () => onToggleRoom(roomId) : undefined}
        />
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
