/** Fictional demo profiles. Compatibility is a rule-based fit score, not a prediction. */
export type HabitLevel = 1 | 2 | 3 | 4 | 5;
export type SleepSchedule = "early" | "flexible" | "late";
export type ProfileIntent = "find-room" | "have-room";

export interface Profile {
  id: string;
  name: string;
  age: number;
  occupation: string;
  university: string;
  city: string;
  neighborhood: string;
  bio: string;
  photo: string;
  photos: string[];
  budget: [number, number];
  moveDate: string;
  stayMonths: number;
  intent: ProfileIntent;
  tags: string[];
  prompt: { question: string; answer: string };
  habits: {
    cleanliness: HabitLevel;
    social: HabitLevel;
    sleep: SleepSchedule;
    smoking: boolean;
    pets: boolean;
  };
  verified: boolean;
  active: boolean;
  likesYou: boolean;
  room?: { title: string; price: number; photo: string; description: string };
}

export interface Preferences {
  name: string;
  city: string;
  budgetMin: number;
  budgetMax: number;
  moveDate: string;
  stayMonths: number;
  intent: ProfileIntent | "either";
  cleanliness: number;
  social: number;
  sleep: SleepSchedule;
  smokeFree: boolean;
  petsOkay: boolean;
  verifiedOnly: boolean;
}

export interface MatchResult {
  score: number;
  eligible: boolean;
  reasons: string[];
  considerations: string[];
  breakdown: { label: string; score: number; detail: string }[];
  dealbreakers: string[];
}

export interface Message {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  profileId: string;
  messages: Message[];
  unread: number;
  matchedAt: string;
}

export interface Room {
  id: string;
  title: string;
  neighborhood: string;
  price: number;
  photo: string;
  tags: string[];
  description: string;
}

/** What you show others: photos, words, and your room if you have one. */
export interface MyProfile {
  /** Data URLs or /images paths. The first is the main photo. */
  photos: string[];
  age: number;
  occupation: string;
  bio: string;
  prompts: { question: string; answer: string }[];
  interests: string[];
  /** Demo only: whether the student-email check is done. */
  verified: boolean;
  /** Only used when you have a room. */
  room: {
    photos: string[];
    title: string;
    price: number;
    billsIncluded: boolean;
    description: string;
  };
}
