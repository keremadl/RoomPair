"use client";

import { ArrowRight } from "lucide-react";
import { Brand, HomeIllustration, Modal } from "../ui";
import { useApp } from "../app/controller";

export function HelpDialog() {
  const { t, setDialog, setOnboarding } = useApp();
  return (
    <Modal title={t("The RoomPair way")} onClose={() => setDialog(null)}>
      <Brand />
      <HomeIllustration />
      <h2>{t("Find your people. Then your place.")}</h2>
      <p className="modal-description">
        {t(
          "A good roommate is more than a good profile. RoomPair puts everyday life at the heart of finding a home.",
        )}
      </p>
      <div className="help-steps">
        <p>
          <span>01</span>
          <strong>{t("Your must-haves, respected.")}</strong>
          {t("Budget, moving dates and dealbreakers come before the score.")}
        </p>
        <p>
          <span>02</span>
          <strong>{t("A feeling that goes both ways.")}</strong>
          {t(
            "Like, match, and have a real conversation. No pressure, no paywall.",
          )}
        </p>
        <p>
          <span>03</span>
          <strong>{t("From a match to a moving plan.")}</strong>
          {t("Save places, talk house rules, and plan your new chapter.")}
        </p>
      </div>
      <p className="demo-disclosure">
        {t(
          "This is a school-project prototype. People, listings, student badges and replies are fictional demonstrations. Your changes stay in this browser.",
        )}
      </p>
      <button
        className="button primary full-width"
        onClick={() => {
          setDialog(null);
          setOnboarding(true);
        }}
      >
        {t("Make RoomPair yours")}
        <ArrowRight size={17} />
      </button>
    </Modal>
  );
}
