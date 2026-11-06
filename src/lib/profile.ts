/**
 * Your own profile: the demo defaults, the prompt and interest choices,
 * and how complete the profile is. Wording is a first draft; the team
 * decides the final prompts and fields.
 */
import type { MyProfile, Preferences, Profile } from "./types";

export const MAX_PHOTOS = 6;
export const MAX_PROMPTS = 3;
export const MAX_INTERESTS = 5;

export const promptQuestions = [
  "My ideal Sunday at home",
  "A small thing that makes a home",
  "The best flatmate I ever had…",
  "After a long day I…",
  "In the kitchen I'm the one who…",
  "A house rule I'd never break",
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

export const defaultMe: MyProfile = {
  photos: ["/images/alex.jpg"],
  age: 22,
  occupation: "Computer science student",
  bio: "",
  prompts: [
    {
      question: "My ideal Sunday at home",
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
  },
};

export type Step = { id: string; label: string; done: boolean };

/** The steps that make a profile complete; hosts also describe their room. */
export function profileSteps(me: MyProfile, prefs: Preferences): Step[] {
  const steps: Step[] = [
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
    { id: "prompts", label: "Answer 2 prompts", done: me.prompts.length >= 2 },
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

export const completion = (steps: Step[]) =>
  Math.round((steps.filter((s) => s.done).length / steps.length) * 100);

/** Builds the card others see from your own answers. */
export function asProfile(me: MyProfile, prefs: Preferences): Profile {
  const host = prefs.intent === "have-room";
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
    intent: host ? "have-room" : "find-room",
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
      host && me.room.photos[0]
        ? {
            title: me.room.title,
            price: me.room.price,
            photo: me.room.photos[0],
            description: me.room.description,
          }
        : undefined,
  };
}
