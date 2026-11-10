/** Fictional demo profiles. Compatibility is a rule-based fit score, not a prediction. */
export type HabitLevel = 1 | 2 | 3 | 4 | 5;
export type SleepSchedule = "early" | "flexible" | "late";
export type ProfileIntent = "find-room" | "have-room";
/** How often: guests over, being home in the day. */
export type Frequency = "rarely" | "sometimes" | "often";
/** How much noise at home is fine. */
export type NoiseTolerance = "low" | "medium" | "high";
/** What flatmates share beyond the rooms. */
export type Sharing = "separate" | "some" | "most";
export type WorkStatus = "student" | "working";
/** Optional; only used for the "who you'd like to live with" filter. */
export type Gender = "woman" | "man" | "nonbinary";
export type Prompt = { question: string; answer: string };

/** The room a host offers. */
export interface RoomDetails {
  title: string;
  price: number;
  photo: string;
  /** All room photos, the main one first (optional; else just `photo`). */
  photos?: string[];
  description: string;
  billsIncluded: boolean;
  deposit: number;
  privateBathroom: boolean;
  furnished: boolean;
  /** People already living there, not counting the newcomer. */
  flatmates: number;
  /** How to get to campus or the centre, e.g. "Tram 1 · 10 min to RTU". */
  transport: string;
  houseRules: string;
}

export interface Profile {
  id: string;
  name: string;
  age: number;
  status: WorkStatus;
  /** What they study or do, e.g. "Design student". */
  occupation: string;
  /** Where: the school or the workplace. */
  university: string;
  languages: string[];
  gender?: Gender;
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
  /** Up to three; the first one is shown on the card. */
  prompts: Prompt[];
  habits: {
    cleanliness: HabitLevel;
    social: HabitLevel;
    sleep: SleepSchedule;
    smoking: boolean;
    pets: boolean;
    guests: Frequency;
    homeDays: Frequency;
    noise: NoiseTolerance;
    sharing: Sharing;
  };
  verified: boolean;
  active: boolean;
  likesYou: boolean;
  room?: RoomDetails;
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
  guests: Frequency;
  homeDays: Frequency;
  noise: NoiseTolerance;
  sharing: Sharing;
  smokeFree: boolean;
  petsOkay: boolean;
  verifiedOnly: boolean;
  /** Who you'd like to live with. People who did not say are only in "anyone". */
  livingWith: "anyone" | "women" | "men";
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
  /** A shared photo (data URL), shown above the text. */
  photo?: string;
  time: string;
}

export interface Conversation {
  id: string;
  profileId: string;
  messages: Message[];
  unread: number;
  matchedAt: string;
}

/** What you show others: photos, words, and your room if you have one. */
export interface MyProfile {
  /** Data URLs or /images paths. The first is the main photo. */
  photos: string[];
  age: number;
  status: WorkStatus;
  occupation: string;
  /** School or workplace. */
  school: string;
  languages: string[];
  gender?: Gender;
  /** The part of town: where the room is, or where you would like to live. */
  neighborhood: string;
  /** About you, not about what you accept: the smoke-free and pet filters use these. */
  smokes: boolean;
  hasPets: boolean;
  bio: string;
  prompts: Prompt[];
  interests: string[];
  /** Demo only: whether the student-email check is done. */
  verified: boolean;
  /** Only used when you have a room. */
  room: Omit<RoomDetails, "photo"> & { photos: string[] };
}
