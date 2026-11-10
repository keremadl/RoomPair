"use client";

import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  DoorOpen,
  MapPin,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { Room } from "@/lib/types";

export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">
          <span />
          {eyebrow}
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </div>
  );
}
export function RoomCard({
  room,
  saved,
  onSave,
  onOpen,
}: {
  room: Room;
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
}) {
  const { t } = useI18n();
  return (
    <article className="room-card">
      <div className="room-card-image">
        <button
          onClick={onOpen}
          aria-label={t("View {title}", { title: room.title })}
        >
          <img src={room.photo} alt={room.title} />
        </button>
        <span className="room-type">
          <DoorOpen size={13} />
          {t("Private room")}
        </span>
        <button
          className={`bookmark-button ${saved ? "saved" : ""}`}
          onClick={onSave}
          aria-label={saved ? t("Unsave room") : t("Save room")}
        >
          <Bookmark size={19} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="room-card-body">
        <span className="room-location">
          <MapPin size={13} />
          {room.neighborhood}, {room.city}
        </span>
        <button className="room-title-button" onClick={onOpen}>
          <h3>{room.title}</h3>
          <ArrowUpRight size={18} />
        </button>
        <div className="room-tags">
          {room.tags.slice(0, 2).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="room-price">
          <strong>
            €{room.price}
            <small> / {t("month")}</small>
          </strong>
          <button className="text-button" onClick={onOpen}>
            {t("Take a look")}
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
