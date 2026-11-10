"use client";

import { LogOut, RotateCcw, Settings2 } from "lucide-react";
import { Modal } from "../ui";
import { useApp } from "../app/controller";

export function SettingsDialog() {
  const {
    t,
    account,
    signOut,
    reset,
    setView,
    setDialog,
    setMode,
    setListView,
    setPendingReplies,
    replyTimers,
    notify,
  } = useApp();
  if (account)
    return (
      <Modal title={t("auth.account")} onClose={() => setDialog(null)}>
        <div className="modal-eyebrow">
          <Settings2 size={20} />
          {t("YOUR ROOMPAIR")}
        </div>
        <h2>{t("auth.account")}</h2>
        <p className="modal-description">
          {t("auth.signedInAs", { email: account.email })}
        </p>
        <button className="button secondary full-width" onClick={signOut}>
          <LogOut size={17} />
          {t("auth.signOut")}
        </button>
        <button className="text-button" onClick={() => setDialog(null)}>
          {t("common.cancel")}
        </button>
      </Modal>
    );
  return (
    <Modal title={t("Demo settings & data")} onClose={() => setDialog(null)}>
      <div className="modal-eyebrow">
        <Settings2 size={20} />
        {t("YOUR ROOMPAIR")}
      </div>
      <h2>{t("A fresh page, anytime.")}</h2>
      <p className="modal-description">
        {t(
          "Reset the demo to restore sample conversations, likes, and preferences. This only clears RoomPair data in this browser.",
        )}
      </p>
      <button
        className="button secondary full-width"
        onClick={() => {
          replyTimers.current.forEach(clearTimeout);
          setPendingReplies({});
          reset();
          setDialog(null);
          setView("discover");
          setMode("people");
          setListView(false);
          notify(t("Your demo is ready for a new beginning."));
        }}
      >
        <RotateCcw size={17} />
        {t("Reset demo data")}
      </button>
      <button className="text-button" onClick={() => setDialog(null)}>
        {t("common.cancel")}
      </button>
    </Modal>
  );
}
