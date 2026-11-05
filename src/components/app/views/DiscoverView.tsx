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
  Heading,
  SegmentedControl,
  Text,
  type DetailsLayout,
} from "@/design-system";
import { discoverParts, type DirectionId } from "@/design-system/languages";
import type { DiscoverDeck } from "@/lib/discover/deck";
import { rooms } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import type { Profile, Room } from "@/lib/types";
import { PageHeader } from "../PageHeader";
import { RoomTile } from "../RoomTile";
import v from "./views.module.css";

/** Discover: the active language's card and Home → Person → Fit details. */
export function DiscoverView({
  deck,
  layout,
  language,
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
  layout: DetailsLayout;
  language: DirectionId;
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
  const { Card, Details } = discoverParts[language];
  return (
    <>
      <PageHeader
        eyebrow={t("discover.eyebrow")}
        title={t("discover.title")}
        description={t("discover.subtitle")}
      />
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
          <Heading level={2} size="2xl" id="rooms-title">
            {t("A space for your next chapter.")}
          </Heading>
          <Text tone="muted" className={v.sectionLead}>
            {t(
              "Thoughtfully picked demo homes. Save a place and explore it together.",
            )}
          </Text>
          <div className={v.tileGrid}>
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
          title={t("A fresh start?")}
          body={t(
            "You’ve met everyone who fits your search. Try adjusting your preferences.",
          )}
          action={{ label: t("Adjust my search"), onClick: onFilters }}
        />
      ) : (
        <EmptyState
          icon={<Sparkles />}
          title={t("You’re all caught up.")}
          body={t(
            "Good people are worth the wait. Adjust your filters or revisit the people you liked.",
          )}
          action={{ label: t("Adjust my search"), onClick: onFilters }}
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
