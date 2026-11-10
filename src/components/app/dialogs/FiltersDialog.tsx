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
  // Number fields keep what is typed (an emptied field stays empty, not 0);
  // they become numbers on submit.
  const [numbers, setNumbers] = useState({
    budgetMin: String(initial.budgetMin),
    budgetMax: String(initial.budgetMax),
    stayMonths: String(initial.stayMonths),
  });
  const [submitted, setSubmitted] = useState(false);
  const set = <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
    setDraft((p) => ({ ...p, [key]: value }));
  const setNumber = (key: keyof typeof numbers, value: string) =>
    setNumbers((n) => ({ ...n, [key]: value }));
  const min = Number(numbers.budgetMin);
  const max = Number(numbers.budgetMax);
  const stay = Number(numbers.stayMonths);
  const errors = {
    city: draft.city.trim() ? "" : t("Enter a city."),
    budgetMin:
      numbers.budgetMin === "" || min < 0
        ? t("Enter a budget of €0 or more.")
        : "",
    budgetMax:
      numbers.budgetMax === "" || max < 0
        ? t("Enter a budget of €0 or more.")
        : min >= max
          ? t("Your maximum budget must be above your minimum.")
          : "",
    moveDate: draft.moveDate ? "" : t("Choose a move-in date."),
    stayMonths:
      numbers.stayMonths === "" ||
      !Number.isInteger(stay) ||
      stay < 1 ||
      stay > 24
        ? t("Choose between 1 and 24 months.")
        : "",
  };
  const invalid = Object.values(errors).some(Boolean);
  // The budget pair is checked as you type; the rest once you try to apply.
  const show = (key: keyof typeof errors) =>
    submitted || key === "budgetMax" ? errors[key] || undefined : undefined;
  return (
    <Dialog title={t("discover.filters")} onClose={onClose}>
      <Text tone="muted" className={d.lead}>
        {t("Your must-haves come first. Always.")}
      </Text>
      <form
        className={d.form}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
          if (invalid) return onInvalid();
          onApply({
            ...draft,
            city: draft.city.trim(),
            budgetMin: min,
            budgetMax: max,
            stayMonths: stay,
          });
        }}
      >
        <Input
          label={t("City")}
          value={draft.city}
          onChange={(e) => set("city", e.target.value)}
          error={show("city")}
        />
        <div className={d.row}>
          <Input
            label={t("Monthly budget, from")}
            type="number"
            prefix="€"
            min={0}
            inputMode="numeric"
            value={numbers.budgetMin}
            onChange={(e) => setNumber("budgetMin", e.target.value)}
            error={show("budgetMin")}
          />
          <Input
            label={t("Up to")}
            type="number"
            prefix="€"
            min={0}
            inputMode="numeric"
            value={numbers.budgetMax}
            onChange={(e) => setNumber("budgetMax", e.target.value)}
            error={show("budgetMax")}
          />
        </div>
        <div className={d.row}>
          <Input
            label={t("Move-in date")}
            type="date"
            value={draft.moveDate}
            onChange={(e) => set("moveDate", e.target.value)}
            error={show("moveDate")}
          />
          <Input
            label={t("Stay in months")}
            type="number"
            min={1}
            max={24}
            inputMode="numeric"
            value={numbers.stayMonths}
            onChange={(e) => setNumber("stayMonths", e.target.value)}
            error={show("stayMonths")}
          />
        </div>
        <Select
          label={t("Who would you like to live with?")}
          hint={t("People who did not give a gender only show with Anyone.")}
          value={draft.livingWith}
          onChange={(e) =>
            set("livingWith", e.target.value as Preferences["livingWith"])
          }
          options={[
            { value: "anyone", label: t("Anyone") },
            { value: "women", label: t("Women only") },
            { value: "men", label: t("Men only") },
          ]}
        />
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
