/**
 * Extra knowledge for scripts/i18n/extract.mjs.
 *
 * The extractor follows most `t(variable)` calls on its own: local and
 * imported consts, `.map()` / `.filter()` / `.find()` callbacks, functions
 * that return arrays, `useState` values and their setters, and template
 * literals built from consts. It only needs help where a value arrives from
 * outside the file (component props, the user's own profile). Each hint
 * below names, per file, the exact `t(...)` argument text and the exports
 * that hold every value it can take.
 *
 * When the extractor reports an `unresolved` call, add a hint here.
 */

/** Exports whose strings are always UI strings, even if no t() call reaches them yet. */
export const alwaysInclude = [
  // Label maps for habits, shown on cards and in the profile.
  "src/lib/discover/deck.ts#sleepLabel",
  "src/lib/discover/deck.ts#guestsLabel",
  "src/lib/discover/deck.ts#homeDaysLabel",
  "src/lib/discover/deck.ts#noiseLabel",
  "src/lib/discover/deck.ts#sharingLabel",
  "src/lib/discover/deck.ts#tidinessLabel",
  "src/lib/discover/deck.ts#socialLabel",
  // Choices offered in the profile editor.
  "src/lib/profile.ts#promptQuestions",
  "src/lib/profile.ts#hostPromptQuestions",
  "src/lib/profile.ts#languageOptions",
  "src/lib/profile.ts#interestOptions",
  "src/lib/profile.ts#profileSteps.label",
];

/** file -> { "t() argument text": ["file#export[.property]", ...] } */
export const hints = {
  "src/components/app/views/EditProfileView.tsx": {
    l: ["src/lib/profile.ts#languageOptions"],
    i: ["src/lib/profile.ts#interestOptions"],
    "pr.question": [
      "src/lib/profile.ts#promptQuestions",
      "src/lib/profile.ts#hostPromptQuestions",
    ],
  },
  "src/components/app/profile/ProfileDialogs.tsx": {
    i: ["src/lib/profile.ts#interestOptions"],
  },
  // Demo data (profile.languages / tags / prompts) only carries these values
  // when they come from the editor; free-form demo content stays as written.
  "src/lib/discover/sections.ts": {
    l: ["src/lib/profile.ts#languageOptions"],
    tag: ["src/lib/profile.ts#interestOptions"],
    "pr.question": [
      "src/lib/profile.ts#promptQuestions",
      "src/lib/profile.ts#hostPromptQuestions",
    ],
  },
  "src/components/app/views/DiscoverView.tsx": {
    "step.label": ["src/lib/profile.ts#profileSteps.label"],
  },
};

/** Files whose strings are demo content, never UI text. */
export const contentFiles = ["src/lib/data.ts", "src/lib/demo-people.ts"];
