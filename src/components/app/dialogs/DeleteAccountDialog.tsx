"use client";
import { useState } from "react";
import { Button, Dialog, Text } from "@/design-system";
import { useI18n } from "@/lib/i18n";
import d from "./dialogs.module.css";

/** Last check before an account and everything in it is removed. */
export function DeleteAccountDialog({
  onDelete,
  onClose,
}: {
  /** Resolves to false when the account could not be deleted. */
  onDelete: () => Promise<boolean>;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <Dialog title={t("Delete your account?")} onClose={onClose}>
      <Text tone="muted" className={d.lead}>
        {t(
          "Your profile, photos, likes, matches and messages are removed for good. This cannot be undone.",
        )}
      </Text>
      {failed && (
        <Text tone="danger" role="alert">
          {t("Something went wrong. Please try again in a moment.")}
        </Text>
      )}
      <div className={d.actions}>
        <Button
          variant="danger"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setFailed(false);
            const done = await onDelete();
            // On success the whole app is replaced by the sign-in screen.
            if (!done) {
              setFailed(true);
              setBusy(false);
            }
          }}
        >
          {t("Delete my account")}
        </Button>
        <Button variant="secondary" disabled={busy} onClick={onClose}>
          {t("Keep my account")}
        </Button>
      </div>
    </Dialog>
  );
}
