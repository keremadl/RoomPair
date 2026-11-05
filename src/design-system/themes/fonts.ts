import {
  Archivo,
  Archivo_Black,
  Atkinson_Hyperlegible,
  Bricolage_Grotesque,
  Figtree,
  Lexend,
  Rubik,
  Schibsted_Grotesk,
} from "next/font/google";

/** Fonts used by the candidate design languages. Each exposes a CSS variable the theme files read. */
const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
  display: "swap",
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
const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  variable: "--font-archivo",
  display: "swap",
});
const archivoBlack = Archivo_Black({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-archivo-black",
  display: "swap",
});

const lexend = Lexend({
  subsets: ["latin", "latin-ext"],
  variable: "--font-lexend",
  display: "swap",
});
const schibsted = Schibsted_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-schibsted",
  display: "swap",
});
const rubik = Rubik({
  subsets: ["latin", "latin-ext"],
  variable: "--font-rubik",
  display: "swap",
});

export const directionFontVariables = [
  atkinson,
  bricolage,
  figtree,
  archivo,
  archivoBlack,
]
  .map((f) => f.variable)
  .join(" ");
