"use client";
import { useState } from "react";
import { Badge, Button, Dialog, Text } from "@/design-system";
import type { Moderation, ReviewItem } from "@/lib/app-data";
import { useI18n } from "@/lib/i18n";
import d from "./dialogs.module.css";

const reasonLabel: Record<string, string> = {
  "misleading-profile": "Misleading profile",
  "inappropriate-messages": "Inappropriate messages",
  "suspicious-listing": "Suspicious listing",
  other: "Something else",
};
const statusLabel = {
  open: "Open",
  reviewed: "Reviewed",
  dismissed: "Dismissed",
} as const;

/** The moderators' queue: who reported whom and why, with ways to close it. */
export function ModerationDialog({
  moderation,
  onClose,
}: {
  moderation: Moderation;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [busy, setBusy] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  async function review(
    item: ReviewItem,
    outcome: "reviewed" | "dismissed",
    suspend = false,
  ) {
    setBusy(item.id);
    setFailed(false);
    if (!(await moderation.review(item.id, outcome, suspend))) setFailed(true);
    setBusy(null);
  }
  return (
    <Dialog title={t("Reports to review")} onClose={onClose} size="lg">
      <Text tone="muted" className={d.lead}>
        {moderation.reports.length
          ? t(
              "Hiding a member removes their profile and listing for everyone else.",
            )
          : t("Nobody has been reported.")}
      </Text>
      {failed && (
        <Text tone="danger" role="alert">
          {t("Something went wrong. Please try again in a moment.")}
        </Text>
      )}
      <ul className={d.reports}>
        {moderation.reports.map((item) => (
          <li key={item.id}>
            <div className={d.reportHead}>
              <Text weight="semibold">
                {t("{reporter} reported {reported}", {
                  reporter: item.reporter_name,
                  reported: item.reported_name,
                })}
              </Text>
              <Badge tone={item.status === "open" ? "accent" : "neutral"}>
                {t(statusLabel[item.status])}
              </Badge>
            </div>
            <Text tone="muted" size="sm">
              {t(reasonLabel[item.reason] ?? reasonLabel.other)}
              {" · "}
              {new Date(item.created_at).toLocaleDateString(
                document.documentElement.lang || "en",
              )}
              {" · "}
              {t("Reports about this member: {count}", {
                count: item.reports_against,
              })}
            </Text>
            {item.suspended && (
              <Text tone="danger" size="sm">
                {t("Hidden from other members.")}
              </Text>
            )}
            {item.status === "open" && (
              <div className={d.reportActions}>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={busy !== null}
                  onClick={() => review(item, "dismissed")}
                >
                  {t("Dismiss")}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={busy !== null}
                  onClick={() => review(item, "reviewed")}
                >
                  {t("Mark as reviewed")}
                </Button>
                {!item.suspended && (
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={busy !== null}
                    onClick={() => review(item, "reviewed", true)}
                  >
                    {t("Hide this member")}
                  </Button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </Dialog>
  );
}
