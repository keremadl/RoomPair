"use client";

import {
  BadgeCheck,
  CalendarDays,
  Check,
  Heart,
  Home,
  Leaf,
  MessageCircle,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { getCompatibility } from "@/lib/matching";
import { Modal } from "../ui";
import { useApp } from "../app/controller";
import type { Profile } from "@/lib/types";

export function DetailsDialog({ detail }: { detail: Profile }) {
  const { t, state, dateLabel, setDialog, setSelected, openChat, decide } =
    useApp();
  const fit = getCompatibility(detail, state.preferences, t);
  return (
    <Modal
      title={t("{name}'s profile", { name: detail.name })}
      onClose={() => setDialog(null)}
      wide
      className="profile-detail-modal"
    >
      <div className="detail-photo">
        <img src={detail.photo} alt={detail.name} />
        <div>
          <span>
            {detail.neighborhood}, {detail.city}
          </span>
          <h2>
            {detail.name}
            {detail.age > 0 && `, ${detail.age}`}
            {detail.verified && <BadgeCheck size={25} />}
          </h2>
          <p>
            {detail.occupation} · {detail.university}
          </p>
        </div>
      </div>
      <div className="detail-body">
        <div className="detail-intro">
          <span className="green-pill">
            <Leaf size={14} />
            {fit.score}% {t("lifestyle fit")}
          </span>
          {detail.active && (
            <span className="small-status">
              <i />
              {t("Actively looking")}
            </span>
          )}
        </div>
        <h3>{t("A little about me")}</h3>
        <p>{detail.bio}</p>
        <div className="detail-facts">
          <span>
            <Wallet size={18} />€{detail.budget[0]}–{detail.budget[1]} /{" "}
            {t("month")}
          </span>
          <span>
            <CalendarDays size={18} />
            {dateLabel(detail.moveDate)} · {detail.stayMonths} {t("months")}
          </span>
          <span>
            <Home size={18} />
            {detail.intent === "have-room"
              ? t("Has a room")
              : t("Looking for a room")}
          </span>
        </div>
        <div className="detail-prompt">
          <small>{detail.prompt.question}</small>
          <p>“{detail.prompt.answer}”</p>
        </div>
        <h3>{t("The everyday things")}</h3>
        <div className="habit-pills">
          <span>
            {detail.habits.smoking ? t("Smoking indoors") : t("Smoke-free")}
          </span>
          <span>
            {t(
              detail.habits.sleep === "early"
                ? "Early bird"
                : detail.habits.sleep === "late"
                  ? "Night owl"
                  : "Flexible sleep schedule",
            )}
          </span>
          <span>
            {detail.habits.cleanliness >= 4
              ? t("Keeps things tidy")
              : t("Relaxed about cleaning")}
          </span>
          {detail.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        {detail.room && (
          <div className="detail-room">
            <img src={detail.room.photo} alt={detail.room.title} />
            <div>
              <h3>{detail.room.title}</h3>
              <p>{detail.room.description}</p>
              <strong>
                €{detail.room.price} / {t("month")}
              </strong>
            </div>
          </div>
        )}
        <div className="verification-note">
          <ShieldCheck size={18} />
          <span>
            {detail.verified
              ? t("Student status: verified in demo.")
              : t("Student status: not verified.")}
            <small>
              {t("Identity and rental authority have not been checked.")}
            </small>
          </span>
        </div>
        <div className="detail-actions">
          <button
            className="button secondary"
            onClick={() => {
              setSelected(detail);
              setDialog("compatibility");
            }}
          >
            {t("See why you fit")}
          </button>
          {state.chats.some((c) => c.profileId === detail.id) ? (
            <button className="button primary" onClick={() => openChat(detail)}>
              <MessageCircle size={17} />
              {t("Say hello")}
            </button>
          ) : state.decisions.some(
              (d) => d.id === detail.id && d.action === "like",
            ) ? (
            <button className="button secondary" disabled>
              <Check size={17} />
              {t("Like sent")}
            </button>
          ) : (
            <button
              className="button primary"
              onClick={() => decide("like", detail)}
            >
              <Heart size={17} />
              {t("Send a like")}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
