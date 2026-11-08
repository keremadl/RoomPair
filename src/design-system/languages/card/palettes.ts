/**
 * Placeholder until the palette files land: only today's look. The theme
 * (theme.css) already provides its light values.
 */
export const palettes = [
  {
    id: "classic",
    name: "Classic",
    description: "Today's look: violet, amber and navy ink.",
    swatches: {
      light: ["#e7ebf3", "#fffdf8", "#5b3fd6", "#f5a524", "#1d2240"],
      dark: ["#e7ebf3", "#fffdf8", "#5b3fd6", "#f5a524", "#1d2240"],
    },
  },
] as const;
export type PaletteId = (typeof palettes)[number]["id"];
export const defaultPalette: PaletteId = "classic";
