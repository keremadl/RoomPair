"use client";
import type { SetupQuestion } from "../Onboarding";
import { useState, type ReactNode } from "react";
import {
  Backpack,
  BadgeCheck,
  Bath,
  Building2,
  Bus,
  CalendarDays,
  Cigarette,
  Clock,
  Handshake,
  Home,
  Key,
  Languages,
  ListChecks,
  MapPin,
  MessageSquareQuote,
  Moon,
  PartyPopper,
  PawPrint,
  PiggyBank,
  Plus,
  Receipt,
  ScrollText,
  ShieldCheck,
  Smile,
  Sofa,
  Sparkles,
  Sun,
  UserRound,
  Users,
  Volume2,
  Wallet,
} from "@/design-system/icons";
import {
  Button,
  ChoiceCards,
  DetailSection,
  Dialog,
  FactChips,
  FactRows,
  PullQuote,
} from "@/design-system";

import { dateLabel } from "@/lib/discover/deck";
import { personSection } from "@/lib/discover/sections";
import { useI18n } from "@/lib/i18n";
import {
  ageFrom,
  asProfile,
  birthDateRange,
  MAX_PHOTOS,
  MAX_PROMPTS,
  languageOptions,
} from "@/lib/profile";
import type { Gender, MyProfile, Preferences, WorkStatus } from "@/lib/types";
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

const livingWithLabel: Record<Preferences["livingWith"], string> = {
  anyone: "Anyone",
  women: "Women only",
  men: "Men only",
};

/** The setup question that changes each habit, and its icon. */
const habitQuestion: Record<string, SetupQuestion> = {
  tidiness: "cleanliness",
  social: "social",
  sleep: "sleep",
  smoking: "smoke",
  pets: "pets",
  guests: "guests",
  homeDays: "homeDays",
  noise: "noise",
  sharing: "sharing",
};
const habitIcon: Record<string, ReactNode> = {
  tidiness: <Sparkles />,
  social: <Users />,
  sleep: <Moon />,
  smoking: <Cigarette />,
  pets: <PawPrint />,
  guests: <PartyPopper />,
  homeDays: <Sun />,
  noise: <Volume2 />,
  sharing: <Handshake />,
};

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
  onEditBasics: (question: SetupQuestion) => void;
  onIntent: (intent: "find-room" | "have-room") => void;
  onError: (message: string) => void;
  onName: (name: string) => void;
}) {
  const { t } = useI18n();
  const [editing, setEditing] = useState<Editing>(null);
  const host = prefs.intent === "have-room";
  const close = () => setEditing(null);
  // The same words others read about you on Discover.
  const self = personSection(asProfile(me, prefs), prefs, t);
  const months =
    prefs.stayMonths === 1
      ? t("1 month")
      : t("{count} months", { count: prefs.stayMonths });
  const place = [me.neighborhood, prefs.city].filter(Boolean).join(", ");
  const editButton = (onClick: () => void, filled: boolean) => (
    <Button variant="ghost" size="sm" onClick={onClick}>
      {filled ? t("Edit") : t("Add")}
    </Button>
  );

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

        <DetailSection icon={<UserRound />} label={t("About you")}>
          <FactRows
            items={[
              {
                icon: <Smile />,
                text: `${prefs.name}, ${me.age}`,
                onClick: () => setEditing("basics"),
              },
              {
                icon: <Backpack />,
                text: me.occupation || t("Add what you study or do"),
                onClick: () => setEditing("basics"),
              },
              ...(me.school
                ? [
                    {
                      icon: <Building2 />,
                      text: me.school,
                      onClick: () => setEditing("basics"),
                    },
                  ]
                : []),
            ]}
          />
        </DetailSection>

        <DetailSection icon={<Key />} label={t("Why you're here")}>
          <FactChips
            items={[
              {
                icon: host ? <Key /> : <Home />,
                label: t("Why you're here"),
                text: host
                  ? t("I have a room, I need a flatmate")
                  : t("I’m looking for a room"),
                onClick: () => setEditing("intent"),
              },
            ]}
          />
        </DetailSection>

        <DetailSection
          icon={<MessageSquareQuote />}
          label={t("About me")}
          action={editButton(() => setEditing("bio"), Boolean(me.bio))}
        >
          {me.bio ? (
            <p>{me.bio}</p>
          ) : (
            <p className={p.empty}>
              {t("A few lines about you and how you like to live.")}
            </p>
          )}
        </DetailSection>

        {host && (
          <section className={p.group} aria-labelledby="me-room">
            <h2 className={p.groupTitle} id="me-room">
              {t("My room")}
            </h2>
            <PhotoGrid
              photos={me.room.photos}
              max={MAX_PHOTOS}
              label={t("Room photos")}
              addLabel={t("Add room photos")}
              onChange={(photos) => onMe({ room: { ...me.room, photos } })}
              onError={onError}
            />
            <DetailSection
              icon={<Home />}
              label={t("The room")}
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`${t("Title")}: ${me.room.title || t("Add")}`}
                  onClick={() => setEditing("room")}
                >
                  {me.room.title ? t("Edit") : t("Add")}
                </Button>
              }
            >
              {me.room.title ? (
                <PullQuote>{me.room.title}</PullQuote>
              ) : (
                <p className={p.empty}>
                  {t("Give the room a title so it can be listed.")}
                </p>
              )}
            </DetailSection>
            <DetailSection icon={<Wallet />} label={t("Rent and dates")}>
              <FactChips
                items={[
                  {
                    icon: <Wallet />,
                    label: t("Rent"),
                    text: t("€{price} a month", { price: me.room.price }),
                    onClick: () => setEditing("room"),
                  },
                  {
                    icon: <Receipt />,
                    label: t("Bills"),
                    text: me.room.billsIncluded
                      ? t("Bills included")
                      : t("Bills extra"),
                    onClick: () => setEditing("room"),
                  },
                  {
                    icon: <PiggyBank />,
                    label: t("Deposit"),
                    text: t("€{amount} deposit", { amount: me.room.deposit }),
                    onClick: () => setEditing("room"),
                  },
                  {
                    icon: <CalendarDays />,
                    label: t("Available from"),
                    text: t("From {date}", { date: dateLabel(prefs.moveDate) }),
                    onClick: () => onEditBasics("moveDate"),
                  },
                  {
                    icon: <Clock />,
                    label: t("Minimum stay"),
                    text: t("{duration} or more", { duration: months }),
                    onClick: () => onEditBasics("stay"),
                  },
                ]}
              />
            </DetailSection>
            <DetailSection icon={<Sofa />} label={t("The home")}>
              <FactChips
                items={[
                  {
                    icon: <Sofa />,
                    label: t("Furniture"),
                    text: me.room.furnished ? t("Furnished") : t("Unfurnished"),
                    onClick: () => setEditing("room"),
                  },
                  {
                    icon: <Bath />,
                    label: t("Bathroom"),
                    text: me.room.privateBathroom
                      ? t("Own bathroom")
                      : t("Shared bathroom"),
                    onClick: () => setEditing("room"),
                  },
                  {
                    icon: <Users />,
                    label: t("Living there now"),
                    text:
                      me.room.flatmates === 0
                        ? t("No flatmates yet")
                        : me.room.flatmates === 1
                          ? t("1 flatmate")
                          : t("{count} flatmates", {
                              count: me.room.flatmates,
                            }),
                    onClick: () => setEditing("room"),
                  },
                  {
                    icon: <MapPin />,
                    label: t("City and area"),
                    text: place,
                    onClick: () => onEditBasics("city"),
                  },
                ]}
              />
            </DetailSection>
            <DetailSection
              icon={<Bus />}
              label={t("Getting there")}
              action={editButton(
                () => setEditing("room"),
                Boolean(me.room.transport),
              )}
            >
              {me.room.transport && <p>{me.room.transport}</p>}
            </DetailSection>
            <DetailSection
              icon={<ScrollText />}
              label={t("About the room")}
              action={editButton(
                () => setEditing("roomText"),
                Boolean(me.room.description),
              )}
            >
              {me.room.description && <p>{me.room.description}</p>}
            </DetailSection>
            <DetailSection
              icon={<ListChecks />}
              label={t("House rules")}
              action={editButton(
                () => setEditing("rules"),
                Boolean(me.room.houseRules),
              )}
            >
              {me.room.houseRules && <p>{me.room.houseRules}</p>}
            </DetailSection>
          </section>
        )}

        {!host && (
          <DetailSection icon={<MapPin />} label={t("Where and when")}>
            <FactChips
              items={[
                {
                  icon: <MapPin />,
                  label: t("City and area"),
                  text: place,
                  onClick: () => onEditBasics("city"),
                },
                {
                  icon: <Wallet />,
                  label: t("Monthly budget"),
                  text: t("€{min}–{max} a month", {
                    min: prefs.budgetMin,
                    max: prefs.budgetMax,
                  }),
                  onClick: () => onEditBasics("budget"),
                },
                {
                  icon: <CalendarDays />,
                  label: t("Move-in"),
                  text: t("From {date}", { date: dateLabel(prefs.moveDate) }),
                  onClick: () => onEditBasics("moveDate"),
                },
                {
                  icon: <Clock />,
                  label: t("Stay"),
                  text: t("For {duration}", { duration: months }),
                  onClick: () => onEditBasics("stay"),
                },
              ]}
            />
          </DetailSection>
        )}

        <DetailSection icon={<Sofa />} label={t("At home, I am")}>
          <FactChips
            items={self.habits.map((h) => ({
              icon: habitIcon[h.id],
              label: h.label,
              // "Sometimes" or "Flexible" alone would not say what about.
              text: ["social", "sleep", "guests"].includes(h.id)
                ? `${h.label}: ${h.them}`
                : h.them,
              onClick: () => onEditBasics(habitQuestion[h.id]),
            }))}
          />
        </DetailSection>

        <DetailSection icon={<Handshake />} label={t("I am looking for")}>
          <FactChips
            items={[
              {
                icon: <Users />,
                label: t("Living with"),
                text: t(livingWithLabel[prefs.livingWith]),
                onClick: () => onEditBasics("livingWith"),
              },
              {
                icon: <Cigarette />,
                label: t("Smoking at home"),
                text: prefs.smokeFree
                  ? t("A smoke-free home")
                  : t("Smoking at home is fine"),
                onClick: () => onEditBasics("smoke"),
              },
              {
                icon: <PawPrint />,
                label: t("Pets"),
                text: prefs.petsOkay
                  ? t("Pets welcome")
                  : t("A home without pets"),
                onClick: () => onEditBasics("pets"),
              },
            ]}
          />
        </DetailSection>

        <DetailSection
          icon={<Languages />}
          label={t("Languages")}
          action={editButton(
            () => setEditing("languages"),
            me.languages.length > 0,
          )}
        >
          {me.languages.length > 0 ? (
            <FactChips
              items={me.languages.map((l) => ({
                text: t(l),
                tone: "interest" as const,
              }))}
            />
          ) : (
            <p className={p.empty}>
              {t("Which languages can you talk in at home?")}
            </p>
          )}
        </DetailSection>

        <DetailSection
          icon={<Sparkles />}
          label={t("Interests")}
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing("interests")}
            >
              {me.interests.length ? t("Edit interests") : t("Add interests")}
            </Button>
          }
        >
          {me.interests.length > 0 ? (
            <FactChips
              items={me.interests.map((i) => ({
                text: t(i),
                tone: "interest" as const,
              }))}
            />
          ) : (
            <p className={p.empty}>
              {t("Show what you like doing, so shared interests stand out.")}
            </p>
          )}
        </DetailSection>

        {me.prompts.map((pr, i) => (
          <DetailSection
            key={pr.question}
            icon={<MessageSquareQuote />}
            label={t(pr.question)}
            action={editButton(() => setEditing({ prompt: i }), true)}
          >
            <PullQuote>{pr.answer}</PullQuote>
          </DetailSection>
        ))}
        {me.prompts.length < MAX_PROMPTS && (
          <DetailSection
            icon={<MessageSquareQuote />}
            label={t("Profile questions")}
          >
            {me.prompts.length === 0 && (
              <p className={p.empty}>
                {t(
                  "Answer a few questions so people know what living with you is like.",
                )}
              </p>
            )}
            <Button
              className={p.sectionButton}
              leadingIcon={<Plus />}
              variant={me.prompts.length ? "secondary" : "primary"}
              onClick={() => setEditing({ prompt: me.prompts.length })}
              fullWidth
            >
              {t("Add a question")}
            </Button>
          </DetailSection>
        )}

        <DetailSection icon={<ShieldCheck />} label={t("Get verified")}>
          {me.verified ? (
            <FactRows
              items={[
                {
                  icon: <BadgeCheck />,
                  text: t("Student email verified (demo)"),
                },
              ]}
            />
          ) : (
            <>
              <p className={p.empty}>
                {t("A checked student email shows people you are who you say.")}
              </p>
              <Button
                className={p.sectionButton}
                leadingIcon={<ShieldCheck />}
                onClick={() => onMe({ verified: true })}
                fullWidth
              >
                {t("Verify student email")}
              </Button>
            </>
          )}
        </DetailSection>
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
              key: "birthDate",
              label: t("Date of birth"),
              type: "date",
              value: me.birthDate,
              hint: t("Others see your age, never the date."),
              ...birthDateRange(),
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
              birthDate: String(v.birthDate),
              age: ageFrom(String(v.birthDate)),
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
