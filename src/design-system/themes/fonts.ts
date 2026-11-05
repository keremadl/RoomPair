import {
  Bricolage_Grotesque,
  Figtree,
  Hanken_Grotesk,
  IBM_Plex_Mono,
  Newsreader,
  Public_Sans,
  Sora,
} from "next/font/google";

/** Fonts used by the candidate design languages. Each exposes a CSS variable the theme files read. */
const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  variable: "--font-newsreader",
  display: "swap",
  style: ["normal", "italic"],
});
const publicSans = Public_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-public-sans",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-plex-mono",
  display: "swap",
  weight: ["400", "500"],
});
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
const sora = Sora({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sora",
  display: "swap",
});
const hanken = Hanken_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-hanken",
  display: "swap",
});

export const directionFontVariables = [
  newsreader,
  publicSans,
  plexMono,
  bricolage,
  figtree,
  sora,
  hanken,
]
  .map((f) => f.variable)
  .join(" ");
