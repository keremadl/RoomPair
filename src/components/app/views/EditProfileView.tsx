"use client";
import { useState, type ReactNode } from "react";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Cigarette,
  Clock,
  MessageSquareQuote,
  Moon,
  PawPrint,
  Plus,
  Receipt,
  ShieldCheck,
  Sparkles,
  Tag,
  Text as TextIcon,
  Users,
  Wallet,
  X,
} from "lucide-react";
import {
  Button,
  ChoiceCards,
  Dialog,
  ListRow,
  VisuallyHidden,
} from "@/design-system";
import { defaultLanguage, discoverParts } from "@/design-system/languages";
import { dateLabel, sleepLabel } from "@/lib/discover/deck";
import { useI18n } from "@/lib/i18n";
import {
  MAX_PHOTOS,
  MAX_PROMPTS,
  asProfile,
  completion,
  profileSteps,
} from "@/lib/profile";
import type { MyProfile, Preferences } from "@/lib/types";
import { Pips } from "../PersonCard";
import { PhotoGrid } from "../profile/PhotoGrid";
import {
  FieldsDialog,
  InterestsDialog,
  PromptDialog,
} from "../profile/ProfileDialogs";
import p from "../profile/profile.module.css";

type Editing =
  | null
  | "basics"
  | "intent"
  | "room"
  | "roomText"
  | "bio"
  | "interests"
  | "preview"
  | { prompt: number };

/** A white section card. With `onClick` the whole card opens an editor. */
function Section({
  title,
  hint,
  value,
  onClick,
  children,
  id,
}: {
  title: string;
  hint?: string;
  value?: ReactNode;
  onClick?: () => void;
  children?: ReactNode;
  id?: string;
}) {
  const head = (
    <>
      <span className={p.sectionText}>
        <h2 className={p.sectionTitle} id={id}>
          {title}
        </h2>
        {hint && <span className={p.sectionHint}>{hint}</span>}
        {value !== undefined && <span className={p.sectionValue}>{value}</span>}
      </span>
      {onClick && <ChevronRight className={p.chevron} aria-hidden="true" />}
    </>
  );
  return (
    <section className={p.card} aria-labelledby={id}>
      {onClick ? (
        <button type="button" className={p.cardButton} onClick={onClick}>
          {head}
        </button>
      ) : (
        <div className={p.cardHead}>{head}</div>
      )}
      {children}
    </section>
  );
}

/**
 * Edit profile, opened from the profile page: a progress bar and Preview stay at
 * the top, then photos, who you are, why you are here, and one card per
 * topic. Empty topics say what they are for and offer one clear button.
 */
export function EditProfileView({
  preferences: prefs,
  me,
  onMe,
  onEditBasics,
  onIntent,
  onError,
  onName,
  onBack,
}: {
  preferences: Preferences;
  me: MyProfile;
  onMe: (next: Partial<MyProfile>) => void;
  /** Opens the setup steps (0 = name, 1 = budget and dates, 2 = habits, 3 = must-haves). */
  onEditBasics: (step: number) => void;
  onIntent: (intent: "find-room" | "have-room") => void;
  onError: (message: string) => void;
  onName: (name: string) => void;
  /** Back to the profile page. */
  onBack: () => void;
}) {
  const { t } = useI18n();
  const [editing, setEditing] = useState<Editing>(null);
  const [tipClosed, setTipClosed] = useState(false);
  const host = prefs.intent === "have-room";
  const steps = profileSteps(me, prefs);
  const percent = completion(steps);
  const next = steps.find((s) => !s.done);
  const { Card } = discoverParts[defaultLanguage];
  const close = () => setEditing(null);

  return (
    <>
      <VisuallyHidden as="h1">{t("Edit profile")}</VisuallyHidden>
      <div className={p.page}>
        <div className={p.progressBar}>
          <button
            type="button"
            className={p.back}
            aria-label={t("Back to profile")}
            onClick={onBack}
          >
            <ChevronLeft />
          </button>
          <div
            className={p.progress}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-label={t("Profile complete")}
          >
            <span className={p.progressText}>
              {percent}% {t("complete")}
            </span>
            <span className={p.progressTrack}>
              <span style={{ width: `${percent}%` }} />
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditing("preview")}
          >
            {t("Preview")}
          </Button>
        </div>

        {next && !tipClosed && (
          <div className={p.tip}>
            <p className={p.tipTitle}>{t("Next step")}</p>
            <p className={p.tipText}>{t(next.label)}</p>
            <button
              type="button"
              className={p.tipClose}
              aria-label={t("Hide tip")}
              onClick={() => setTipClosed(true)}
            >
              <X />
            </button>
          </div>
        )}

        <PhotoGrid
          photos={me.photos}
          max={MAX_PHOTOS}
          label={t("My photos")}
          addLabel={t("Add photos")}
          onChange={(photos) => onMe({ photos })}
          onError={onError}
        />

        <div className={p.cards}>
          <Section
            id="me-name"
            title={`${prefs.name}, ${me.age}`}
            value={[me.occupation, prefs.city].filter(Boolean).join(", ")}
            onClick={() => setEditing("basics")}
          />

          <Section
            id="me-intent"
            title={t("Why you're here")}
            value={
              host
                ? t("I have a room, I need a flatmate")
                : t("I’m looking for a room")
            }
            onClick={() => setEditing("intent")}
          />

          <Section
            id="me-bio"
            title={t("About me")}
            value={me.bio || undefined}
            hint={
              me.bio
                ? undefined
                : t("A few lines about you and how you like to live.")
            }
            onClick={() => setEditing("bio")}
          />

          {host && (
            <Section
              id="me-room"
              title={t("My room")}
              hint={t("Room seekers see the main room photo first.")}
            >
              <PhotoGrid
                photos={me.room.photos}
                max={MAX_PHOTOS}
                label={t("Room photos")}
                addLabel={t("Add room photos")}
                onChange={(photos) => onMe({ room: { ...me.room, photos } })}
                onError={onError}
              />
              <ul className={p.rows}>
                <ListRow
                  icon={<TextIcon />}
                  label={t("Title")}
                  value={me.room.title}
                  onClick={() => setEditing("room")}
                />
                <ListRow
                  icon={<Wallet />}
                  label={t("Rent")}
                  value={`€${me.room.price} / ${t("month")}`}
                  onClick={() => setEditing("room")}
                />
                <ListRow
                  icon={<Receipt />}
                  label={t("Bills")}
                  value={
                    me.room.billsIncluded ? t("Included") : t("Not included")
                  }
                  onClick={() => setEditing("room")}
                />
                <ListRow
                  icon={<CalendarDays />}
                  label={t("Available from")}
                  value={dateLabel(prefs.moveDate)}
                  onClick={() => onEditBasics(1)}
                />
                <ListRow
                  icon={<Clock />}
                  label={t("Minimum stay")}
                  value={`${prefs.stayMonths} ${t("months")}`}
                  onClick={() => onEditBasics(1)}
                />
                <ListRow
                  icon={<MessageSquareQuote />}
                  label={t("About the room")}
                  value={me.room.description || undefined}
                  onClick={() => setEditing("roomText")}
                />
              </ul>
            </Section>
          )}

          <Section id="me-living" title={t("Living together")}>
            <ul className={p.rows}>
              {!host && (
                <>
                  <ListRow
                    icon={<Wallet />}
                    label={t("Monthly budget")}
                    value={`€${prefs.budgetMin}–${prefs.budgetMax}`}
                    onClick={() => onEditBasics(1)}
                  />
                  <ListRow
                    icon={<CalendarDays />}
                    label={t("Move-in")}
                    value={dateLabel(prefs.moveDate)}
                    onClick={() => onEditBasics(1)}
                  />
                  <ListRow
                    icon={<Clock />}
                    label={t("Stay")}
                    value={`${prefs.stayMonths} ${t("months")}`}
                    onClick={() => onEditBasics(1)}
                  />
                </>
              )}
              <ListRow
                icon={<Sparkles />}
                label={t("Tidiness")}
                value={
                  <Pips bare label={t("Tidiness")} value={prefs.cleanliness} />
                }
                onClick={() => onEditBasics(2)}
              />
              <ListRow
                icon={<Users />}
                label={t("Social energy")}
                value={
                  <Pips bare label={t("Social energy")} value={prefs.social} />
                }
                onClick={() => onEditBasics(2)}
              />
              <ListRow
                icon={<Moon />}
                label={t("Sleep")}
                value={t(sleepLabel[prefs.sleep])}
                onClick={() => onEditBasics(2)}
              />
              <ListRow
                icon={<Cigarette />}
                label={t("Smoking at home")}
                value={prefs.smokeFree ? t("No") : t("Fine")}
                onClick={() => onEditBasics(3)}
              />
              <ListRow
                icon={<PawPrint />}
                label={t("Pets")}
                value={prefs.petsOkay ? t("Fine") : t("No")}
                onClick={() => onEditBasics(3)}
              />
            </ul>
          </Section>

          <Section
            id="me-prompts"
            title={t("Profile questions")}
            hint={
              me.prompts.length
                ? undefined
                : t(
                    "Answer a few questions so people know what living with you is like.",
                  )
            }
          >
            {me.prompts.length > 0 && (
              <div className={p.prompts}>
                {me.prompts.map((pr, i) => (
                  <button
                    key={pr.question}
                    type="button"
                    className={p.prompt}
                    onClick={() => setEditing({ prompt: i })}
                  >
                    <span className={p.cardLabel}>{t(pr.question)}</span>
                    <span className={p.answer}>{pr.answer}</span>
                  </button>
                ))}
              </div>
            )}
            {me.prompts.length < MAX_PROMPTS && (
              <Button
                leadingIcon={<Plus />}
                variant={me.prompts.length ? "secondary" : "primary"}
                onClick={() => setEditing({ prompt: me.prompts.length })}
                fullWidth
              >
                {t("Add a question")}
              </Button>
            )}
          </Section>

          <Section
            id="me-interests"
            title={t("Interests")}
            hint={
              me.interests.length
                ? undefined
                : t("Show what you like doing, so shared interests stand out.")
            }
          >
            {me.interests.length > 0 && (
              <ul className={p.tags}>
                {me.interests.map((i) => (
                  <li key={i}>{t(i)}</li>
                ))}
              </ul>
            )}
            <Button
              leadingIcon={<Tag />}
              variant={me.interests.length ? "secondary" : "primary"}
              onClick={() => setEditing("interests")}
              fullWidth
            >
              {me.interests.length ? t("Edit interests") : t("Add interests")}
            </Button>
          </Section>

          <Section
            id="me-verify"
            title={t("Get verified")}
            hint={
              me.verified
                ? undefined
                : t("A checked student email shows people you are who you say.")
            }
          >
            {me.verified ? (
              <p className={p.verified}>
                <BadgeCheck aria-hidden="true" />{" "}
                {t("Student email verified (demo)")}
              </p>
            ) : (
              <Button
                leadingIcon={<ShieldCheck />}
                onClick={() => onMe({ verified: true })}
                fullWidth
              >
                {t("Verify student email")}
              </Button>
            )}
          </Section>
        </div>
      </div>

      {editing === "preview" && (
        <Dialog title={t("Your card")} onClose={close}>
          <p className={p.lead}>
            {host
              ? t("Room seekers see this card.")
              : t("People with a room see this card.")}
          </p>
          <div className={p.preview}>
            <Card
              preview
              roomFirst={host}
              deck={{
                profile: asProfile(me, prefs),
                match: {
                  score: 0,
                  eligible: true,
                  reasons: [],
                  considerations: [],
                  breakdown: [],
                  dealbreakers: [],
                },
                cardKey: "me",
                exitDirection: 0,
                canUndo: false,
                decide: () => {},
                undo: () => {},
                index: 0,
                total: 1,
              }}
            />
          </div>
        </Dialog>
      )}
      {editing === "intent" && (
        <Dialog title={t("Why you're here")} onClose={close}>
          <ChoiceCards
            label={t("What are you looking for?")}
            value={host ? "have-room" : "find-room"}
            onChange={(v) => {
              onIntent(v);
              close();
            }}
            options={[
              {
                value: "find-room",
                title: t("I’m looking for a room"),
                hint: t("Discover shows people who have a room, room first."),
                icon: <Building2 />,
              },
              {
                value: "have-room",
                title: t("I have a room, I need a flatmate"),
                hint: t("Discover shows only people looking for a room."),
                icon: <Users />,
              },
            ]}
          />
        </Dialog>
      )}
      {editing === "basics" && (
        <FieldsDialog
          title={t("Name and work")}
          fields={[
            { key: "name", label: t("Name"), type: "text", value: prefs.name },
            { key: "age", label: t("Age"), type: "number", value: me.age },
            {
              key: "occupation",
              label: t("Work or studies"),
              type: "text",
              value: me.occupation,
              hint: t("For example: Design student at RTU"),
            },
          ]}
          onSave={(v) => {
            onMe({
              age: Math.min(99, Math.max(17, Number(v.age) || me.age)),
              occupation: String(v.occupation).trim(),
            });
            const name = String(v.name).trim();
            if (name && name !== prefs.name) onName(name);
            close();
          }}
          onClose={close}
        />
      )}
      {editing === "room" && (
        <FieldsDialog
          title={t("My room")}
          fields={[
            {
              key: "title",
              label: t("Title"),
              type: "text",
              value: me.room.title,
              hint: t("For example: Bright room near the park"),
            },
            {
              key: "price",
              label: t("Rent per month"),
              type: "number",
              value: me.room.price,
              prefix: "€",
            },
            {
              key: "billsIncluded",
              label: t("Bills included"),
              type: "switch",
              value: me.room.billsIncluded,
            },
          ]}
          onSave={(v) => {
            onMe({
              room: {
                ...me.room,
                title: String(v.title).trim(),
                price: Math.max(0, Number(v.price) || 0),
                billsIncluded: Boolean(v.billsIncluded),
              },
            });
            close();
          }}
          onClose={close}
        />
      )}
      {(editing === "roomText" || editing === "bio") && (
        <FieldsDialog
          title={editing === "bio" ? t("About me") : t("About the room")}
          fields={[
            {
              key: "text",
              label: editing === "bio" ? t("About me") : t("About the room"),
              type: "textarea",
              value: editing === "bio" ? me.bio : me.room.description,
              hint:
                editing === "bio"
                  ? undefined
                  : t("Size, light, what is shared, who lives there…"),
            },
          ]}
          onSave={(v) => {
            const text = String(v.text).trim();
            onMe(
              editing === "bio"
                ? { bio: text }
                : { room: { ...me.room, description: text } },
            );
            close();
          }}
          onClose={close}
        />
      )}
      {editing === "interests" && (
        <InterestsDialog
          initial={me.interests}
          onSave={(interests) => {
            onMe({ interests });
            close();
          }}
          onClose={close}
        />
      )}
      {editing !== null && typeof editing === "object" && (
        <PromptDialog
          initial={me.prompts[editing.prompt]}
          used={me.prompts.map((x) => x.question)}
          onSave={(pr) => {
            const prompts = [...me.prompts];
            prompts[editing.prompt] = pr;
            onMe({ prompts });
            close();
          }}
          onDelete={
            me.prompts[editing.prompt]
              ? () => {
                  onMe({
                    prompts: me.prompts.filter((_, i) => i !== editing.prompt),
                  });
                  close();
                }
              : undefined
          }
          onClose={close}
        />
      )}
    </>
  );
}
