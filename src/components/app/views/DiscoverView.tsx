"use client";
import {
  Building2,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Users,
} from "lucide-react";
import {
  Button,
  EmptyState,
  SegmentedControl,
  Text,
  VisuallyHidden,
} from "@/design-system";
import {
  defaultLanguage,
  defaultLayout,
  discoverParts,
} from "@/design-system/languages";
import type { DiscoverDeck } from "@/lib/discover/deck";
import { rooms } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import type { Profile, Room } from "@/lib/types";
import { RoomTile } from "../RoomTile";
import v from "./views.module.css";

/** Discover: the Card language's swipe card and Home → Person → Fit tabs. */
export function DiscoverView({
  deck,
  mode,
  onMode,
  canUndo,
  rankedCount,
  remaining,
  savedRooms,
  onFilters,
  onBrowseAgain,
  onUndo,
  onOpenRoom,
  onToggleRoom,
  onReport,
}: {
  deck: DiscoverDeck | null;
  mode: "people" | "rooms";
  onMode: (mode: "people" | "rooms") => void;
  canUndo: boolean;
  rankedCount: number;
  remaining: number;
  savedRooms: string[];
  onFilters: () => void;
  onBrowseAgain: () => void;
  onUndo: () => void;
  onOpenRoom: (room: Room) => void;
  onToggleRoom: (id: string) => void;
  onReport: (p: Profile) => void;
}) {
  const { t } = useI18n();
  const { Card, Details } = discoverParts[defaultLanguage];
  const layout = defaultLayout;
  return (
    <>
      <VisuallyHidden as="h1">{t("nav.discover")}</VisuallyHidden>
      <div className={v.toolbar}>
        <SegmentedControl
          label={t("Search mode")}
          value={mode}
          onChange={onMode}
          options={[
            { value: "people", label: t("discover.people"), icon: <Users /> },
            { value: "rooms", label: t("discover.rooms"), icon: <Building2 /> },
          ]}
        />
        {mode === "people" && rankedCount > 0 && (
          <Text size="sm" tone="muted" className={v.toolbarNote}>
            {t("discover.left", { count: remaining })}
          </Text>
        )}
        <Button
          variant="secondary"
          leadingIcon={<SlidersHorizontal />}
          onClick={onFilters}
          className={v.toolbarEnd}
        >
          {t("discover.filters")}
        </Button>
      </div>

      {mode === "rooms" ? (
        <section aria-labelledby="rooms-title">
          <VisuallyHidden as="h2" id="rooms-title">
            {t("Rooms")}
          </VisuallyHidden>
          <div className={v.roomGrid}>
            {rooms.map((room) => (
              <RoomTile
                key={room.id}
                room={room}
                saved={savedRooms.includes(room.id)}
                onOpen={() => onOpenRoom(room)}
                onToggle={() => onToggleRoom(room.id)}
              />
            ))}
          </div>
        </section>
      ) : deck ? (
        <div className={v.discoverGrid}>
          <div className={v.cardColumn}>
            <Card deck={deck} />
          </div>
          <div className={v.detailsColumn}>
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
      {mode === "people" && !deck && canUndo && (
        <div className={v.centered}>
          <Button variant="ghost" leadingIcon={<RotateCcw />} onClick={onUndo}>
            {t("discover.undo")}
          </Button>
        </div>
      )}
    </>
  );
}
