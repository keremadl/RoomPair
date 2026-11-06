import { Rubik } from "next/font/google";

/** Rubik, the Card language's typeface. Exposes --font-rubik for theme.css. */
const rubik = Rubik({
  subsets: ["latin", "latin-ext"],
  variable: "--font-rubik",
  display: "swap",
});

export const directionFontVariables = rubik.variable;
