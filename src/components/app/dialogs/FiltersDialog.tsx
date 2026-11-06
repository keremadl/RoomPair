"use client";
import { useState } from "react";
import { Button, Dialog, Input, Select, Switch, Text } from "@/design-system";
import { useI18n } from "@/lib/i18n";
import type { Preferences } from "@/lib/types";
import d from "./dialogs.module.css";

export function FiltersDialog({
  initial,
  onClose,
  onApply,
  onInvalid,
}: {
  initial: Preferences;
  onClose: () => void;
  onApply: (p: Preferences) => void;
  onInvalid: () => void;
}) {
  const { t } = useI18n();
  const [draft, setDraft] = useState<Preferences>({ ...initial });
  const set = <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
    setDraft((p) => ({ ...p, [key]: value }));
  const invalid = draft.budgetMin > draft.budgetMax;
  return (
    <Dialog title={t("discover.filters")} onClose={onClose}>
      <Text tone="muted" className={d.lead}>
        {t("Your must-haves come first. Always.")}
      </Text>
      <form
        className={d.form}
        onSubmit={(e) => {
          e.preventDefault();
          if (invalid) return onInvalid();
          onApply(draft);
        }}
      >
        <Input
          label={t("City")}
          value={draft.city}
          onChange={(e) => set("city", e.target.value)}
          required
        />
        <div className={d.row}>
          <Input
            label={t("Monthly budget, from")}
            type="number"
            prefix="€"
            min={0}
            value={draft.budgetMin}
            onChange={(e) => set("budgetMin", Number(e.target.value))}
          />
          <Input
            label={t("Up to")}
            type="number"
            prefix="€"
            min={0}
            value={draft.budgetMax}
            onChange={(e) => set("budgetMax", Number(e.target.value))}
            error={
              invalid
                ? t("Your maximum budget must be above your minimum.")
                : undefined
            }
          />
        </div>
        <div className={d.row}>
          <Input
            label={t("Move-in date")}
            type="date"
            value={draft.moveDate}
            onChange={(e) => set("moveDate", e.target.value)}
          />
          <Input
            label={t("Stay in months")}
            type="number"
            min={1}
            max={24}
            value={draft.stayMonths}
            onChange={(e) => set("stayMonths", Number(e.target.value))}
          />
        </div>
        <div className={d.switches}>
          <Switch
            label={t("A smoke-free home")}
            description={t("A must-have, not a suggestion.")}
            checked={draft.smokeFree}
            onChange={(v) => set("smokeFree", v)}
          />
          <Switch
            label={t("Pets are welcome")}
            description={t("Room for a four-legged flatmate.")}
            checked={draft.petsOkay}
            onChange={(v) => set("petsOkay", v)}
          />
          <Switch
            label={t("Student badge only")}
            description={t("Show demo student-verified profiles.")}
            checked={draft.verifiedOnly}
            onChange={(v) => set("verifiedOnly", v)}
          />
        </div>
        <Button type="submit" size="lg" fullWidth>
          {t("Show my people")}
        </Button>
      </form>
    </Dialog>
  );
}
