"use client";
import { useState, type ReactNode } from "react";
import {
  ChevronRight,
  BadgeCheck,
  Bath,
  Building2,
  Bus,
  DoorOpen,
  Handshake,
  Languages,
  PartyPopper,
  PiggyBank,
  ScrollText,
  Sofa,
  Sun,
  UserRound,
  Volume2,
  CalendarDays,
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
} from "@/design-system/icons";
import { Button, ChoiceCards, Dialog, ListRow } from "@/design-system";

import { dateLabel, sleepLabel } from "@/lib/discover/deck";
import { useI18n } from "@/lib/i18n";
import { MAX_PHOTOS, MAX_PROMPTS, languageOptions } from "@/lib/profile";
import type { Gender, MyProfile, Preferences, WorkStatus } from "@/lib/types";
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
  | "languages"
  | "rules"
  | { prompt: number };

/** Short answers, as asked in setup; the row label already names the topic. */
const answer = {
  guests: { rarely: "Rarely", sometimes: "Sometimes", often: "Often" },
  homeDays: {
    rarely: "Out most days",
    sometimes: "Some days",
    often: "Most days",
  },
  noise: {
    low: "I need it quiet",
    medium: "Some is fine",
    high: "It doesn't bother me",
  },
  sharing: {
    separate: "Keep things separate",
    some: "The basics",
    most: "Most things",
  },
} as const;

const livingWithLabel: Record<Preferences["livingWith"], string> = {
  anyone: "Anyone",
  women: "Women only",
  men: "Men only",
};

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
 * Edit profile, opened from the profile page: photos, who you are, why you are here, and one card per
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
}: {
  preferences: Preferences;
  me: MyProfile;
  onMe: (next: Partial<MyProfile>) => void;
  /** Opens the setup steps (0 = name, 1 = budget and dates, 2 = habits, 3 = everyday at home, 4 = must-haves). */
  onEditBasics: (step: number) => void;
  onIntent: (intent: "find-room" | "have-room") => void;
  onError: (message: string) => void;
  onName: (name: string) => void;
}) {
  const { t } = useI18n();
  const [editing, setEditing] = useState<Editing>(null);
  const host = prefs.intent === "have-room";
  const close = () => setEditing(null);

  return (
    <>
      <div className={p.page}>
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
            value={[me.occupation, me.school, prefs.city]
              .filter(Boolean)
              .join(", ")}
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

          <Section
            id="me-languages"
            title={t("Languages")}
            value={
              me.languages.length
                ? me.languages.map((l) => t(l)).join(", ")
                : undefined
            }
            hint={
              me.languages.length
                ? undefined
                : t("Which languages can you talk in at home?")
            }
            onClick={() => setEditing("languages")}
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
                  icon={<PiggyBank />}
                  label={t("Deposit")}
                  value={`€${me.room.deposit}`}
                  onClick={() => setEditing("room")}
                />
                <ListRow
                  icon={<Bath />}
                  label={t("Bathroom")}
                  value={me.room.privateBathroom ? t("Your own") : t("Shared")}
                  onClick={() => setEditing("room")}
                />
                <ListRow
                  icon={<Sofa />}
                  label={t("Furniture")}
                  value={me.room.furnished ? t("Furnished") : t("Unfurnished")}
                  onClick={() => setEditing("room")}
                />
                <ListRow
                  icon={<DoorOpen />}
                  label={t("Living there now")}
                  value={
                    me.room.flatmates === 1
                      ? t("1 person")
                      : t("{count} people", { count: me.room.flatmates })
                  }
                  onClick={() => setEditing("room")}
                />
                <ListRow
                  icon={<Bus />}
                  label={t("Getting there")}
                  value={me.room.transport || undefined}
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
                <ListRow
                  icon={<ScrollText />}
                  label={t("House rules")}
                  value={me.room.houseRules || undefined}
                  onClick={() => setEditing("rules")}
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
                icon={<PartyPopper />}
                label={t("Guests")}
                value={t(answer.guests[prefs.guests])}
                onClick={() => onEditBasics(3)}
              />
              <ListRow
                icon={<Sun />}
                label={t("In the day")}
                value={t(answer.homeDays[prefs.homeDays])}
                onClick={() => onEditBasics(3)}
              />
              <ListRow
                icon={<Volume2 />}
                label={t("Noise")}
                value={t(answer.noise[prefs.noise])}
                onClick={() => onEditBasics(3)}
              />
              <ListRow
                icon={<Handshake />}
                label={t("Sharing")}
                value={t(answer.sharing[prefs.sharing])}
                onClick={() => onEditBasics(3)}
              />
              <ListRow
                icon={<Cigarette />}
                label={t("Smoking at home")}
                value={prefs.smokeFree ? t("No") : t("Fine")}
                onClick={() => onEditBasics(4)}
              />
              <ListRow
                icon={<PawPrint />}
                label={t("Pets")}
                value={prefs.petsOkay ? t("Fine") : t("No")}
                onClick={() => onEditBasics(4)}
              />
              <ListRow
                icon={<UserRound />}
                label={t("Living with")}
                value={t(livingWithLabel[prefs.livingWith])}
                onClick={() => onEditBasics(4)}
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
            {
              key: "name",
              label: t("Name"),
              type: "text",
              value: prefs.name,
              required: true,
            },
            {
              key: "age",
              label: t("Age"),
              type: "number",
              value: me.age,
              min: 17,
              max: 99,
            },
            {
              key: "status",
              label: t("Right now I'm"),
              type: "select",
              value: me.status,
              options: [
                { value: "student", label: t("Studying") },
                { value: "working", label: t("Working") },
              ],
            },
            {
              key: "occupation",
              label: t("What you study or do"),
              type: "text",
              required: true,
              value: me.occupation,
              hint: t("For example: Design student"),
            },
            {
              key: "school",
              label: t("School or workplace"),
              type: "text",
              value: me.school,
              hint: t("For example: Riga Technical University"),
            },
            {
              key: "gender",
              label: t("Gender (optional)"),
              type: "select",
              value: me.gender ?? "",
              hint: t(
                "Only used when someone wants to live with women or men only.",
              ),
              options: [
                { value: "", label: t("Prefer not to say") },
                { value: "woman", label: t("Woman") },
                { value: "man", label: t("Man") },
                { value: "nonbinary", label: t("Non-binary") },
              ],
            },
          ]}
          onSave={(v) => {
            onMe({
              age: Math.min(99, Math.max(17, Number(v.age) || me.age)),
              status: v.status as WorkStatus,
              occupation: String(v.occupation).trim(),
              school: String(v.school).trim(),
              gender: (v.gender as Gender) || undefined,
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
              min: 0,
            },
            {
              key: "deposit",
              label: t("Deposit"),
              type: "number",
              value: me.room.deposit,
              prefix: "€",
              min: 0,
            },
            {
              key: "flatmates",
              label: t("People living there now"),
              type: "number",
              value: me.room.flatmates,
              min: 0,
              max: 10,
              hint: t("Not counting the new flatmate."),
            },
            {
              key: "transport",
              label: t("Getting there"),
              type: "text",
              value: me.room.transport,
              hint: t("For example: Tram 1 · 10 min to RTU"),
            },
            {
              key: "billsIncluded",
              label: t("Bills included"),
              type: "switch",
              value: me.room.billsIncluded,
            },
            {
              key: "privateBathroom",
              label: t("Own bathroom"),
              type: "switch",
              value: me.room.privateBathroom,
            },
            {
              key: "furnished",
              label: t("Furnished"),
              type: "switch",
              value: me.room.furnished,
            },
          ]}
          onSave={(v) => {
            onMe({
              room: {
                ...me.room,
                title: String(v.title).trim(),
                price: Math.max(0, Number(v.price) || 0),
                deposit: Math.max(0, Number(v.deposit) || 0),
                flatmates: Math.min(10, Math.max(0, Number(v.flatmates) || 0)),
                transport: String(v.transport).trim(),
                billsIncluded: Boolean(v.billsIncluded),
                privateBathroom: Boolean(v.privateBathroom),
                furnished: Boolean(v.furnished),
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
      {editing === "rules" && (
        <FieldsDialog
          title={t("House rules")}
          fields={[
            {
              key: "text",
              label: t("House rules"),
              type: "textarea",
              value: me.room.houseRules,
              hint: t("Quiet hours, guests, cleaning, smoking…"),
            },
          ]}
          onSave={(v) => {
            onMe({
              room: { ...me.room, houseRules: String(v.text).trim() },
            });
            close();
          }}
          onClose={close}
        />
      )}
      {editing === "languages" && (
        <InterestsDialog
          title={t("Languages")}
          options={languageOptions}
          max={4}
          initial={me.languages}
          onSave={(languages) => {
            onMe({ languages });
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
          host={host}
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
