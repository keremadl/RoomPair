"use client";
import { Bookmark, Check } from "@/design-system/icons";
import {
  Button,
  EmptyState,
  Heading,
  Input,
  Text,
  Textarea,
} from "@/design-system";
import type { AppState } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import type { Room } from "@/lib/types";
import { RoomTile } from "../RoomTile";
import v from "./views.module.css";

const tasks = [
  {
    id: "budget",
    title: "Rent and bills",
    sub: "Who pays what, and by which day?",
  },
  {
    id: "cleaning",
    title: "Cleaning",
    sub: "A daily tidy-up or a weekly rota?",
  },
  {
    id: "guests",
    title: "Guests and quiet hours",
    sub: "How often are guests fine? Quiet after what time?",
  },
  {
    id: "viewing",
    title: "Visit the room together",
    sub: "Plan a viewing for one of your saved rooms.",
  },
  {
    id: "agreement",
    title: "House rules in writing",
    sub: "Write down what you agreed on.",
  },
];

/** Saved rooms with their viewings, the move-in checklist and notes. */
export function SpaceView({
  state,
  rooms,
  onOpenRoom,
  onToggleRoom,
  onToggleTask,
  onNotes,
  onViewing,
  onExploreRooms,
}: {
  state: AppState;
  rooms: Room[];
  onOpenRoom: (room: Room) => void;
  onToggleRoom: (id: string) => void;
  onToggleTask: (id: string) => void;
  onNotes: (notes: string) => void;
  onViewing: (roomId: string, viewing: string) => void;
  onExploreRooms: () => void;
}) {
  const { t } = useI18n();
  const saved = rooms.filter((r) => state.savedRooms.includes(r.id));
  const done = state.checklist.length;
  const host = state.preferences.intent === "have-room";
  const checklist = (
    <section className={v.panel} aria-labelledby="checklist-title">
      <div className={v.sectionHead}>
        <Heading level={2} size="lg" id="checklist-title">
          {t("Move-in checklist")}
        </Heading>
        <Text size="sm" tone="muted">
          {done}/{tasks.length}
        </Text>
      </div>
      <div
        className={v.progress}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={tasks.length}
        aria-valuenow={done}
        aria-label={t("Move-in checklist")}
      >
        <span style={{ width: `${(done / tasks.length) * 100}%` }} />
      </div>
      <ul className={v.checklist}>
        {tasks.map((task) => {
          const isDone = state.checklist.includes(task.id);
          return (
            <li key={task.id}>
              <button
                type="button"
                className={v.check}
                aria-pressed={isDone}
                onClick={() => onToggleTask(task.id)}
              >
                <span className={v.checkBox}>
                  {isDone && <Check aria-hidden="true" />}
                </span>
                <span>
                  <strong>{t(task.title)}</strong>
                  <small>{t(task.sub)}</small>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
  return (
    <>
      <div className={v.spaceGrid}>
        {host ? (
          // Hosts are not looking for a room: their space is the checklist and notes.
          checklist
        ) : (
          <section aria-labelledby="saved-title" className={v.stack}>
            <div className={v.sectionHead}>
              <Heading level={2} size="xl" id="saved-title">
                {t("Saved rooms")} · {saved.length}
              </Heading>
              <Button variant="secondary" size="sm" onClick={onExploreRooms}>
                {t("Go to Discover")}
              </Button>
            </div>
            {saved.length ? (
              <div className={v.roomGrid}>
                {saved.map((room) => (
                  <RoomTile
                    key={room.id}
                    room={room}
                    saved
                    onOpen={() => onOpenRoom(room)}
                    onToggle={() => onToggleRoom(room.id)}
                  >
                    <Input
                      type="datetime-local"
                      label={t("Viewing")}
                      value={state.viewings[room.id] ?? ""}
                      onChange={(e) => onViewing(room.id, e.target.value)}
                    />
                  </RoomTile>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Bookmark />}
                title={t("No saved rooms")}
                body={t(
                  "Save rooms on Discover to compare them and plan viewings here.",
                )}
                action={{ label: t("Go to Discover"), onClick: onExploreRooms }}
              />
            )}
          </section>
        )}
        <aside className={v.stack}>
          {!host && checklist}
          <section className={v.panel}>
            <Textarea
              label={t("Notes")}
              className={v.notes}
              hint={t("Only saved on this device.")}
              placeholder={t("Questions for the viewing, things to buy…")}
              value={state.notes}
              onChange={(e) => onNotes(e.target.value)}
              rows={5}
            />
          </section>
        </aside>
      </div>
    </>
  );
}
