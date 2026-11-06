"use client";
import { Bookmark, BookmarkCheck, MapPin } from "lucide-react";
import { Avatar, Button, IconButton } from "@/design-system";
import { profiles } from "@/lib/data";
import { dateLabel } from "@/lib/discover/deck";
import { useI18n } from "@/lib/i18n";
import type { Room } from "@/lib/types";
import r from "./RoomTile.module.css";

/** The host who lists a room (rooms are built from host profiles). */
export const hostOf = (room: Room) =>
  profiles.find((p) => `room-${p.id}` === room.id);

/**
 * A room as an item card: photo, rent, area, host, move-in and stay.
 * `children` adds a row under the facts (My space puts the viewing there).
 */
export function RoomTile({
  room,
  saved,
  onOpen,
  onToggle,
  children,
}: {
  room: Room;
  saved: boolean;
  onOpen: () => void;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  const { t } = useI18n();
  const host = hostOf(room);
  return (
    <article className={r.tile} aria-label={room.title}>
      <button
        type="button"
        className={r.photo}
        onClick={onOpen}
        aria-label={`${t("Open room")}: ${room.title}`}
      >
        <img src={room.photo} alt="" />
        <span className={r.price}>
          €{room.price}
          <small> / {t("month")}</small>
        </span>
      </button>
      <div className={r.body}>
        <h3 className={r.title}>{room.title}</h3>
        <p className={r.area}>
          <MapPin aria-hidden="true" /> {room.neighborhood}
        </p>
        {host && (
          <dl className={r.facts}>
            <div>
              <dt>{t("From")}</dt>
              <dd>{dateLabel(host.moveDate)}</dd>
            </div>
            <div>
              <dt>{t("Stay")}</dt>
              <dd>
                {host.stayMonths} {t("months")}
              </dd>
            </div>
          </dl>
        )}
        {host && (
          <p className={r.host}>
            <Avatar name={host.name} src={host.photo} size="sm" />
            <span>
              {t("Host")}: <strong>{host.name}</strong>, {host.age}
            </span>
          </p>
        )}
        {children}
        <div className={r.actions}>
          <Button size="sm" variant="secondary" onClick={onOpen}>
            {t("Open room")}
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
    </article>
  );
}
