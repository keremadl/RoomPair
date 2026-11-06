"use client";
import { useState } from "react";
import {
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarDays,
  Cake,
  Cigarette,
  Clock,
  Eye,
  MapPin,
  Moon,
  PawPrint,
  Pencil,
  Plus,
  Receipt,
  ShieldCheck,
  Sparkles,
  Text as TextIcon,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import {
  Button,
  ChoiceCards,
  Dialog,
  ListGroup,
  ListRow,
  VisuallyHidden,
} from "@/design-system";
import { defaultLanguage, discoverParts } from "@/design-system/languages";
import { dateLabel, sleepLabel } from "@/lib/discover/deck";
import { useI18n } from "@/lib/i18n";
import {
  MAX_PHOTOS,
  MAX_PROMPTS,
  completion,
  profileSteps,
} from "@/lib/profile";
import type { MyProfile, Preferences, Profile } from "@/lib/types";
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
  | "room"
  | "roomText"
  | "bio"
  | "interests"
  | "preview"
  | { prompt: number };

/** Builds the card others see from your own answers. */
function asProfile(me: MyProfile, prefs: Preferences): Profile {
  return {
    id: "me",
    name: prefs.name,
    age: me.age,
    occupation: me.occupation,
    university: "",
    city: prefs.city,
    neighborhood: prefs.city,
    bio: me.bio,
    photo: me.photos[0] ?? "",
    photos: me.photos,
    budget: [prefs.budgetMin, prefs.budgetMax],
    moveDate: prefs.moveDate,
    stayMonths: prefs.stayMonths,
    intent: prefs.intent === "have-room" ? "have-room" : "find-room",
    tags: me.interests,
    prompt: me.prompts[0] ?? { question: "", answer: "" },
    habits: {
      cleanliness: prefs.cleanliness as Profile["habits"]["cleanliness"],
      social: prefs.social as Profile["habits"]["social"],
      sleep: prefs.sleep,
      smoking: !prefs.smokeFree,
      pets: false,
    },
    verified: me.verified,
    active: true,
    likesYou: false,
    room:
      prefs.intent === "have-room" && me.room.photos[0]
        ? {
            title: me.room.title,
            price: me.room.price,
            photo: me.room.photos[0],
            description: me.room.description,
          }
        : undefined,
  };
}

/**
 * Your profile: what others see on your card and in your details, with
 * every field editable in place. Settings live behind the gear at the top.
 */
export function ProfileView({
  preferences: prefs,
  me,
  onMe,
  onEditBasics,
  onIntent,
  onError,
}: {
  preferences: Preferences;
  me: MyProfile;
  onMe: (next: Partial<MyProfile>) => void;
  /** Opens the setup steps (1 = budget and dates, 2 = habits, 3 = must-haves). */
  onEditBasics: (step: number) => void;
  onIntent: (intent: "find-room" | "have-room") => void;
  onError: (message: string) => void;
}) {
  const { t } = useI18n();
  const [editing, setEditing] = useState<Editing>(null);
  const host = prefs.intent === "have-room";
  const steps = profileSteps(me, prefs);
  const percent = completion(steps);
  const next = steps.find((s) => !s.done);
  const { Card } = discoverParts[defaultLanguage];
  const close = () => setEditing(null);

  return (
    <>
      <VisuallyHidden as="h1">{t("nav.profile")}</VisuallyHidden>
      <div className={p.page}>
        {/* Summary: main photo with completion ring, name, preview */}
        <header className={p.summary}>
          <div
            className={p.ring}
            style={{ "--done": percent } as React.CSSProperties}
            role="img"
            aria-label={`${t("Profile")} ${percent}% ${t("complete")}`}
          >
            {me.photos[0] ? (
              <img src={me.photos[0]} alt="" />
            ) : (
              <span>{prefs.name.charAt(0)}</span>
            )}
            <b>{percent}%</b>
          </div>
          <div className={p.who}>
            <h2 className={p.name}>
              {prefs.name}, {me.age}
              {me.verified && (
                <BadgeCheck aria-label={t("discover.verified")} />
              )}
            </h2>
            <Button
              size="sm"
              variant="secondary"
              leadingIcon={<Eye />}
              onClick={() => setEditing("preview")}
            >
              {t("Preview my card")}
            </Button>
          </div>
        </header>

        {next && (
          <div className={p.tip}>
            <Sparkles aria-hidden="true" />
            <p>
              <strong>{t("Next")}:</strong> {t(next.label)}
            </p>
          </div>
        )}

        <section className={p.section}>
          <ChoiceCards
            label={t("What are you looking for?")}
            value={host ? "have-room" : "find-room"}
            onChange={onIntent}
            columns={2}
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
        </section>

        <section className={p.section} aria-labelledby="my-photos">
          <h2 className={p.heading} id="my-photos">
            {t("My photos")}
          </h2>
          <PhotoGrid
            photos={me.photos}
            max={MAX_PHOTOS}
            label={t("My photos")}
            onChange={(photos) => onMe({ photos })}
            onError={onError}
          />
        </section>

        {host && (
          <section className={p.section} aria-labelledby="my-room">
            <h2 className={p.heading} id="my-room">
              {t("My room")}
            </h2>
            <p className={p.lead}>
              {t("Room seekers see the main room photo first.")}
            </p>
            <PhotoGrid
              photos={me.room.photos}
              max={MAX_PHOTOS}
              label={t("Room photos")}
              onChange={(photos) => onMe({ room: { ...me.room, photos } })}
              onError={onError}
            />
            <ListGroup>
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
            </ListGroup>
            <button
              type="button"
              className={p.textCard}
              onClick={() => setEditing("roomText")}
            >
              <span className={p.cardLabel}>{t("About the room")}</span>
              {me.room.description ? (
                <span className={p.cardText}>{me.room.description}</span>
              ) : (
                <span className={p.cardEmpty}>
                  {t("Size, light, what is shared, who lives there…")}
                </span>
              )}
              <Pencil className={p.pen} aria-hidden="true" />
            </button>
          </section>
        )}

        <section className={p.section} aria-labelledby="about-me">
          <h2 className={p.heading} id="about-me">
            {t("About me")}
          </h2>
          <button
            type="button"
            className={p.textCard}
            onClick={() => setEditing("bio")}
          >
            {me.bio ? (
              <span className={p.cardText}>{me.bio}</span>
            ) : (
              <span className={p.cardEmpty}>
                {t("A few lines about you and how you like to live")}
              </span>
            )}
            <Pencil className={p.pen} aria-hidden="true" />
          </button>
        </section>

        <section className={p.section} aria-labelledby="my-prompts">
          <h2 className={p.heading} id="my-prompts">
            {t("My prompts")}
          </h2>
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
                <Pencil className={p.pen} aria-hidden="true" />
              </button>
            ))}
            {me.prompts.length < MAX_PROMPTS && (
              <button
                type="button"
                className={p.prompt}
                data-empty="true"
                onClick={() => setEditing({ prompt: me.prompts.length })}
              >
                <Plus aria-hidden="true" />
                <span>{t("Add a prompt")}</span>
              </button>
            )}
          </div>
        </section>

        <section className={p.section} aria-labelledby="my-interests">
          <div className={p.headRow}>
            <h2 className={p.heading} id="my-interests">
              {t("Interests")}
            </h2>
            <Button
              size="sm"
              variant="ghost"
              leadingIcon={<Pencil />}
              onClick={() => setEditing("interests")}
            >
              {t("Edit")}
            </Button>
          </div>
          {me.interests.length ? (
            <ul className={p.tags}>
              {me.interests.map((i) => (
                <li key={i}>{t(i)}</li>
              ))}
            </ul>
          ) : (
            <p className={p.lead}>{t("No interests yet.")}</p>
          )}
        </section>

        <ListGroup title={t("Basics")} id="basics">
          <ListRow
            icon={<UserRound />}
            label={t("Name")}
            value={prefs.name}
            onClick={() => onEditBasics(0)}
          />
          <ListRow
            icon={<Cake />}
            label={t("Age")}
            value={me.age}
            onClick={() => setEditing("basics")}
          />
          <ListRow
            icon={<Briefcase />}
            label={t("Work or studies")}
            value={me.occupation}
            onClick={() => setEditing("basics")}
          />
          <ListRow
            icon={<MapPin />}
            label={t("City")}
            value={prefs.city}
            onClick={() => onEditBasics(1)}
          />
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
        </ListGroup>

        <ListGroup title={t("Living habits")} id="habits">
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
        </ListGroup>

        <ListGroup title={t("Trust")} id="trust">
          <ListRow
            icon={<ShieldCheck />}
            label={t("Student email")}
            value={me.verified ? t("Verified (demo)") : undefined}
            onClick={() => onMe({ verified: !me.verified })}
          />
        </ListGroup>
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
      {editing === "basics" && (
        <FieldsDialog
          title={t("Basics")}
          fields={[
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
