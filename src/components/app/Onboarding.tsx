"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Home, Key, Users } from "lucide-react";
import {
  Button,
  Dialog,
  Eyebrow,
  FactGrid,
  Heading,
  Input,
  Slider,
  Switch,
  Text,
} from "@/design-system";
import { useI18n } from "@/lib/i18n";
import type { Preferences, SleepSchedule } from "@/lib/types";
import o from "./Onboarding.module.css";

const steps = ["ob.stepOne", "ob.stepTwo", "ob.stepThree", "ob.stepFour"];
const subs = ["ob.subOne", "ob.subTwo", "ob.subThree", "ob.subFour"];

/** Four short steps that set the preferences matching uses. */
export function Onboarding({
  initial,
  onComplete,
  onClose,
}: {
  initial: Preferences;
  onComplete: (p: Preferences) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [values, setValues] = useState<Preferences>({ ...initial });
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [error, setError] = useState("");
  const set = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setError("");
  };

  function validate() {
    if (step === 0 && !values.name.trim()) return "ob.nameError";
    if (step === 1) {
      if (!values.city.trim()) return "ob.cityError";
      if (
        !Number.isFinite(values.budgetMin) ||
        !Number.isFinite(values.budgetMax) ||
        values.budgetMin < 100 ||
        values.budgetMax > 5000 ||
        values.budgetMax <= values.budgetMin
      )
        return "ob.budgetError";
      const date = new Date(`${values.moveDate}T12:00:00Z`);
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(values.moveDate) ||
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== values.moveDate
      )
        return "ob.dateError";
      if (
        !Number.isInteger(values.stayMonths) ||
        values.stayMonths < 1 ||
        values.stayMonths > 24
      )
        return "ob.stayError";
    }
    return "";
  }
  function next() {
    const invalid = validate();
    if (invalid) return setError(invalid);
    if (step === 3)
      return onComplete({
        ...values,
        name: values.name.trim(),
        city: values.city.trim(),
      });
    setDirection(1);
    setStep((s) => s + 1);
  }
  function back() {
    setError("");
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  }

  const intents: {
    value: Preferences["intent"];
    title: string;
    hint: string;
    icon: typeof Key;
  }[] = [
    {
      value: "find-room",
      title: "ob.findRoom",
      hint: "ob.findRoomHint",
      icon: Home,
    },
    {
      value: "have-room",
      title: "ob.haveRoom",
      hint: "ob.haveRoomHint",
      icon: Key,
    },
    { value: "either", title: "ob.either", hint: "ob.eitherHint", icon: Users },
  ];
  const rhythms: { value: SleepSchedule; label: string }[] = [
    { value: "early", label: "ob.early" },
    { value: "flexible", label: "ob.flexible" },
    { value: "late", label: "ob.late" },
  ];
  const clean = ["", t("ob.relaxed"), "", t("ob.clean"), "", t("ob.spotless")];

  return (
    <Dialog title={t("ob.eyebrow")} onClose={onClose} size="lg" hideTitle>
      <div className={o.head}>
        <Eyebrow>{t("ob.progress", { current: step + 1, total: 4 })}</Eyebrow>
        <div
          className={o.progress}
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={4}
          aria-valuenow={step + 1}
          aria-label={t("ob.eyebrow")}
        >
          {steps.map((_, i) => (
            <span key={i} data-done={i <= step} />
          ))}
        </div>
        <Heading level={2} size="2xl">
          {t(steps[step])}
        </Heading>
        <Text tone="muted">{t(subs[step])}</Text>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
        noValidate
      >
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={step}
            className={o.step}
            initial={{ opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -24 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 && (
              <>
                <Input
                  label={t("ob.yourName")}
                  placeholder={t("ob.namePlaceholder")}
                  value={values.name}
                  onChange={(e) => set("name", e.target.value)}
                  error={error === "ob.nameError" ? t(error) : undefined}
                  autoComplete="given-name"
                />
                <fieldset className={o.choices}>
                  <legend>{t("onboarding.intent")}</legend>
                  {intents.map(({ value, title, hint, icon: Icon }) => (
                    <label
                      key={value}
                      className={o.choice}
                      data-checked={values.intent === value}
                    >
                      <input
                        type="radio"
                        name="intent"
                        value={value}
                        checked={values.intent === value}
                        onChange={() => set("intent", value)}
                      />
                      <Icon aria-hidden="true" />
                      <span>
                        <strong>{t(title)}</strong>
                        <small>{t(hint)}</small>
                      </span>
                      {values.intent === value && (
                        <Check aria-hidden="true" className={o.tick} />
                      )}
                    </label>
                  ))}
                </fieldset>
              </>
            )}
            {step === 1 && (
              <>
                <Input
                  label={t("ob.city")}
                  value={values.city}
                  onChange={(e) => set("city", e.target.value)}
                  error={error === "ob.cityError" ? t(error) : undefined}
                />
                <div className={o.row}>
                  <Input
                    label={t("Monthly budget, from")}
                    hint={t("ob.budgetHint")}
                    type="number"
                    prefix="€"
                    value={values.budgetMin}
                    onChange={(e) => set("budgetMin", Number(e.target.value))}
                  />
                  <Input
                    label={t("Up to")}
                    type="number"
                    prefix="€"
                    value={values.budgetMax}
                    onChange={(e) => set("budgetMax", Number(e.target.value))}
                    error={error === "ob.budgetError" ? t(error) : undefined}
                  />
                </div>
                <div className={o.row}>
                  <Input
                    label={t("ob.moveDate")}
                    type="date"
                    value={values.moveDate}
                    onChange={(e) => set("moveDate", e.target.value)}
                    error={error === "ob.dateError" ? t(error) : undefined}
                  />
                  <Input
                    label={t("ob.stay")}
                    type="number"
                    min={1}
                    max={24}
                    value={values.stayMonths}
                    onChange={(e) => set("stayMonths", Number(e.target.value))}
                    hint={t("ob.months", { count: values.stayMonths })}
                    error={error === "ob.stayError" ? t(error) : undefined}
                  />
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <Slider
                  label={t("ob.clean")}
                  hint={t("ob.cleanHint")}
                  value={values.cleanliness}
                  onChange={(v) => set("cleanliness", v)}
                  ends={[t("ob.relaxed"), t("ob.spotless")]}
                  valueText={`${values.cleanliness}/5${clean[values.cleanliness] ? ` · ${clean[values.cleanliness]}` : ""}`}
                />
                <Slider
                  label={t("ob.social")}
                  hint={t("ob.socialHint")}
                  value={values.social}
                  onChange={(v) => set("social", v)}
                  ends={[t("ob.quiet"), t("ob.together")]}
                  valueText={`${values.social}/5`}
                />
                <fieldset className={o.choices}>
                  <legend>{t("ob.sleep")}</legend>
                  <div className={o.pills}>
                    {rhythms.map(({ value, label }) => (
                      <label
                        key={value}
                        className={o.pill}
                        data-checked={values.sleep === value}
                      >
                        <input
                          type="radio"
                          name="sleep"
                          value={value}
                          checked={values.sleep === value}
                          onChange={() => set("sleep", value)}
                        />
                        {t(label)}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </>
            )}
            {step === 3 && (
              <>
                <div className={o.switches}>
                  <Switch
                    label={t("ob.smokeFree")}
                    description={t("ob.smokeHint")}
                    checked={values.smokeFree}
                    onChange={(v) => set("smokeFree", v)}
                  />
                  <Switch
                    label={t("ob.pets")}
                    description={t("ob.petsHint")}
                    checked={values.petsOkay}
                    onChange={(v) => set("petsOkay", v)}
                  />
                </div>
                <div className={o.summary}>
                  <Heading level={3}>{t("ob.ready")}</Heading>
                  <Text tone="muted">{t("ob.readyHint")}</Text>
                  <FactGrid
                    facts={[
                      {
                        label: t("ob.budget"),
                        value: `€${values.budgetMin}–${values.budgetMax}`,
                      },
                      { label: t("ob.moveDate"), value: values.moveDate },
                      {
                        label: t("ob.stay"),
                        value: t("ob.months", { count: values.stayMonths }),
                      },
                      { label: t("ob.city"), value: values.city },
                    ]}
                  />
                  <Text size="sm" tone="muted">
                    {t("ob.editHint")}
                  </Text>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className={o.footer}>
          {step > 0 ? (
            <Button
              type="button"
              variant="ghost"
              leadingIcon={<ArrowLeft />}
              onClick={back}
            >
              {t("ob.back")}
            </Button>
          ) : (
            <span />
          )}
          <Button
            type="submit"
            trailingIcon={step === 3 ? <Check /> : <ArrowRight />}
          >
            {t(step === 3 ? "ob.finish" : "ob.continue")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
