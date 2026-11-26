"use client";
import { useState } from "react";
import { Trash2 } from "@/design-system/icons";
import {
  Button,
  Chip,
  Dialog,
  Input,
  Select,
  Switch,
  Text,
  Textarea,
} from "@/design-system";
import { useI18n } from "@/lib/i18n";
import { MAX_INTERESTS, interestOptions, promptsFor } from "@/lib/profile";
import d from "../dialogs/dialogs.module.css";
import p from "./profile.module.css";

type Field =
  | {
      key: string;
      label: string;
      type: "text" | "number";
      value: string | number;
      hint?: string;
      prefix?: string;
      /** Number fields: the allowed range, checked before saving. */
      min?: number;
      max?: number;
      /** Text fields: character cap matching database limits. */
      maxLength?: number;
      /** Must not be left empty. */
      required?: boolean;
    }
  | {
      key: string;
      label: string;
      type: "date";
      /** YYYY-MM-DD. */
      value: string;
      hint?: string;
      /** The earliest and latest day allowed, as YYYY-MM-DD. */
      min?: string;
      max?: string;
    }
  | {
      key: string;
      label: string;
      type: "textarea";
      value: string;
      hint?: string;
      maxLength?: number;
    }
  | {
      key: string;
      label: string;
      type: "switch";
      value: boolean;
      hint?: string;
    }
  | {
      key: string;
      label: string;
      type: "select";
      value: string;
      options: { value: string; label: string }[];
      hint?: string;
    };

/** A small form for one or a few fields. */
export function FieldsDialog({
  title,
  fields,
  onSave,
  onClose,
}: {
  title: string;
  fields: Field[];
  onSave: (values: Record<string, string | number | boolean>) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [values, setValues] = useState(
    Object.fromEntries(fields.map((f) => [f.key, f.value])),
  );
  const [submitted, setSubmitted] = useState(false);
  const set = (k: string, v: string | number | boolean) =>
    setValues((s) => ({ ...s, [k]: v }));
  // Inline errors (no browser pop-ups): empty required fields and numbers
  // outside their range. Shown once you try to save.
  const errorOf = (f: Field): string => {
    if (f.type === "date") {
      const day = String(values[f.key] ?? "");
      return !/^\d{4}-\d{2}-\d{2}$/.test(day) ||
        (f.min !== undefined && day < f.min) ||
        (f.max !== undefined && day > f.max)
        ? t("Choose a valid date.")
        : "";
    }
    if (f.type !== "text" && f.type !== "number") return "";
    const raw = String(values[f.key] ?? "").trim();
    if (f.type === "text")
      return f.required && !raw ? t("This can't be empty.") : "";
    if (!raw) return t("Enter a number.");
    const n = Number(raw);
    if (!Number.isFinite(n)) return t("Enter a number.");
    if (f.min !== undefined && f.max !== undefined && (n < f.min || n > f.max))
      return t("Choose between {min} and {max}.", { min: f.min, max: f.max });
    if (f.min !== undefined && n < f.min)
      return t("Enter {min} or more.", { min: f.min });
    return "";
  };
  const invalid = fields.some((f) => errorOf(f));
  return (
    <Dialog title={title} onClose={onClose}>
      <form
        noValidate
        className={p.form}
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
          if (!invalid) onSave(values);
        }}
      >
        {fields.map((f) =>
          f.type === "textarea" ? (
            <Textarea
              key={f.key}
              label={f.label}
              hint={f.hint}
              rows={4}
              maxLength={f.maxLength ?? 500}
              value={String(values[f.key])}
              onChange={(e) => set(f.key, e.target.value)}
            />
          ) : f.type === "select" ? (
            <Select
              key={f.key}
              label={f.label}
              hint={f.hint}
              value={String(values[f.key])}
              onChange={(e) => set(f.key, e.target.value)}
              options={f.options}
            />
          ) : f.type === "switch" ? (
            <Switch
              key={f.key}
              label={f.label}
              description={f.hint}
              checked={Boolean(values[f.key])}
              onChange={(v) => set(f.key, v)}
            />
          ) : (
            <Input
              key={f.key}
              label={f.label}
              hint={f.hint}
              prefix={"prefix" in f ? f.prefix : undefined}
              type={f.type}
              min={"min" in f ? f.min : undefined}
              max={"max" in f ? f.max : undefined}
              maxLength={"maxLength" in f ? f.maxLength : undefined}
              inputMode={f.type === "number" ? "numeric" : undefined}
              error={submitted ? errorOf(f) || undefined : undefined}
              value={String(values[f.key])}
              // Kept as typed (an emptied field stays empty instead of
              // jumping to 0); each onSave turns it into a number.
              onChange={(e) => set(f.key, e.target.value)}
            />
          ),
        )}
        <div className={d.footer}>
          <Button type="submit" fullWidth>
            {t("Save")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

/** Pick a question and answer it. */
export function PromptDialog({
  initial,
  used,
  host = false,
  onSave,
  onDelete,
  onClose,
}: {
  initial?: { question: string; answer: string };
  used: string[];
  /** People with a room also get questions about the place. */
  host?: boolean;
  onSave: (prompt: { question: string; answer: string }) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const choices = promptsFor(host).filter(
    (q) => q === initial?.question || !used.includes(q),
  );
  const [question, setQuestion] = useState(initial?.question ?? choices[0]);
  const [answer, setAnswer] = useState(initial?.answer ?? "");
  return (
    <Dialog
      title={initial ? t("Edit prompt") : t("Add a prompt")}
      onClose={onClose}
    >
      <form
        className={p.form}
        onSubmit={(e) => {
          e.preventDefault();
          if (answer.trim()) onSave({ question, answer: answer.trim() });
        }}
      >
        <Select
          label={t("Question")}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          options={choices.map((q) => ({ value: q, label: t(q) }))}
        />
        <Textarea
          label={t("Your answer")}
          hint={`${answer.length}/150`}
          rows={3}
          maxLength={150}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <div className={d.footer}>
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              leadingIcon={<Trash2 />}
              onClick={onDelete}
            >
              {t("Remove")}
            </Button>
          )}
          <Button type="submit" disabled={!answer.trim()} fullWidth>
            {t("Save")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

/** Choose up to `max` chips; interests by default. */
export function InterestsDialog({
  initial,
  onSave,
  onClose,
  title,
  options = interestOptions,
  max = MAX_INTERESTS,
}: {
  initial: string[];
  onSave: (picked: string[]) => void;
  onClose: () => void;
  title?: string;
  options?: string[];
  max?: number;
}) {
  const { t } = useI18n();
  const [picked, setPicked] = useState(initial);
  const toggle = (i: string) =>
    setPicked((s) =>
      s.includes(i) ? s.filter((x) => x !== i) : s.length < max ? [...s, i] : s,
    );
  return (
    <Dialog title={title ?? t("Interests")} onClose={onClose}>
      <Text size="sm" tone="muted">
        {t("Pick up to {max}.", { max })} {picked.length}/{max}
      </Text>
      <div className={p.chips}>
        {options.map((i) => (
          <Chip key={i} selected={picked.includes(i)} onClick={() => toggle(i)}>
            {t(i)}
          </Chip>
        ))}
      </div>
      <div className={d.footer}>
        <Button onClick={() => onSave(picked)} fullWidth>
          {t("Save")}
        </Button>
      </div>
    </Dialog>
  );
}
