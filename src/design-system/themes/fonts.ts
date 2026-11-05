import {
  Bricolage_Grotesque,
  Figtree,
  Fraunces,
  Hanken_Grotesk,
} from "next/font/google";

/** Fonts used by the candidate directions. Each exposes a CSS variable the theme files read. */
const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  variable: "--font-bricolage",
  display: "swap",
});
const figtree = Figtree({
  subsets: ["latin", "latin-ext"],
  variable: "--font-figtree",
  display: "swap",
});
const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
  display: "swap",
});
const hanken = Hanken_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-hanken",
  display: "swap",
});

export const directionFontVariables = [bricolage, figtree, fraunces, hanken]
  .map((f) => f.variable)
  .join(" ");
