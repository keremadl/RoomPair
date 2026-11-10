"use client";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Home, Key } from "@/design-system/icons";
import {
  Button,
  ChoiceCards,
  Dialog,
  Eyebrow,
  FactGrid,
  Heading,
  Input,
  PageTransition,
  Slider,
  Switch,
  Text,
} from "@/design-system";
import { useI18n } from "@/lib/i18n";
import type {
  Frequency,
  NoiseTolerance,
  Preferences,
  Sharing,
  SleepSchedule,
} from "@/lib/types";
import o from "./Onboarding.module.css";

const steps = [
  "ob.stepOne",
  "ob.stepTwo",
  "ob.stepThree",
  "Everyday at home",
  "ob.stepFour",
];
const subs = [
  "ob.subOne",
  "ob.subTwo",
  "ob.subThree",
  "So you both know what a normal week looks like.",
  "ob.subFour",
];
const LAST = steps.length - 1;

/** One question with a few answers, shown as pills. */
function Pills<T extends string>({
  name,
  legend,
  value,
  options,
  onChange,
}: {
  name: string;
  legend: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className={o.choices}>
      <legend>{legend}</legend>
      <div className={o.pills}>
        {options.map((opt) => (
          <label
            key={opt.value}
            className={o.pill}
            data-checked={value === opt.value}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Five short steps that set the preferences matching uses. */
export function Onboarding({
  initial,
  onComplete,
  onClose,
  startStep = 0,
}: {
  initial: Preferences;
  /** Open at a later step, e.g. from a profile row. */
  startStep?: number;
  onComplete: (p: Preferences) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [values, setValues] = useState<Preferences>({ ...initial });
  const [step, setStep] = useState(startStep);
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
    if (step === LAST)
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
    value: "find-room" | "have-room";
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
        <Eyebrow>
          {t("ob.progress", { current: step + 1, total: steps.length })}
        </Eyebrow>
        <div
          className={o.progress}
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={steps.length}
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
        <PageTransition
          transitionKey={String(step)}
          motion={direction > 0 ? "push" : "pop"}
          className={o.step}
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
              <ChoiceCards
                label={t("onboarding.intent")}
                value={
                  values.intent === "have-room" ? "have-room" : "find-room"
                }
                onChange={(v) => set("intent", v)}
                options={intents.map(({ value, title, hint, icon: Icon }) => ({
                  value,
                  title: t(title),
                  hint: t(hint),
                  icon: <Icon />,
                }))}
              />
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
              <Pills<SleepSchedule>
                name="sleep"
                legend={t("ob.sleep")}
                value={values.sleep}
                onChange={(v) => set("sleep", v)}
                options={rhythms.map((r) => ({
                  value: r.value,
                  label: t(r.label),
                }))}
              />
            </>
          )}
          {step === 3 && (
            <>
              <Pills<Frequency>
                name="guests"
                legend={t("How often do you have guests over?")}
                value={values.guests}
                onChange={(v) => set("guests", v)}
                options={[
                  { value: "rarely", label: t("Rarely") },
                  { value: "sometimes", label: t("Sometimes") },
                  { value: "often", label: t("Often") },
                ]}
              />
              <Pills<Frequency>
                name="homeDays"
                legend={t("Are you home in the day?")}
                value={values.homeDays}
                onChange={(v) => set("homeDays", v)}
                options={[
                  { value: "rarely", label: t("Out most days") },
                  { value: "sometimes", label: t("Some days") },
                  { value: "often", label: t("Most days") },
                ]}
              />
              <Pills<NoiseTolerance>
                name="noise"
                legend={t("How much noise is fine?")}
                value={values.noise}
                onChange={(v) => set("noise", v)}
                options={[
                  { value: "low", label: t("I need it quiet") },
                  { value: "medium", label: t("Some is fine") },
                  { value: "high", label: t("It doesn't bother me") },
                ]}
              />
              <Pills<Sharing>
                name="sharing"
                legend={t("What do you like to share?")}
                value={values.sharing}
                onChange={(v) => set("sharing", v)}
                options={[
                  { value: "separate", label: t("Keep things separate") },
                  { value: "some", label: t("The basics") },
                  { value: "most", label: t("Most things") },
                ]}
              />
            </>
          )}
          {step === LAST && (
            <>
              <Pills<Preferences["livingWith"]>
                name="livingWith"
                legend={t("Who would you like to live with?")}
                value={values.livingWith}
                onChange={(v) => set("livingWith", v)}
                options={[
                  { value: "anyone", label: t("Anyone") },
                  { value: "women", label: t("Women only") },
                  { value: "men", label: t("Men only") },
                ]}
              />
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
        </PageTransition>

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
            trailingIcon={step === LAST ? <Check /> : <ArrowRight />}
          >
            {t(step === LAST ? "ob.finish" : "ob.continue")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
