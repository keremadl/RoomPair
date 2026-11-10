"use client";

import { Bookmark, MapPin, ShieldCheck } from "lucide-react";
import { Modal } from "../ui";
import { useApp } from "../app/controller";
import type { Room } from "@/lib/types";

export function RoomDialog({ selectedRoom }: { selectedRoom: Room }) {
  const { t, state, setDialog, notify, toggleRoom } = useApp();
  return (
    <Modal
      title={selectedRoom.title}
      onClose={() => setDialog(null)}
      wide
      className="room-detail-modal"
    >
      <img
        className="room-detail-photo"
        src={selectedRoom.photo}
        alt={selectedRoom.title}
      />
      <div className="room-detail-body">
        <span className="eyebrow">
          <MapPin size={14} />
          {selectedRoom.neighborhood}, {selectedRoom.city}
        </span>
        <h2>{selectedRoom.title}</h2>
        <strong className="room-detail-price">
          €{selectedRoom.price}
          <small> / {t("month")}</small>
        </strong>
        <p>{selectedRoom.description}</p>
        <div className="habit-pills">
          {selectedRoom.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <p className="verification-note">
          <ShieldCheck size={18} />
          {t(
            "Fictional demo listing. Property and rental authority are not verified.",
          )}
        </p>
        <button
          className="button primary"
          onClick={() => {
            toggleRoom(selectedRoom.id);
            notify(
              state.savedRooms.includes(selectedRoom.id)
                ? t("Removed from your shared space.")
                : t("Saved. One step closer to your next chapter."),
            );
          }}
        >
          <Bookmark
            size={17}
            fill={
              state.savedRooms.includes(selectedRoom.id)
                ? "currentColor"
                : "none"
            }
          />
          {state.savedRooms.includes(selectedRoom.id)
            ? t("Saved to our space")
            : t("Save to our space")}
        </button>
      </div>
    </Modal>
  );
}
