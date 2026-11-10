"use client";
import { useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Backpack,
  CalendarDays,
  Cigarette,
  Clock,
  Home,
  ImagePlus,
  Key,
  Languages,
  MapPin,
  MessageSquareQuote,
  Moon,
  PartyPopper,
  PawPrint,
  Smile,
  Sofa,
  Sparkles,
  Star,
  Sun,
  Tag,
  UserRound,
  Users,
  Volume2,
  Wallet,
  X,
  type IconComponent,
} from "@/design-system/icons";
import {
  Button,
  Chip,
  ChoiceCards,
  Dialog,
  FactGrid,
  Heading,
  IconButton,
  Input,
  PageTransition,
  Progress,
  Text,
  Textarea,
  type ChoiceCardOption,
} from "@/design-system";
import { dateLabel } from "@/lib/discover/deck";
import { useI18n } from "@/lib/i18n";
import {
  ageFrom,
  interestOptions,
  isAdultBirthDate,
  languageOptions,
  MAX_AGE,
  MAX_PHOTOS,
  MIN_AGE,
} from "@/lib/profile";
import type {
  Frequency,
  Gender,
  MyProfile,
  NoiseTolerance,
  Preferences,
  Sharing,
  SleepSchedule,
  WorkStatus,
} from "@/lib/types";
import { PhotoGrid } from "./profile/PhotoGrid";
import o from "./Onboarding.module.css";

/** One screen of setup, or one answer opened on its own from Edit profile. */
export type SetupQuestion =
  | "name"
  | "intent"
  | "gender"
  | "city"
  | "budget"
  | "room"
  | "roomPhotos"
  | "moveDate"
  | "stay"
  | "photos"
  | "work"
  | "smoke"
  | "pets"
  | "cleanliness"
  | "sleep"
  | "guests"
  | "noise"
  | "livingWith"
  | "social"
  | "homeDays"
  | "sharing"
  | "languages"
  | "interests"
  | "bio"
  | "done";

/** The parts of the member's own profile that setup asks about. */
export type SetupProfile = Pick<
  MyProfile,
  | "birthDate"
  | "age"
  | "gender"
  | "status"
  | "occupation"
  | "school"
  | "neighborhood"
  | "smokes"
  | "hasPets"
  | "languages"
  | "interests"
  | "photos"
  | "bio"
  | "room"
>;

type Question = {
  id: SetupQuestion;
  icon: IconComponent;
  title: string;
  hint?: string;
  /** Only people who look for a room, or only people who have one. */
  for?: "seeker" | "host";
  /** Can be skipped: the answer is not needed to find people. */
  optional?: boolean;
};

/**
 * The walk-through, in order. It asks what matching and a visible profile
 * need, and nothing else: everything a person must have to be shown to others
 * is required here, and what only makes a profile richer waits in Edit profile.
 */
const walkthrough: Question[] = [
  {
    id: "name",
    icon: Smile,
    title: "What is your name and date of birth?",
    hint: "Your profile shows your name and age, never the date. RoomPair is for adults.",
  },
  {
    id: "intent",
    icon: Key,
    title: "What brings you here?",
  },
  {
    id: "gender",
    icon: UserRound,
    title: "Which describes you?",
    hint: "Only used when someone wants to live with women or men only.",
    optional: true,
  },
  {
    id: "city",
    icon: MapPin,
    title: "Where do you want to live?",
  },
  {
    id: "budget",
    icon: Wallet,
    title: "What is your monthly budget?",
    hint: "Per person, per month, before bills.",
    for: "seeker",
  },
  {
    id: "room",
    icon: Tag,
    title: "Tell us about the room",
    hint: "The title and the rent are the first things people see.",
    for: "host",
  },
  {
    id: "roomPhotos",
    icon: ImagePlus,
    title: "Show the room",
    hint: "A listing needs at least one photo of the room.",
    for: "host",
  },
  {
    id: "moveDate",
    icon: CalendarDays,
    title: "When, and for how long?",
  },
  {
    id: "photos",
    icon: ImagePlus,
    title: "Add a photo of yourself",
    hint: "Others only see profiles with at least one photo.",
  },
  {
    id: "work",
    icon: Backpack,
    title: "What do you do?",
    hint: "People like to know who they would be living with.",
  },
  {
    id: "smoke",
    icon: Cigarette,
    title: "Do you smoke?",
  },
  {
    id: "pets",
    icon: PawPrint,
    title: "Do you have a pet?",
  },
  {
    id: "cleanliness",
    icon: Sparkles,
    title: "How tidy do you keep things?",
  },
  {
    id: "sleep",
    icon: Moon,
    title: "When does your day start and end?",
  },
  {
    id: "guests",
    icon: PartyPopper,
    title: "How often do you have guests over?",
  },
  {
    id: "noise",
    icon: Volume2,
    title: "How much noise is fine?",
  },
  {
    id: "livingWith",
    icon: Home,
    title: "Who would you like to live with?",
  },
  { id: "done", icon: PartyPopper, title: "You are all set!" },
];

/** Answers that are not part of the walk-through; Edit profile opens them one at a time. */
const extras: Question[] = [
  { id: "stay", icon: Clock, title: "How long do you plan to stay?" },
  { id: "social", icon: Users, title: "How social are you at home?" },
  { id: "homeDays", icon: Sun, title: "Are you home in the day?" },
  { id: "sharing", icon: Sofa, title: "What do you like to share?" },
  {
    id: "languages",
    icon: Languages,
    title: "Which languages do you speak?",
  },
  {
    id: "interests",
    icon: Star,
    title: "What are you into?",
    hint: "Pick up to 8. They help you find your kind of people.",
  },
  {
    id: "bio",
    icon: MessageSquareQuote,
    title: "Anything else people should know?",
    hint: "A few words in your own voice.",
  },
];

const MAX_INTERESTS = 8;
const MAX_BIO = 600;
const stays = [3, 6, 12, 24];

/** One question's answers as a list of rows; exactly one is chosen. */
function Options<T extends string>({
  legend,
  showLegend = false,
  value,
  options,
  onChange,
}: {
  legend: string;
  /** Show the group's name: for a second group under the screen's question. */
  showLegend?: boolean;
  value: T;
  options: ChoiceCardOption<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <ChoiceCards
      className={showLegend ? o.named : o.options}
      label={legend}
      value={value}
      options={options}
      onChange={onChange}
    />
  );
}

/**
 * Setup, one question per screen: a sticker, the question, its answers, and
 * Continue pinned to the bottom. With `only`, it shows that single question
 * and saves it, which is how Edit profile changes one answer.
 */
export function Onboarding({
  initial,
  profile: initialProfile,
  askAge = false,
  only,
  onComplete,
  onClose,
}: {
  initial: Preferences;
  profile: SetupProfile;
  /** The member has not given their age yet, so the field starts empty. */
  askAge?: boolean;
  /** Edit one answer instead of walking through all of them. */
  only?: SetupQuestion;
  onComplete: (preferences: Preferences, profile: SetupProfile) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [values, setValues] = useState<Preferences>({ ...initial });
  const [profile, setProfile] = useState<SetupProfile>({ ...initialProfile });
  // A member who has not said when they were born starts with an empty field.
  const [birthDate, setBirthDate] = useState(
    askAge ? "" : initialProfile.birthDate,
  );
  const [error, setError] = useState("");
  // A question without its illustration falls back to the icon sticker.
  const [missingArt, setMissingArt] = useState<Record<string, boolean>>({});
  const [direction, setDirection] = useState(1);
  const host = values.intent === "have-room";
  const flow = only
    ? [...walkthrough, ...extras].filter((q) => q.id === only)
    : walkthrough.filter((q) => !q.for || q.for === (host ? "host" : "seeker"));
  const [index, setIndex] = useState(0);
  const question = flow[Math.min(index, flow.length - 1)];
  const last = index >= flow.length - 1;

  const set = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setError("");
  };
  const setMe = (patch: Partial<SetupProfile>) => {
    setProfile((p) => ({ ...p, ...patch }));
    setError("");
  };
  const setRoom = (patch: Partial<SetupProfile["room"]>) =>
    setMe({ room: { ...profile.room, ...patch } });

  // Today in the user's time zone, as YYYY-MM-DD, to refuse dates in the past.
  const now = new Date();
  const today = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
  const yearsAgo = (years: number) =>
    `${Number(today.slice(0, 4)) - years}${today.slice(4)}`;
  function validate(id: SetupQuestion): string {
    if (id === "name") {
      if (!values.name.trim()) return t("ob.nameError");
      if (!ageFrom(birthDate)) return t("Enter your date of birth.");
      if (!isAdultBirthDate(birthDate))
        return t("You need to be 18 or older to use RoomPair.");
    }
    if (id === "city" && !values.city.trim()) return t("ob.cityError");
    if (
      id === "budget" &&
      (!Number.isFinite(values.budgetMin) ||
        !Number.isFinite(values.budgetMax) ||
        values.budgetMin < 100 ||
        values.budgetMax > 5000 ||
        values.budgetMax <= values.budgetMin)
    )
      return t("ob.budgetError");
    if (id === "room") {
      if (!profile.room.title.trim()) return t("Give the room a title.");
      if (
        !Number.isFinite(profile.room.price) ||
        profile.room.price < 100 ||
        profile.room.price > 5000
      )
        return t("Enter a monthly rent from €100 to €5,000.");
    }
    if (id === "roomPhotos" && !profile.room.photos.length)
      return t("Add at least one photo of the room.");
    if (id === "moveDate") {
      const date = new Date(`${values.moveDate}T12:00:00Z`);
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(values.moveDate) ||
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== values.moveDate ||
        values.moveDate < today
      )
        return t("ob.dateError");
    }
    if (id === "photos" && !profile.photos.length)
      return t("Add at least one photo so people can see you.");
    if (id === "work" && !profile.occupation.trim())
      return t("Say what you study or do.");
    return "";
  }
  function finish() {
    onComplete(
      { ...values, name: values.name.trim(), city: values.city.trim() },
      {
        ...profile,
        ...(isAdultBirthDate(birthDate)
          ? { birthDate, age: ageFrom(birthDate) }
          : { birthDate: initialProfile.birthDate, age: initialProfile.age }),
        occupation: profile.occupation.trim(),
        school: profile.school.trim(),
        neighborhood: profile.neighborhood.trim(),
        bio: profile.bio.trim(),
        room: { ...profile.room, title: profile.room.title.trim() },
      },
    );
  }
  function next() {
    const invalid = validate(question.id);
    if (invalid) return setError(invalid);
    if (last) return finish();
    setDirection(1);
    setIndex((i) => i + 1);
  }
  function skip() {
    setError("");
    setDirection(1);
    setIndex((i) => i + 1);
  }
  function back() {
    setError("");
    setDirection(-1);
    setIndex((i) => Math.max(0, i - 1));
  }
  const toggle = (list: string[], item: string, max: number) =>
    list.includes(item)
      ? list.filter((x) => x !== item)
      : list.length < max
        ? [...list, item]
        : list;

  const months = (count: number) =>
    count === 1 ? t("1 month") : t("{count} months", { count });
  const title =
    question.id === "done"
      ? t("You are all set, {name}!", { name: values.name.trim() })
      : question.id === "city" && host
        ? t("Where is the room?")
        : t(question.title);
  const frequency = (labels: [string, string, string]) =>
    (["rarely", "sometimes", "often"] as Frequency[]).map((value, i) => ({
      value,
      title: labels[i],
    }));
  const scale = (labels: string[]) =>
    labels.map((label, i) => ({ value: String(i + 1), title: label }));
  const stayOptions = [
    ...stays.map((count) => ({ value: String(count), title: months(count) })),
    // An answer from before that is not one of the usual lengths.
    ...(stays.includes(values.stayMonths)
      ? []
      : [
          {
            value: String(values.stayMonths),
            title: months(values.stayMonths),
          },
        ]),
  ];
  const problem = error && (
    <Text tone="danger" role="alert">
      {error}
    </Text>
  );

  let body: ReactNode;
  switch (question.id) {
    case "name":
      body = (
        <>
          <Input
            label={t("ob.namePlaceholder")}
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            autoComplete="given-name"
            maxLength={48}
          />
          <Input
            label={t("Date of birth")}
            type="date"
            min={yearsAgo(MAX_AGE + 1)}
            max={yearsAgo(MIN_AGE)}
            autoComplete="bday"
            value={birthDate}
            onChange={(e) => {
              setBirthDate(e.target.value);
              setError("");
            }}
          />
          {problem}
        </>
      );
      break;
    case "intent":
      body = (
        <Options<"find-room" | "have-room">
          legend={title}
          value={host ? "have-room" : "find-room"}
          onChange={(v) => set("intent", v)}
          options={[
            {
              value: "find-room",
              title: t("ob.findRoom"),
              hint: t("ob.findRoomHint"),
              icon: <Home />,
            },
            {
              value: "have-room",
              title: t("ob.haveRoom"),
              hint: t("ob.haveRoomHint"),
              icon: <Key />,
            },
          ]}
        />
      );
      break;
    case "gender":
      body = (
        <Options<Gender | "">
          legend={title}
          value={profile.gender ?? ""}
          onChange={(v) => setMe({ gender: v || undefined })}
          options={[
            { value: "woman", title: t("Woman") },
            { value: "man", title: t("Man") },
            { value: "nonbinary", title: t("Non-binary") },
            { value: "", title: t("Prefer not to say") },
          ]}
        />
      );
      break;
    case "city":
      body = (
        <>
          <Input
            label={t("ob.city")}
            value={values.city}
            onChange={(e) => set("city", e.target.value)}
            maxLength={70}
            error={error || undefined}
          />
          <Input
            label={t("Area (optional)")}
            hint={
              host
                ? t("The part of town the room is in.")
                : t("A part of town you would like, if you have one.")
            }
            value={profile.neighborhood}
            onChange={(e) => setMe({ neighborhood: e.target.value })}
            maxLength={70}
          />
        </>
      );
      break;
    case "budget":
      body = (
        <div className={o.pair}>
          <Input
            label={t("From")}
            type="number"
            inputMode="numeric"
            prefix="€"
            value={values.budgetMin}
            onChange={(e) => set("budgetMin", Number(e.target.value))}
          />
          <Input
            label={t("Up to")}
            type="number"
            inputMode="numeric"
            prefix="€"
            value={values.budgetMax}
            onChange={(e) => set("budgetMax", Number(e.target.value))}
            error={error || undefined}
          />
        </div>
      );
      break;
    case "room":
      body = (
        <>
          <Input
            label={t("Title")}
            hint={t("For example: Sunny room near the park")}
            value={profile.room.title}
            onChange={(e) => setRoom({ title: e.target.value })}
            maxLength={120}
          />
          <Input
            label={t("Rent per month")}
            type="number"
            inputMode="numeric"
            prefix="€"
            value={profile.room.price}
            onChange={(e) => setRoom({ price: Number(e.target.value) })}
          />
          <Options<"yes" | "no">
            legend={t("Are bills included?")}
            showLegend
            value={profile.room.billsIncluded ? "yes" : "no"}
            onChange={(v) => setRoom({ billsIncluded: v === "yes" })}
            options={[
              { value: "yes", title: t("Yes, bills are included") },
              { value: "no", title: t("No, bills are extra") },
            ]}
          />
          {problem}
        </>
      );
      break;
    case "roomPhotos":
      body = (
        <>
          <PhotoGrid
            photos={profile.room.photos}
            max={MAX_PHOTOS}
            label={t("Room photos")}
            addLabel={t("Add photos")}
            onChange={(photos) => setRoom({ photos })}
            onError={setError}
          />
          {problem}
        </>
      );
      break;
    case "moveDate":
      body = (
        <>
          <Input
            label={host ? t("Available from") : t("ob.moveDate")}
            type="date"
            min={today}
            value={values.moveDate}
            onChange={(e) => set("moveDate", e.target.value)}
            error={error || undefined}
          />
          {!only && (
            <Options
              legend={host ? t("Minimum stay") : t("How long you plan to stay")}
              showLegend
              value={String(values.stayMonths)}
              onChange={(v) => set("stayMonths", Number(v))}
              options={stayOptions}
            />
          )}
        </>
      );
      break;
    case "stay":
      body = (
        <Options
          legend={title}
          value={String(values.stayMonths)}
          onChange={(v) => set("stayMonths", Number(v))}
          options={stayOptions}
        />
      );
      break;
    case "photos":
      body = (
        <>
          <PhotoGrid
            photos={profile.photos}
            max={MAX_PHOTOS}
            label={t("My photos")}
            addLabel={t("Add photos")}
            onChange={(photos) => setMe({ photos })}
            onError={setError}
          />
          {problem}
        </>
      );
      break;
    case "work":
      body = (
        <>
          <Options<WorkStatus>
            legend={t("Right now I'm")}
            value={profile.status}
            onChange={(v) => setMe({ status: v })}
            options={[
              { value: "student", title: t("Studying") },
              { value: "working", title: t("Working") },
            ]}
          />
          <Input
            label={t("What you study or do")}
            hint={t("For example: Design student")}
            value={profile.occupation}
            onChange={(e) => setMe({ occupation: e.target.value })}
            maxLength={80}
            error={error || undefined}
          />
          <Input
            label={t("School or workplace")}
            hint={t("For example: Riga Technical University")}
            value={profile.school}
            onChange={(e) => setMe({ school: e.target.value })}
            maxLength={80}
          />
        </>
      );
      break;
    case "smoke":
      // One question covers both sides: what you do, and what you accept.
      body = (
        <Options<"no-free" | "no-fine" | "yes">
          legend={title}
          value={
            profile.smokes ? "yes" : values.smokeFree ? "no-free" : "no-fine"
          }
          onChange={(v) => {
            setMe({ smokes: v === "yes" });
            set("smokeFree", v === "no-free");
          }}
          options={[
            {
              value: "no-free",
              title: t("No, and I want a smoke-free home"),
              hint: t("People who smoke are hidden."),
            },
            { value: "no-fine", title: t("No, but I do not mind it") },
            { value: "yes", title: t("Yes, I smoke") },
          ]}
        />
      );
      break;
    case "pets":
      body = (
        <Options<"have" | "welcome" | "none">
          legend={title}
          value={
            profile.hasPets ? "have" : values.petsOkay ? "welcome" : "none"
          }
          onChange={(v) => {
            setMe({ hasPets: v === "have" });
            set("petsOkay", v !== "none");
          }}
          options={[
            { value: "have", title: t("Yes, I have a pet") },
            { value: "welcome", title: t("No, but pets are welcome") },
            {
              value: "none",
              title: t("No, and no pets please"),
              hint: t("People with pets are hidden."),
            },
          ]}
        />
      );
      break;
    case "cleanliness":
      body = (
        <Options
          legend={title}
          value={String(values.cleanliness)}
          onChange={(v) => set("cleanliness", Number(v))}
          options={scale([
            t("Relaxed about mess"),
            t("Fairly relaxed"),
            t("Tidy enough"),
            t("Tidy"),
            t("Spotless"),
          ])}
        />
      );
      break;
    case "social":
      body = (
        <Options
          legend={title}
          value={String(values.social)}
          onChange={(v) => set("social", Number(v))}
          options={scale([
            t("I keep to myself"),
            t("Mostly on my own"),
            t("A chat now and then"),
            t("I like company"),
            t("Always up for hanging out"),
          ])}
        />
      );
      break;
    case "sleep":
      body = (
        <Options<SleepSchedule>
          legend={title}
          value={values.sleep}
          onChange={(v) => set("sleep", v)}
          options={[
            { value: "early", title: t("ob.early"), icon: <Sun /> },
            { value: "flexible", title: t("ob.flexible"), icon: <Clock /> },
            { value: "late", title: t("ob.late"), icon: <Moon /> },
          ]}
        />
      );
      break;
    case "guests":
      body = (
        <Options<Frequency>
          legend={title}
          value={values.guests}
          onChange={(v) => set("guests", v)}
          options={frequency([t("Rarely"), t("Sometimes"), t("Often")])}
        />
      );
      break;
    case "homeDays":
      body = (
        <Options<Frequency>
          legend={title}
          value={values.homeDays}
          onChange={(v) => set("homeDays", v)}
          options={frequency([
            t("Out most days"),
            t("Some days"),
            t("Most days"),
          ])}
        />
      );
      break;
    case "noise":
      body = (
        <Options<NoiseTolerance>
          legend={title}
          value={values.noise}
          onChange={(v) => set("noise", v)}
          options={[
            { value: "low", title: t("I need it quiet") },
            { value: "medium", title: t("Some is fine") },
            { value: "high", title: t("It doesn't bother me") },
          ]}
        />
      );
      break;
    case "sharing":
      body = (
        <Options<Sharing>
          legend={title}
          value={values.sharing}
          onChange={(v) => set("sharing", v)}
          options={[
            { value: "separate", title: t("Keep things separate") },
            { value: "some", title: t("The basics") },
            { value: "most", title: t("Most things") },
          ]}
        />
      );
      break;
    case "livingWith":
      body = (
        <Options<Preferences["livingWith"]>
          legend={title}
          value={values.livingWith}
          onChange={(v) => set("livingWith", v)}
          options={[
            { value: "anyone", title: t("Anyone") },
            { value: "women", title: t("Women only") },
            { value: "men", title: t("Men only") },
          ]}
        />
      );
      break;
    case "languages":
      body = (
        <div className={o.chips} role="group" aria-label={title}>
          {languageOptions.map((language) => (
            <Chip
              key={language}
              type="button"
              selected={profile.languages.includes(language)}
              aria-pressed={profile.languages.includes(language)}
              onClick={() =>
                setMe({ languages: toggle(profile.languages, language, 12) })
              }
            >
              {t(language)}
            </Chip>
          ))}
        </div>
      );
      break;
    case "interests":
      body = (
        <>
          <Text size="sm" tone="muted">
            {t("{count} of {max} chosen", {
              count: profile.interests.length,
              max: MAX_INTERESTS,
            })}
          </Text>
          <div className={o.chips} role="group" aria-label={title}>
            {interestOptions.map((interest) => (
              <Chip
                key={interest}
                type="button"
                selected={profile.interests.includes(interest)}
                aria-pressed={profile.interests.includes(interest)}
                onClick={() =>
                  setMe({
                    interests: toggle(
                      profile.interests,
                      interest,
                      MAX_INTERESTS,
                    ),
                  })
                }
              >
                {t(interest)}
              </Chip>
            ))}
          </div>
        </>
      );
      break;
    case "bio":
      body = (
        <Textarea
          label={t("About me")}
          value={profile.bio}
          onChange={(e) => setMe({ bio: e.target.value })}
          maxLength={MAX_BIO}
          rows={5}
          hint={t("{count} characters left", {
            count: MAX_BIO - profile.bio.length,
          })}
        />
      );
      break;
    case "done":
      body = (
        <>
          <Text tone="muted">{t("ob.readyHint")}</Text>
          <FactGrid
            facts={[
              {
                label: t("ob.city"),
                value: profile.neighborhood.trim()
                  ? `${profile.neighborhood.trim()}, ${values.city}`
                  : values.city,
              },
              host
                ? {
                    label: t("Rent per month"),
                    value: `€${profile.room.price}`,
                  }
                : {
                    label: t("ob.budget"),
                    value: `€${values.budgetMin}–${values.budgetMax}`,
                  },
              {
                label: host ? t("Available from") : t("ob.moveDate"),
                value: dateLabel(values.moveDate),
              },
              {
                label: host ? t("Minimum stay") : t("Stay"),
                value: months(values.stayMonths),
              },
            ]}
          />
          <Text size="sm" tone="muted">
            {t(
              "Languages, interests and a few words about you make your profile stronger. Add them any time in My profile.",
            )}
          </Text>
        </>
      );
      break;
  }

  const Icon = question.icon;
  return (
    <Dialog
      title={t("ob.eyebrow")}
      onClose={onClose}
      size="full"
      hideTitle
      hideClose
    >
      <form
        className={o.screen}
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
        noValidate
      >
        <header className={o.top}>
          {index > 0 ? (
            <IconButton
              type="button"
              label={t("ob.back")}
              icon={<ArrowLeft />}
              variant="ghost"
              onClick={back}
            />
          ) : (
            <span className={o.spacer} />
          )}
          {only ? (
            <span className={o.grow} />
          ) : (
            <Progress
              className={o.grow}
              value={((index + 1) / flow.length) * 100}
              label={t("Setup progress")}
            />
          )}
          <IconButton
            type="button"
            label={t("Close")}
            icon={<X />}
            variant="ghost"
            onClick={onClose}
          />
        </header>

        <PageTransition
          transitionKey={question.id}
          motion={direction > 0 ? "push" : "pop"}
          className={o.page}
        >
          <div key={question.id} className={o.question}>
            {missingArt[question.id] ? (
              <div className={o.sticker} aria-hidden="true">
                <Icon />
              </div>
            ) : (
              // Decorative: the heading below asks the question.
              <img
                className={o.art}
                src={`/images/onboarding/${question.id}.webp`}
                alt=""
                width={360}
                height={240}
                onError={() =>
                  setMissingArt((m) => ({ ...m, [question.id]: true }))
                }
              />
            )}
            <Heading level={2} size="2xl">
              {title}
            </Heading>
            {question.hint && <Text tone="muted">{t(question.hint)}</Text>}
            <div className={o.answers}>{body}</div>
          </div>
        </PageTransition>

        <footer className={o.footer}>
          {!only && question.optional && (
            <Button type="button" variant="ghost" onClick={skip} fullWidth>
              {t("Skip")}
            </Button>
          )}
          <Button type="submit" fullWidth>
            {only
              ? t("Save")
              : question.id === "done"
                ? t("ob.finish")
                : t("ob.continue")}
          </Button>
        </footer>
      </form>
    </Dialog>
  );
}
