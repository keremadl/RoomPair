/**
 * Your own profile: the demo defaults, the prompt and interest choices,
 * and how complete the profile is.
 *
 * Every field answers one question: "could I live with this person, or in
 * this home?" Anything matching uses is a choice (chips, scales); free text
 * is only for personality (bio and prompts).
 */
import type { MyProfile, Preferences, Profile } from "./types";

export const MAX_PHOTOS = 6;
export const MAX_PROMPTS = 3;
export const MAX_INTERESTS = 5;

/** Prompts about everyday life at home; anyone can answer them. */
export const promptQuestions = [
  "My ideal Sunday at home…",
  "When we disagree, I usually…",
  "The one thing I need from a flatmate…",
  "My share of the chores is usually…",
  "When guests come over, I…",
  "After a long day I…",
  "In the kitchen I'm the one who…",
  "A house rule I'd never break…",
  "What makes me a good flatmate…",
];

/** Extra prompts about the place, only for people who have a room. */
export const hostPromptQuestions = [
  "The best thing about living here…",
  "My favourite spot in the neighbourhood…",
  "What you should know about the people here…",
];

export const promptsFor = (host: boolean) =>
  host ? [...promptQuestions, ...hostPromptQuestions] : promptQuestions;

export const languageOptions = [
  "Latvian",
  "English",
  "Russian",
  "Turkish",
  "German",
  "French",
  "Spanish",
  "Italian",
  "Portuguese",
  "Arabic",
  "Chinese",
  "Ukrainian",
  "Polish",
  "Lithuanian",
  "Japanese",
  "Hindi",
];

export const interestOptions = [
  "Cooking",
  "Baking",
  "Board games",
  "Gaming",
  "Film nights",
  "Music",
  "Reading",
  "Running",
  "Cycling",
  "Yoga",
  "Gym",
  "Hiking",
  "Plants",
  "Art & design",
  "Photography",
  "Good coffee",
  "Travel",
  "Languages",
];

/** Full years between a date of birth (YYYY-MM-DD) and today; NaN if it is not a date. */
export function ageFrom(birthDate: string, now = new Date()): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  if (!match) return NaN;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.toISOString().slice(0, 10) !== birthDate) return NaN;
  const hadBirthday =
    now.getMonth() + 1 > month ||
    (now.getMonth() + 1 === month && now.getDate() >= day);
  return now.getFullYear() - year - (hadBirthday ? 0 : 1);
}
export const MIN_AGE = 18;
export const MAX_AGE = 99;
/** A date of birth that makes its owner an adult RoomPair can show. */
export const isAdultBirthDate = (birthDate: string) => {
  const age = ageFrom(birthDate);
  return age >= MIN_AGE && age <= MAX_AGE;
};

/** The earliest and latest date of birth a date field should offer. */
export function birthDateRange(now = new Date()) {
  const day = (years: number) =>
    new Date(Date.UTC(now.getFullYear() - years, now.getMonth(), now.getDate()))
      .toISOString()
      .slice(0, 10);
  return { min: day(MAX_AGE + 1), max: day(MIN_AGE) };
}

const demoBirthDate = "2004-05-14";
export const defaultMe: MyProfile = {
  photos: ["/images/alex-1.jpg"],
  birthDate: demoBirthDate,
  age: ageFrom(demoBirthDate),
  status: "student",
  occupation: "Computer science student",
  school: "Riga Technical University",
  languages: ["English"],
  neighborhood: "",
  smokes: false,
  hasPets: false,
  bio: "",
  prompts: [
    {
      question: "My ideal Sunday at home…",
      answer:
        "Slow breakfast, a long walk, then cooking something new for whoever is around.",
    },
  ],
  interests: ["Cooking", "Board games", "Cycling"],
  verified: false,
  room: {
    photos: [],
    title: "",
    price: 400,
    billsIncluded: true,
    description: "",
    deposit: 400,
    privateBathroom: false,
    furnished: true,
    flatmates: 1,
    transport: "",
    houseRules: "",
  },
};

/**
 * `required`: needed before others see you (photo, name, age, school or work;
 * the living-together answers come from setup). The rest is optional and
 * raises how complete the profile looks.
 */
export type Step = {
  id: string;
  label: string;
  done: boolean;
  required?: boolean;
};

/** The steps that make a profile complete; hosts also describe their room. */
export function profileSteps(me: MyProfile, prefs: Preferences): Step[] {
  const steps: Step[] = [
    {
      id: "photo",
      label: "Add a photo of yourself",
      done: me.photos.length >= 1,
      required: true,
    },
    {
      id: "basics",
      label: "Add your name, age and school or work",
      done: Boolean(prefs.name.trim() && me.age && me.occupation.trim()),
      required: true,
    },
    {
      id: "photos",
      label: "Add at least 3 photos",
      done: me.photos.length >= 3,
    },
    {
      id: "bio",
      label: "Write a few lines about you",
      done: me.bio.trim().length >= 20,
    },
    {
      id: "prompts",
      label: `Answer ${MAX_PROMPTS} prompts`,
      done: me.prompts.length >= MAX_PROMPTS,
    },
    {
      id: "languages",
      label: "Add the languages you speak",
      done: me.languages.length >= 1,
    },
    {
      id: "interests",
      label: "Pick 3 interests",
      done: me.interests.length >= 3,
    },
    { id: "verify", label: "Verify your student email", done: me.verified },
  ];
  if (prefs.intent === "have-room")
    steps.push(
      {
        id: "roomPhoto",
        label: "Add a photo of the room",
        done: me.room.photos.length >= 1,
        required: true,
      },
      {
        id: "roomPhotos",
        label: "Add 3 photos of the room",
        done: me.room.photos.length >= 3,
      },
      {
        id: "roomText",
        label: "Describe the room",
        done: me.room.description.trim().length >= 20,
      },
    );
  return steps;
}

/** Required steps still open. Until there are none, you cannot like anyone. */
export const missingRequired = (me: MyProfile, prefs: Preferences) =>
  profileSteps(me, prefs).filter((s) => s.required && !s.done);

export const completion = (steps: Step[]) =>
  Math.round((steps.filter((s) => s.done).length / steps.length) * 100);

/**
 * The preferences to match with. Someone who has a room is compared on the
 * rent they ask for it: their own "monthly budget" is not shown to them and
 * must not decide who they see.
 */
export const matchingPreferences = (
  me: MyProfile,
  prefs: Preferences,
): Preferences & { hostRoomPrice?: number } =>
  prefs.intent === "have-room"
    ? { ...prefs, hostRoomPrice: me.room.price }
    : prefs;

/** Builds the card others see from your own answers. */
export function asProfile(me: MyProfile, prefs: Preferences): Profile {
  const host = prefs.intent === "have-room";
  return {
    id: "me",
    name: prefs.name,
    age: me.age,
    status: me.status,
    occupation: me.occupation,
    university: me.school,
    languages: me.languages,
    gender: me.gender,
    city: prefs.city,
    neighborhood: me.neighborhood.trim() || prefs.city,
    bio: me.bio,
    photo: me.photos[0] ?? "",
    photos: me.photos,
    budget: [prefs.budgetMin, prefs.budgetMax],
    moveDate: prefs.moveDate,
    stayMonths: prefs.stayMonths,
    intent: host ? "have-room" : "find-room",
    tags: me.interests,
    prompts: me.prompts,
    habits: {
      cleanliness: prefs.cleanliness as Profile["habits"]["cleanliness"],
      social: prefs.social as Profile["habits"]["social"],
      sleep: prefs.sleep,
      smoking: me.smokes,
      pets: me.hasPets,
      guests: prefs.guests,
      homeDays: prefs.homeDays,
      noise: prefs.noise,
      sharing: prefs.sharing,
    },
    verified: me.verified,
    active: true,
    likesYou: false,
    room:
      host && me.room.photos[0]
        ? (({ photos, ...room }) => ({ ...room, photo: photos[0], photos }))(
            me.room,
          )
        : undefined,
  };
}
