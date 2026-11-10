"use client";

import { Leaf, MessageCircle, SlidersHorizontal } from "lucide-react";
import { getCompatibility } from "@/lib/matching";
import { Modal } from "../ui";
import { useApp } from "../app/controller";
import type { Profile } from "@/lib/types";

export function CompatibilityDialog({ detail }: { detail: Profile }) {
  const { t, state, setDialog } = useApp();
  const fit = getCompatibility(detail, state.preferences, t);
  return (
    <Modal title={t("Why you fit")} onClose={() => setDialog(null)}>
      <div className="modal-eyebrow">
        <Leaf size={21} />
        {t("THE LITTLE THINGS ADD UP")}
      </div>
      <h2>{t("You & {name}", { name: detail.name })}</h2>
      <p className="modal-description">
        {t("A closer look at everyday compatibility.")}
      </p>
      <div className="large-fit-score">
        {fit.score}
        <span>% {t("lifestyle fit")}</span>
      </div>
      {!fit.eligible && (
        <div className="consideration">
          <h3>
            <SlidersHorizontal size={17} />
            {t("Your search requirements differ")}
          </h3>
          {getCompatibility(detail, state.preferences, t).dealbreakers.map(
            (reason) => (
              <p key={reason}>{reason}</p>
            ),
          )}
        </div>
      )}
      <div className="breakdown-list">
        {fit.breakdown.map((item) => (
          <div key={item.label}>
            <div>
              <strong>{item.label}</strong>
              <span>{item.score}%</span>
            </div>
            <div className="progress-track">
              <span style={{ width: `${item.score}%` }} />
            </div>
            <p>{item.detail}</p>
          </div>
        ))}
      </div>
      {fit.considerations.length > 0 && (
        <div className="consideration">
          <h3>
            <MessageCircle size={17} />
            {t("Worth a conversation")}
          </h3>
          {getCompatibility(detail, state.preferences, t).considerations.map(
            (c) => (
              <p key={c}>{c}</p>
            ),
          )}
        </div>
      )}
      <p className="score-explanation">
        {t(
          "This is a transparent, rule-based comparison of your answers — not a prediction or a guarantee. Budget, location, dates and must-haves are checked before ranking.",
        )}
      </p>
    </Modal>
  );
}
