"use client";
import { Bookmark, BookmarkCheck, MapPin } from "lucide-react";
import { Badge, Button, Card, IconButton } from "@/design-system";
import { useI18n } from "@/lib/i18n";
import type { Room } from "@/lib/types";
import v from "./views/views.module.css";

/** A room listing in a grid: photo, price, area, save and open. */
export function RoomTile({
  room,
  saved,
  onOpen,
  onToggle,
}: {
  room: Room;
  saved: boolean;
  onOpen: () => void;
  onToggle: () => void;
}) {
  const { t } = useI18n();
  return (
    <Card padding="none" className={v.tile}>
      <button
        type="button"
        className={v.tilePhoto}
        onClick={onOpen}
        aria-label={`${t("Take a look")}: ${room.title}`}
      >
        <img src={room.photo} alt="" />
        <Badge tone="neutral" className={v.tileBadge}>
          €{room.price} / {t("month")}
        </Badge>
      </button>
      <div className={v.tileBody}>
        <h3 className={v.tileTitle}>{room.title}</h3>
        <p className={v.tileMeta}>
          <MapPin aria-hidden="true" /> {room.neighborhood}
        </p>
        <div className={v.tileActions}>
          <Button size="sm" variant="secondary" onClick={onOpen}>
            {t("Take a look")}
          </Button>
          <IconButton
            size="sm"
            variant="outline"
            label={saved ? t("Unsave room") : t("Save room")}
            aria-pressed={saved}
            icon={saved ? <BookmarkCheck /> : <Bookmark />}
            onClick={onToggle}
          />
        </div>
      </div>
    </Card>
  );
}
