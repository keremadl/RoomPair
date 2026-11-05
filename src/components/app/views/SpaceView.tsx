"use client";
import { Bookmark, CalendarDays, Check, Plus } from "lucide-react";
import {
  Button,
  Card,
  EmptyState,
  Eyebrow,
  FactGrid,
  Heading,
  Input,
  Text,
  Textarea,
} from "@/design-system";
import type { AppState } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import type { Room } from "@/lib/types";
import { PageHeader } from "../PageHeader";
import { RoomTile } from "../RoomTile";
import v from "./views.module.css";

const tasks = [
  {
    id: "budget",
    title: "Talk budgets & shared bills",
    sub: "Rent, utilities, and the occasional pizza.",
  },
  {
    id: "cleaning",
    title: "Find your cleaning rhythm",
    sub: "A little daily, or a Sunday reset?",
  },
  {
    id: "guests",
    title: "Talk guests & quiet hours",
    sub: "Make space for everyone’s comfort.",
  },
  {
    id: "viewing",
    title: "Visit a place together",
    sub: "See how it feels, in real life.",
  },
  {
    id: "agreement",
    title: "Write down your house rules",
    sub: "Shared expectations, fewer surprises.",
  },
];

const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

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
  onViewing: (viewing: string) => void;
  onExploreRooms: () => void;
}) {
  const { t } = useI18n();
  const saved = rooms.filter((r) => state.savedRooms.includes(r.id));
  const p = state.preferences;
  return (
    <>
      <PageHeader
        eyebrow={t("THE NEXT CHAPTER, TOGETHER")}
        title={t("space.title")}
        description={t("space.subtitle")}
      />
      <Card variant="sunken" padding="lg" className={v.banner}>
        <Eyebrow>{t("YOUR RIGA CHAPTER")}</Eyebrow>
        <Heading level={2} size="2xl">
          {t("Let’s make room for real life.")}
        </Heading>
        <FactGrid
          className={v.bannerFacts}
          facts={[
            { label: t("Ready to move"), value: longDate(p.moveDate) },
            {
              label: t("Monthly budget"),
              value: `€${p.budgetMin}–${p.budgetMax}`,
              note: `/ ${t("month")}`,
            },
          ]}
        />
      </Card>

      <div className={v.spaceGrid}>
        <div className={v.stack}>
          <section aria-labelledby="saved-title">
            <div className={v.sectionHead}>
              <Heading level={2} size="xl" id="saved-title">
                {t("Places worth a look")} · {saved.length}
              </Heading>
              <Button
                variant="ghost"
                size="sm"
                leadingIcon={<Plus />}
                onClick={onExploreRooms}
              >
                {t("Add a place")}
              </Button>
            </div>
            {saved.length ? (
              <div className={v.tileGrid}>
                {saved.map((room) => (
                  <RoomTile
                    key={room.id}
                    room={room}
                    saved
                    onOpen={() => onOpenRoom(room)}
                    onToggle={() => onToggleRoom(room.id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Bookmark />}
                title={t("Room for a favourite.")}
                body={t("Save homes from Discover to compare them here.")}
                action={{ label: t("Explore rooms"), onClick: onExploreRooms }}
              />
            )}
          </section>
          <section aria-labelledby="notes-title">
            <div className={v.sectionHead}>
              <Heading level={2} size="xl" id="notes-title">
                {t("A little shared notebook")}
              </Heading>
              <Text size="sm" tone="muted">
                {t("Saved on this device")}
              </Text>
            </div>
            <Textarea
              label={t("Shared notes")}
              placeholder={t(
                "Neighbourhoods you love, questions for a viewing, the coffee table you both want…",
              )}
              value={state.notes}
              onChange={(e) => onNotes(e.target.value)}
              rows={5}
            />
          </section>
        </div>

        <aside className={v.stack}>
          <Card padding="md">
            <div className={v.sectionHead}>
              <Heading level={2} size="xl">
                {t("Before you move in")}
              </Heading>
              <Text size="sm" tone="muted">
                {state.checklist.length}/{tasks.length}
              </Text>
            </div>
            <div
              className={v.progress}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={tasks.length}
              aria-valuenow={state.checklist.length}
              aria-label={t("Before you move in")}
            >
              <span
                style={{
                  width: `${(state.checklist.length / tasks.length) * 100}%`,
                }}
              />
            </div>
            <Text size="sm" tone="muted">
              {t("Small conversations. A much happier home.")}
            </Text>
            <ul className={v.checklist}>
              {tasks.map((task) => {
                const done = state.checklist.includes(task.id);
                return (
                  <li key={task.id}>
                    <button
                      type="button"
                      className={v.check}
                      aria-pressed={done}
                      onClick={() => onToggleTask(task.id)}
                    >
                      <span className={v.checkBox}>
                        {done && <Check aria-hidden="true" />}
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
          </Card>
          <Card padding="md">
            <Heading level={2} size="lg">
              <CalendarDays aria-hidden="true" className={v.inlineIcon} />{" "}
              {t("Put a little plan in place.")}
            </Heading>
            <Input
              type="datetime-local"
              label={t("Your next viewing")}
              value={state.viewing}
              onChange={(e) => onViewing(e.target.value)}
              className={v.spaced}
            />
            {state.viewing && (
              <Text size="sm" tone="primary" className={v.spaced}>
                <Check aria-hidden="true" className={v.inlineIcon} />{" "}
                {t("Saved to your moving plan.")}
              </Text>
            )}
          </Card>
          <Text size="xs" tone="muted">
            {t(
              "A shared-living checklist, not a rental agreement. Demo plans are saved on this device.",
            )}
          </Text>
        </aside>
      </div>
    </>
  );
}
