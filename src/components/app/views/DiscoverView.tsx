"use client";
import { Bookmark, BookmarkCheck, RotateCcw, Sparkles } from "lucide-react";
import { Button, EmptyState, VisuallyHidden } from "@/design-system";
import {
  defaultLanguage,
  defaultLayout,
  discoverParts,
} from "@/design-system/languages";
import type { DiscoverDeck } from "@/lib/discover/deck";
import { useI18n } from "@/lib/i18n";
import type { Profile } from "@/lib/types";
import v from "./views.module.css";

/**
 * Discover: the swipe card and Home → Person → Fit tabs. Room seekers see
 * people who have a room, room first; hosts see people looking for a room.
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
}) {
  const { t } = useI18n();
  const { Card, Details } = discoverParts[defaultLanguage];
  const layout = defaultLayout;
  const roomId = deck?.profile.room ? `room-${deck.profile.id}` : null;
  const saved = roomId ? savedRooms.includes(roomId) : false;
  return (
    <>
      <VisuallyHidden as="h1">{t("nav.discover")}</VisuallyHidden>
      {deck ? (
        <div className={v.discoverGrid}>
          <div className={v.cardColumn}>
            <Card deck={deck} roomFirst={roomFirst} />
          </div>
          <div className={v.detailsColumn}>
            {roomFirst && roomId && (
              <div className={v.detailsActions}>
                <Button
                  variant="secondary"
                  size="sm"
                  leadingIcon={saved ? <BookmarkCheck /> : <Bookmark />}
                  aria-pressed={saved}
                  onClick={() => onToggleRoom(roomId)}
                >
                  {saved ? t("Saved") : t("Save room")}
                </Button>
              </div>
            )}
            <Details
              key={deck.profile.id}
              profile={deck.profile}
              match={deck.match}
              layout={layout}
              onReport={() => onReport(deck.profile)}
            />
          </div>
        </div>
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
