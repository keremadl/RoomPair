"use client";

import { Bookmark, CalendarDays, Check, Plus } from "lucide-react";
import { motion } from "motion/react";
import { EmptyState, HomeIllustration } from "../ui";
import { PageHeading, RoomCard } from "../shared";
import { useApp } from "../app/controller";

export function SpaceView() {
  const {
    t,
    state,
    setState,
    dateLabel,
    setView,
    setDialog,
    setSelectedRoom,
    setMode,
    savedRooms,
    toggleRoom,
    toggleTask,
  } = useApp();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-page"
    >
      <PageHeading
        eyebrow={t("THE NEXT CHAPTER, TOGETHER")}
        title={t("space.title")}
        description={t("space.subtitle")}
      />
      <div className="space-banner">
        <div>
          <span className="eyebrow">{t("YOUR RIGA CHAPTER")}</span>
          <h2>{t("Let’s make room for real life.")}</h2>
          <p>
            <CalendarDays size={16} />
            {dateLabel(state.preferences.moveDate)}{" "}
            {state.preferences.moveDate.slice(0, 4)}
            <span>·</span>€{state.preferences.budgetMin}–
            {state.preferences.budgetMax} / {t("month")}
          </p>
        </div>
        <HomeIllustration />
      </div>
      <div className="space-layout">
        <section>
          <div className="section-header">
            <h2>
              {t("Places worth a look")}
              <span>{savedRooms.length}</span>
            </h2>
            <button
              className="text-button"
              onClick={() => {
                setView("discover");
                setMode("rooms");
              }}
            >
              <Plus size={16} />
              {t("Add a place")}
            </button>
          </div>
          <div className="saved-rooms">
            {savedRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                saved
                onSave={() => toggleRoom(room.id)}
                onOpen={() => {
                  setSelectedRoom(room);
                  setDialog("room");
                }}
              />
            ))}
            {savedRooms.length === 0 && (
              <EmptyState
                icon={Bookmark}
                title={t("Room for a favourite.")}
                body={t("Save homes from Discover to compare them here.")}
                action={() => {
                  setView("discover");
                  setMode("rooms");
                }}
                label={t("Explore rooms")}
              />
            )}
          </div>
          <div className="space-notes">
            <div className="section-header">
              <h2>{t("A little shared notebook")}</h2>
              <span>{t("Saved on this device")}</span>
            </div>
            <textarea
              placeholder={t(
                "Neighbourhoods you love, questions for a viewing, the coffee table you both want…",
              )}
              value={state.notes}
              onChange={(e) =>
                setState((s) => ({ ...s, notes: e.target.value }))
              }
              aria-label={t("Shared notes")}
            />
          </div>
        </section>
        <aside>
          <div className="checklist-card">
            <div className="section-header">
              <h2>{t("Before you move in")}</h2>
              <span>{state.checklist.length}/5</span>
            </div>
            <div className="progress-track">
              <span style={{ width: `${state.checklist.length * 20}%` }} />
            </div>
            <p>{t("Small conversations. A much happier home.")}</p>
            {[
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
            ].map((task) => (
              <button
                className={`checklist-item ${state.checklist.includes(task.id) ? "checked" : ""}`}
                key={task.id}
                onClick={() => toggleTask(task.id)}
              >
                <span className="checkbox">
                  {state.checklist.includes(task.id) && <Check size={14} />}
                </span>
                <span>
                  <strong>{t(task.title)}</strong>
                  <small>{t(task.sub)}</small>
                </span>
              </button>
            ))}
          </div>
          <div className="viewing-card">
            <CalendarDays size={22} />
            <h3>{t("Put a little plan in place.")}</h3>
            <label>
              {t("Your next viewing")}
              <input
                type="datetime-local"
                value={state.viewing}
                onChange={(e) =>
                  setState((s) => ({ ...s, viewing: e.target.value }))
                }
              />
            </label>
            {state.viewing && (
              <p className="success-text">
                <Check size={14} />
                {t("Saved to your moving plan.")}
              </p>
            )}
          </div>
          <p className="space-caption">
            {t(
              "A shared-living checklist, not a rental agreement. Demo plans are saved on this device.",
            )}
          </p>
        </aside>
      </div>
    </motion.div>
  );
}
