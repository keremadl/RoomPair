"use client";

import { ShieldCheck } from "lucide-react";
import { Modal } from "../ui";
import { useApp } from "../app/controller";
import type { Profile } from "@/lib/types";

export function ReportDialog({ detail }: { detail: Profile }) {
  const { t, setState, setDialog, reportReason, setReportReason, notify } =
    useApp();
  return (
    <Modal title={t("Profile options")} onClose={() => setDialog(null)}>
      <div className="modal-eyebrow">
        <ShieldCheck size={20} />
        {t("YOUR COMFORT COMES FIRST")}
      </div>
      <h2>{t("A little more peace of mind.")}</h2>
      <p className="modal-description">
        {t("You’re in control of who you connect with.")}
      </p>
      <label className="report-label">
        {t("Reason for reporting")}
        <select
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
        >
          {[
            "Misleading profile",
            "Inappropriate messages",
            "Suspicious listing",
            "Something else",
          ].map((r) => (
            <option key={r} value={r}>
              {t(r)}
            </option>
          ))}
        </select>
      </label>
      <button
        className="button secondary full-width"
        onClick={() => {
          setState((s) => ({
            ...s,
            reports: [
              ...s.reports,
              { profileId: detail.id, reason: reportReason },
            ],
          }));
          setDialog(null);
          notify(
            t("Demo report saved locally. No moderation service is connected."),
          );
        }}
      >
        {t("Save a demo report")}
      </button>
      <button
        className="button danger full-width"
        onClick={() => {
          setState((s) => ({
            ...s,
            blocked: [...s.blocked, detail.id],
            chats: s.chats.filter((c) => c.profileId !== detail.id),
          }));
          setDialog(null);
          notify(t("Profile blocked and conversation removed."));
        }}
      >
        {t("Block {name}", { name: detail.name })}
      </button>
    </Modal>
  );
}
