import "./courtyard.css";
import "./cobalt.css";
import "./dusk.css";

export { directionFontVariables } from "./fonts";

export type DirectionId = "courtyard" | "cobalt" | "dusk";

export type Direction = {
  id: DirectionId;
  name: string;
  tagline: string;
  mood: string[];
  fonts: { heading: string; body: string };
  /** Semantic tokens shown as swatches. */
  swatches: string[];
};

export const directions: Direction[] = [
  {
    id: "courtyard",
    name: "A · Avlu",
    tagline:
      "Paper, forest green and a little clay. Calm and trustworthy, like a well-kept shared flat.",
    mood: ["Calm", "Trustworthy", "Natural"],
    fonts: { heading: "Manrope", body: "DM Sans" },
    swatches: [
      "--color-bg",
      "--color-primary",
      "--color-accent",
      "--color-text",
    ],
  },
  {
    id: "cobalt",
    name: "B · Kobalt",
    tagline:
      "Cool white, cobalt blue and a coral spark. Rounder shapes and bolder type for the move to a new city.",
    mood: ["Energetic", "Young", "Confident"],
    fonts: { heading: "Bricolage Grotesque", body: "Figtree" },
    swatches: [
      "--color-bg",
      "--color-primary",
      "--color-accent",
      "--color-text",
    ],
  },
  {
    id: "dusk",
    name: "C · Akşam",
    tagline:
      "Dark-first. Warm charcoal, apricot lamplight and a soft serif. Cosy, and photos glow against it.",
    mood: ["Cosy", "Intimate", "Photo-first"],
    fonts: { heading: "Fraunces", body: "Hanken Grotesk" },
    swatches: [
      "--color-bg",
      "--color-primary",
      "--color-accent",
      "--color-text",
    ],
  },
];
