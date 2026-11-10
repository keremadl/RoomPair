"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCheck,
  Coffee,
  Home,
  KeyRound,
  MapPin,
  Moon,
  Sparkles,
  Sun,
  Users,
  X,
} from "lucide-react";
import type { Preferences } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { Brand } from "./ui";
import "./onboarding.css";

interface OnboardingProps {
  initial: Preferences;
  onComplete: (preferences: Preferences) => void;
  onClose: () => void;
}

function RoomIllustration() {
  return (
    <svg
      className="ob-room-art"
      viewBox="0 0 320 320"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M34 277H287M52 278V58C52 43 64 31 79 31H228C243 31 255 43 255 58V278"
        stroke="#D0D8C9"
        strokeWidth="1.4"
      />
      <path
        d="M94 53H215V172H94V53Z"
        fill="#F8F2DE"
        stroke="#819B8C"
        strokeWidth="2"
      />
      <path d="M102 61H207V163H102V61Z" fill="#D8E4DD" />
      <circle cx="177" cy="86" r="17" fill="#E9B690" />
      <path d="M102 142L116 122L132 142V164H102V142Z" fill="#A4BBAE" />
      <path d="M129 129L145 106L161 129V163H129V129Z" fill="#B6C7B9" />
      <path d="M159 144L181 119L207 144V163H159V144Z" fill="#8DAA9B" />
      <path d="M155 54V170M94 113H215" stroke="#F6F0DC" strokeWidth="5" />
      <path
        d="M90 173H219"
        stroke="#7A9484"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M82 43C89 73 85 120 77 165M226 43C220 74 223 125 230 166"
        stroke="#D9CCB4"
        strokeWidth="13"
      />
      <path
        d="M76 43H232"
        stroke="#547463"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M82 203C82 195 88 189 96 189H201C209 189 215 195 215 203V251H82V203Z"
        fill="#D89577"
      />
      <path d="M91 204C91 199 95 195 100 195H144V231H91V204Z" fill="#E5A389" />
      <path
        d="M150 195H194C199 195 203 199 203 204V231H150V195Z"
        fill="#E5A389"
      />
      <path
        d="M72 225C72 219 77 214 83 214C89 214 94 219 94 225V243H202V225C202 219 207 214 213 214C219 214 224 219 224 225V257H72V225Z"
        fill="#C67D60"
      />
      <path
        d="M88 257V269M208 257V269"
        stroke="#365C48"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d="M109 208L132 204L137 227L114 231L109 208Z" fill="#F3E9CC" />
      <path d="M178 207L196 214L189 233L170 226L178 207Z" fill="#446F59" />
      <ellipse cx="161" cy="278" rx="94" ry="11" fill="#D8DDCA" opacity=".7" />
      <ellipse cx="157" cy="262" rx="43" ry="10" fill="#E2C098" />
      <path
        d="M129 266L124 284M185 266L190 284"
        stroke="#54745D"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M146 251H158V260H146V251Z" fill="#F9F4E5" />
      <path d="M158 253H162V257H158" stroke="#F9F4E5" strokeWidth="2" />
      <path
        d="M147 245C144 241 150 239 147 235M153 245C150 241 156 239 153 235"
        stroke="#7D9A86"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M248 232V175" stroke="#4D7058" strokeWidth="2.5" />
      <path
        d="M248 206C225 205 222 186 228 183C239 181 247 190 248 206Z"
        fill="#66896B"
      />
      <path
        d="M248 191C265 192 274 174 269 170C259 167 248 178 248 191Z"
        fill="#456D51"
      />
      <path
        d="M248 177C236 174 233 159 239 157C249 156 252 166 248 177Z"
        fill="#829D77"
      />
      <path d="M232 228H264L259 262H237L232 228Z" fill="#DFB591" />
      <path
        d="M231 228H265"
        stroke="#C39472"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M51 207V266M43 219H61"
        stroke="#4D7058"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M35 207L41 186H61L67 207H35Z" fill="#E8D7A9" />
      <path
        d="M42 266H62"
        stroke="#4D7058"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M270 68L275 76L284 73M35 107L40 99L47 102"
        stroke="#87A18D"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Onboarding({ initial, onComplete, onClose }: OnboardingProps) {
  const { t, locale } = useI18n();
  const [values, setValues] = useState<Preferences>({ ...initial });
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [error, setError] = useState("");
  const shellRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const closeRef = useRef(onClose);
  const reducedMotion = useReducedMotion();
  const id = useId();
  const headings = ["ob.stepOne", "ob.stepTwo", "ob.stepThree", "ob.stepFour"];
  const descriptions = ["ob.subOne", "ob.subTwo", "ob.subThree", "ob.subFour"];
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    headingRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
      }
      if (event.key !== "Tab" || !shellRef.current) return;
      const nodes = Array.from(
        shellRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
        ),
      ).filter((node) => node.getClientRects().length > 0);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !nodes.includes(document.activeElement as HTMLElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !shellRef.current.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      previouslyFocused?.focus();
    };
  }, []);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  function update<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    if (error) setError("");
  }

  // Today's date in the user's time zone, as YYYY-MM-DD.
  const now = new Date();
  const today = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
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
        date.toISOString().slice(0, 10) !== values.moveDate ||
        values.moveDate < today
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
    if (invalid) {
      setError(invalid);
      return;
    }
    if (step === 3) {
      onComplete({
        ...values,
        name: values.name.trim(),
        city: values.city.trim(),
      });
      return;
    }
    setDirection(1);
    setStep((current) => current + 1);
  }

  function back() {
    setDirection(-1);
    setError("");
    setStep((current) => Math.max(0, current - 1));
  }

  const intents = [
    {
      value: "find-room" as const,
      label: "ob.findRoom",
      hint: "ob.findRoomHint",
      Icon: KeyRound,
    },
    {
      value: "have-room" as const,
      label: "ob.haveRoom",
      hint: "ob.haveRoomHint",
      Icon: Home,
    },
    {
      value: "either" as const,
      label: "ob.either",
      hint: "ob.eitherHint",
      Icon: Users,
    },
  ];
  const rhythms = [
    { value: "early" as const, label: "ob.early", Icon: Sun },
    { value: "flexible" as const, label: "ob.flexible", Icon: Coffee },
    { value: "late" as const, label: "ob.late", Icon: Moon },
  ];
  const moveDate = new Date(`${values.moveDate}T12:00:00Z`);
  const dateLabel = Number.isNaN(moveDate.getTime())
    ? values.moveDate
    : moveDate.toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

  return (
    <motion.div
      className="ob-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.2 }}
    >
      <motion.div
        ref={shellRef}
        className="ob-shell"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-heading`}
        aria-describedby={`${id}-description`}
        initial={{ y: reducedMotion ? 0 : 22, scale: reducedMotion ? 1 : 0.98 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 29, stiffness: 310 }}
      >
        <aside className="ob-aside">
          <div className="ob-brand">
            <Brand small />
          </div>
          <div className="ob-aside-copy">
            <span className="ob-eyebrow">{t("ob.eyebrow")}</span>
            <h2>{t("ob.headline")}</h2>
            <p>{t("ob.intro")}</p>
          </div>
          <RoomIllustration />
          <div className="ob-aside-foot">
            <span />
            <span />
            <span />
            <p>{t("ob.editHint")}</p>
          </div>
        </aside>
        <form
          className="ob-content"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            next();
          }}
        >
          <div className="ob-topline">
            <span className="ob-step-counter">
              {t("ob.progress", { current: step + 1, total: 4 })}
            </span>
            <button
              className="ob-close"
              type="button"
              onClick={onClose}
              aria-label={t("ob.close")}
            >
              <X size={20} />
            </button>
          </div>
          <div className="ob-progress" aria-hidden="true">
            {headings.map((heading, index) => (
              <span
                key={heading}
                className={index <= step ? "ob-progress-filled" : ""}
              />
            ))}
          </div>
          <header className="ob-header">
            <h1 id={`${id}-heading`} tabIndex={-1} ref={headingRef}>
              {t(headings[step])}
            </h1>
            <p id={`${id}-description`}>{t(descriptions[step])}</p>
          </header>
          <div className="ob-step-body">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={step}
                className="ob-step-inner"
                custom={direction}
                initial={{ opacity: 0, x: reducedMotion ? 0 : direction * 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reducedMotion ? 0 : direction * -12 }}
                transition={{ duration: reducedMotion ? 0 : 0.16 }}
              >
                {step === 0 && (
                  <>
                    <label className="ob-field-label" htmlFor={`${id}-name`}>
                      {t("ob.yourName")}
                    </label>
                    <input
                      id={`${id}-name`}
                      className="ob-input ob-name-input"
                      value={values.name}
                      onChange={(event) => update("name", event.target.value)}
                      placeholder={t("ob.namePlaceholder")}
                      maxLength={48}
                      autoComplete="given-name"
                      required
                      aria-invalid={error === "ob.nameError"}
                      aria-describedby={
                        error === "ob.nameError" ? `${id}-error` : undefined
                      }
                    />
                    <fieldset className="ob-intents">
                      <legend className="ob-sr-only">{t("ob.subOne")}</legend>
                      {intents.map(({ value, label, hint, Icon }) => (
                        <label
                          key={value}
                          className={`ob-intent ${values.intent === value ? "ob-intent-selected" : ""}`}
                        >
                          <input
                            type="radio"
                            name={`${id}-intent`}
                            value={value}
                            checked={values.intent === value}
                            onChange={() => update("intent", value)}
                          />
                          <span className="ob-intent-icon">
                            <Icon size={23} strokeWidth={1.6} />
                          </span>
                          <span className="ob-intent-copy">
                            <strong>{t(label)}</strong>
                            <small>{t(hint)}</small>
                          </span>
                          <span className="ob-radio">
                            {values.intent === value && (
                              <Check size={12} strokeWidth={3} />
                            )}
                          </span>
                        </label>
                      ))}
                    </fieldset>
                  </>
                )}
                {step === 1 && (
                  <div className="ob-details-fields">
                    <div>
                      <label className="ob-field-label" htmlFor={`${id}-city`}>
                        {t("ob.city")}
                      </label>
                      <div className="ob-input-wrap">
                        <MapPin size={18} />
                        <input
                          id={`${id}-city`}
                          className="ob-input"
                          value={values.city}
                          onChange={(event) =>
                            update("city", event.target.value)
                          }
                          maxLength={70}
                          autoComplete="address-level2"
                          required
                          aria-invalid={error === "ob.cityError"}
                        />
                      </div>
                    </div>
                    <fieldset className="ob-budget">
                      <legend className="ob-field-label">
                        {t("ob.budget")}
                        <span>{t("ob.budgetHint")}</span>
                      </legend>
                      <div className="ob-budget-row">
                        <label>
                          <span>{t("ob.minimum")}</span>
                          <div className="ob-input-wrap">
                            <b>€</b>
                            <input
                              className="ob-input"
                              aria-label={t("ob.minimum")}
                              type="number"
                              min={100}
                              max={4999}
                              step={10}
                              value={values.budgetMin || ""}
                              onChange={(event) =>
                                update("budgetMin", Number(event.target.value))
                              }
                              required
                              aria-invalid={error === "ob.budgetError"}
                            />
                          </div>
                        </label>
                        <span className="ob-range-dash">—</span>
                        <label>
                          <span>{t("ob.maximum")}</span>
                          <div className="ob-input-wrap">
                            <b>€</b>
                            <input
                              className="ob-input"
                              aria-label={t("ob.maximum")}
                              type="number"
                              min={101}
                              max={5000}
                              step={10}
                              value={values.budgetMax || ""}
                              onChange={(event) =>
                                update("budgetMax", Number(event.target.value))
                              }
                              required
                              aria-invalid={error === "ob.budgetError"}
                            />
                          </div>
                        </label>
                      </div>
                    </fieldset>
                    <div className="ob-date-stay">
                      <div>
                        <label
                          className="ob-field-label"
                          htmlFor={`${id}-date`}
                        >
                          {t("ob.moveDate")}
                        </label>
                        <input
                          id={`${id}-date`}
                          className="ob-input"
                          type="date"
                          value={values.moveDate}
                          onChange={(event) =>
                            update("moveDate", event.target.value)
                          }
                          required
                          aria-invalid={error === "ob.dateError"}
                        />
                      </div>
                      <div>
                        <label
                          className="ob-field-label"
                          htmlFor={`${id}-stay`}
                        >
                          {t("ob.stay")}
                        </label>
                        <select
                          id={`${id}-stay`}
                          className="ob-input"
                          value={values.stayMonths}
                          onChange={(event) =>
                            update("stayMonths", Number(event.target.value))
                          }
                        >
                          {Array.from({ length: 24 }, (_, i) => i + 1).map(
                            (months) => (
                              <option key={months} value={months}>
                                {t("ob.months", { count: months })}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div className="ob-habits">
                    <div className="ob-slider-field">
                      <label className="ob-field-label" htmlFor={`${id}-clean`}>
                        {t("ob.clean")}
                        <span>{t("ob.cleanHint")}</span>
                      </label>
                      <input
                        id={`${id}-clean`}
                        type="range"
                        min={1}
                        max={5}
                        step={1}
                        value={values.cleanliness}
                        style={
                          {
                            "--ob-range": `${(values.cleanliness - 1) * 25}%`,
                          } as CSSProperties
                        }
                        onChange={(event) =>
                          update("cleanliness", Number(event.target.value))
                        }
                      />
                      <div className="ob-range-labels">
                        <span>{t("ob.relaxed")}</span>
                        <span>{t("ob.spotless")}</span>
                      </div>
                    </div>
                    <div className="ob-slider-field">
                      <label
                        className="ob-field-label"
                        htmlFor={`${id}-social`}
                      >
                        {t("ob.social")}
                        <span>{t("ob.socialHint")}</span>
                      </label>
                      <input
                        id={`${id}-social`}
                        type="range"
                        min={1}
                        max={5}
                        step={1}
                        value={values.social}
                        style={
                          {
                            "--ob-range": `${(values.social - 1) * 25}%`,
                          } as CSSProperties
                        }
                        onChange={(event) =>
                          update("social", Number(event.target.value))
                        }
                      />
                      <div className="ob-range-labels">
                        <span>{t("ob.quiet")}</span>
                        <span>{t("ob.together")}</span>
                      </div>
                    </div>
                    <fieldset className="ob-rhythms">
                      <legend className="ob-field-label">
                        {t("ob.sleep")}
                      </legend>
                      <div>
                        {rhythms.map(({ value, label, Icon }) => (
                          <label
                            key={value}
                            className={
                              values.sleep === value ? "ob-rhythm-selected" : ""
                            }
                          >
                            <input
                              type="radio"
                              name={`${id}-sleep`}
                              value={value}
                              checked={values.sleep === value}
                              onChange={() => update("sleep", value)}
                            />
                            <Icon size={16} />
                            <span>{t(label)}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <div className="ob-toggles">
                      <label className="ob-toggle-row">
                        <span>
                          <strong>{t("ob.smokeFree")}</strong>
                          <small>{t("ob.smokeHint")}</small>
                        </span>
                        <input
                          type="checkbox"
                          checked={values.smokeFree}
                          onChange={(event) =>
                            update("smokeFree", event.target.checked)
                          }
                        />
                        <span className="ob-toggle" aria-hidden="true" />
                      </label>
                      <label className="ob-toggle-row">
                        <span>
                          <strong>{t("ob.pets")}</strong>
                          <small>{t("ob.petsHint")}</small>
                        </span>
                        <input
                          type="checkbox"
                          checked={values.petsOkay}
                          onChange={(event) =>
                            update("petsOkay", event.target.checked)
                          }
                        />
                        <span className="ob-toggle" aria-hidden="true" />
                      </label>
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div className="ob-review">
                    <div className="ob-review-hello">
                      <span className="ob-review-avatar">
                        {values.name.trim().slice(0, 1).toLocaleUpperCase()}
                      </span>
                      <div>
                        <strong>{values.name}</strong>
                        <span>
                          {t(
                            intents.find(
                              (intent) => intent.value === values.intent,
                            )?.label ?? "ob.either",
                          )}
                        </span>
                      </div>
                      <span className="ob-review-check">
                        <CheckCheck size={22} />
                      </span>
                    </div>
                    <div className="ob-review-facts">
                      <div>
                        <MapPin size={19} />
                        <span>{values.city}</span>
                        <strong>
                          €{values.budgetMin}–{values.budgetMax}
                          <small>{t("ob.perMonth")}</small>
                        </strong>
                      </div>
                      <div>
                        <CalendarDays size={19} />
                        <span>{dateLabel}</span>
                        <strong>
                          {t("ob.months", { count: values.stayMonths })}
                        </strong>
                      </div>
                    </div>
                    <div className="ob-review-rhythm">
                      <span>
                        {t(
                          rhythms.find(
                            (rhythm) => rhythm.value === values.sleep,
                          )?.label ?? "ob.flexible",
                        )}
                      </span>
                      {values.smokeFree && <span>{t("ob.smokeFree")}</span>}
                      {values.petsOkay && <span>{t("ob.pets")}</span>}
                    </div>
                    <div className="ob-review-note">
                      <Sparkles size={21} strokeWidth={1.6} />
                      <div>
                        <h3>{t("ob.ready")}</h3>
                        <p>{t("ob.readyHint")}</p>
                      </div>
                    </div>
                    <p className="ob-review-footnote">{t("ob.editHint")}</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          {error && (
            <p className="ob-error" id={`${id}-error`} role="alert">
              {t(error)}
            </p>
          )}
          <footer className="ob-footer">
            {step > 0 ? (
              <button type="button" className="ob-back" onClick={back}>
                <ArrowLeft size={17} />
                {t("ob.back")}
              </button>
            ) : (
              <span className="ob-footer-mark" aria-hidden="true">
                <Home size={19} />
                <span>01 — 04</span>
              </span>
            )}
            <button className="ob-next" type="submit">
              {t(step === 3 ? "ob.finish" : "ob.continue")}
              <ArrowRight size={18} />
            </button>
          </footer>
        </form>
      </motion.div>
    </motion.div>
  );
}
