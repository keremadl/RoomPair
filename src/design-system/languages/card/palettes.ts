/**
 * Colour palettes for the Card language. Each CSS file defines a light block
 * ([data-direction="card"][data-palette="<id>"]) and a dark block (the same
 * plus [data-theme="dark"]). Swatches: bg, surface, primary, xp, ink.
 */
import "./palette-classic.css";
import "./palette-volt.css";
import "./palette-lagoon.css";
import "./palette-hearth.css";
import "./palette-courtyard.css";
import "./palette-ink.css";
import "./palette-plum.css";
import "./palette-meadow.css";

export const palettes = [
  {
    id: "classic",
    name: "Classic",
    description: "Today's look: violet, amber and navy on a cool pale page.",
    swatches: {
      light: ["#e7ebf3", "#fffdf8", "#5b3fd6", "#f5a524", "#1d2240"],
      dark: ["#141831", "#1c2142", "#a796ff", "#f5a524", "#eef0fa"],
    },
  },
  {
    id: "volt",
    name: "Volt",
    description: "Electric cobalt with a highlighter-lime XP on an icy page.",
    swatches: {
      light: ["#e6edfc", "#fafcff", "#1d4ee0", "#c4f23a", "#0d1536"],
      dark: ["#0c1129", "#151c3d", "#7d97ff", "#c4f23a", "#eef2ff"],
    },
  },
  {
    id: "lagoon",
    name: "Lagoon",
    description: "Deep teal with a hot coral-pink XP on a mint-ice page.",
    swatches: {
      light: ["#e1f1ee", "#fafefd", "#00736c", "#ff5c7c", "#0a2a2d"],
      dark: ["#123034", "#1a3e43", "#45dccb", "#ff7d97", "#ecfaf8"],
    },
  },
  {
    id: "hearth",
    name: "Hearth",
    description: "Terracotta, sage and honey on warm oat paper.",
    swatches: {
      light: ["#f3ece1", "#fffaf3", "#a9472a", "#ebb34a", "#2e211a"],
      dark: ["#1d1612", "#271e19", "#e98a63", "#f0bd5a", "#f6ece1"],
    },
  },
  {
    id: "courtyard",
    name: "Courtyard",
    description: "Deep teal, clay and apricot on linen.",
    swatches: {
      light: ["#eee8de", "#fffbf4", "#1c6863", "#f2a35f", "#1e2b29"],
      dark: ["#121a19", "#1a2423", "#5ec4b7", "#f4a96a", "#efe8dd"],
    },
  },
  {
    id: "ink",
    name: "Ink",
    description: "Black-and-white zine cards with one fluorescent-magenta accent.",
    swatches: {
      light: ["#f4f4f1", "#fbfbf9", "#111111", "#ff2d87", "#111111"],
      dark: ["#111111", "#1a1a1a", "#f4f4f1", "#ff4f9a", "#f4f4f1"],
    },
  },
  {
    id: "plum",
    name: "Plum & Mint",
    description: "Deep berry plum with a fresh mint XP on blush paper.",
    swatches: {
      light: ["#f5ecf2", "#fffafc", "#8a2463", "#4fd9a6", "#2a1230"],
      dark: ["#1e1220", "#281a2b", "#f08cc6", "#5fe3b1", "#f8ecf4"],
    },
  },
  {
    id: "meadow",
    name: "Meadow",
    description: "Leaf green and sunflower yellow on fresh spring paper.",
    swatches: {
      light: ["#eef3e2", "#fdfef8", "#2b711c", "#ffc928", "#1a2614"],
      dark: ["#121a0f", "#1a2416", "#8fd16e", "#ffd04a", "#eef5e4"],
    },
  },
] as const;

export type PaletteId = (typeof palettes)[number]["id"];

export const defaultPalette: PaletteId = "classic";
