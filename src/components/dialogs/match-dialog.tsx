"use client";

import { Heart, Leaf, MessageCircle } from "lucide-react";
import { getCompatibility } from "@/lib/matching";
import { Modal } from "../ui";
import { useApp } from "../app/controller";
import type { Profile } from "@/lib/types";

export function MatchDialog({ detail }: { detail: Profile }) {
  const { t, state, setDialog, openChat } = useApp();
  const fit = getCompatibility(detail, state.preferences, t);
  return (
    <Modal
      title={t("It’s a RoomPair!")}
      onClose={() => setDialog(null)}
      className="match-modal"
    >
      <div className="match-sprinkles" aria-hidden="true">
        <span>✳</span>
        <span>✦</span>
        <span>✧</span>
        <span>✦</span>
      </div>
      <span className="eyebrow">{t("GOOD FEELING. MUTUAL FEELING.")}</span>
      <div className="match-portraits">
        <span className="match-me">{state.preferences.name.charAt(0)}</span>
        <span className="match-heart">
          <Heart fill="currentColor" size={22} />
        </span>
        <img src={detail.photo} alt={detail.name} />
      </div>
      <h2>{t("It’s a RoomPair!")}</h2>
      <p>
        {t("You and {name} both see a little home in each other.", {
          name: detail.name,
        })}
      </p>
      <span className="green-pill">
        <Leaf size={15} />
        {fit.score}% {t("lifestyle fit")}
      </span>
      <button
        className="button primary full-width"
        onClick={() => openChat(detail)}
      >
        {t("Say a little hello")}
        <MessageCircle size={18} />
      </button>
      <button className="text-button" onClick={() => setDialog(null)}>
        {t("Keep exploring")}
      </button>
    </Modal>
  );
}
