"use client";

import {
  BadgeCheck,
  Check,
  Heart,
  Leaf,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { getCompatibility } from "@/lib/matching";
import { EmptyState } from "../ui";
import { PageHeading } from "../shared";
import { useApp } from "../app/controller";

export function LikesView() {
  const {
    t,
    state,
    likesTab,
    setLikesTab,
    received,
    sent,
    notify,
    changeView,
    openProfile,
    openChat,
    decide,
  } = useApp();
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeading
        eyebrow={t("A LITTLE MUTUAL FEELING")}
        title={t("likes.title")}
        description={t("likes.subtitle")}
      />
      <div className="tabs">
        <button
          className={likesTab === "received" ? "active" : ""}
          onClick={() => setLikesTab("received")}
        >
          {t("likes.received")}
          <span>{received.length}</span>
        </button>
        <button
          className={likesTab === "sent" ? "active" : ""}
          onClick={() => setLikesTab("sent")}
        >
          {t("likes.sent")}
          <span>{sent.length}</span>
        </button>
      </div>
      <div className="likes-grid">
        {(likesTab === "received" ? received.map((r) => r.profile) : sent).map(
          (p) => (
            <div className="like-tile" key={p.id}>
              <button className="like-photo" onClick={() => openProfile(p)}>
                <img src={p.photo} alt={p.name} />
                <span className="tile-score">
                  <Leaf size={14} />
                  {getCompatibility(p, state.preferences, t).score}% {t("fit")}
                </span>
              </button>
              <div className="like-info">
                <h3>
                  {p.name}, {p.age}
                  {p.verified && <BadgeCheck size={18} />}
                </h3>
                <p>{p.occupation}</p>
                <span>
                  <MapPin size={13} />
                  {p.neighborhood}
                </span>
                {likesTab === "received" ? (
                  <button
                    className="button primary"
                    onClick={() => decide("like", p)}
                  >
                    <Heart size={17} />
                    {t("Like back")}
                  </button>
                ) : (
                  <button
                    className="button secondary"
                    onClick={() =>
                      p.likesYou
                        ? openChat(p)
                        : notify(
                            t(
                              "Your like is on its way. Chat opens with a mutual match.",
                            ),
                          )
                    }
                  >
                    {p.likesYou ? (
                      <>
                        <MessageCircle size={17} />
                        {t("Say hello")}
                      </>
                    ) : (
                      <>
                        <Check size={17} />
                        {t("Like sent")}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ),
        )}
      </div>
      {(likesTab === "received" ? received : sent).length === 0 && (
        <EmptyState
          icon={Heart}
          title={t("Good connections take a little time.")}
          body={t(
            "Explore your community and send a like to someone you could see yourself living with.",
          )}
          action={() => changeView("discover")}
          label={t("Meet your people")}
        />
      )}
    </motion.div>
  );
}
