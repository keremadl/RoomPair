<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Design system (read before touching UI)

All UI is built from `src/design-system` — see `src/design-system/README.md` and the live page at `/design-system`.

- Import core components from `@/design-system`; don't hand-roll buttons, inputs, chips, cards, tabs.
- There are six design languages in `src/design-system/languages/<id>/`. Read that language's `README.md` before changing it. Style a language through its `theme.css` tokens (including component tokens) and its signature components, never by editing core components for one language.
- Profile details always use the Home / Person / Fit content model (`src/lib/discover/sections.ts`) and `ProfileDetails` (blocks or tabs). Never put facts about the place under Person or about the person under Home.
- Never write hex/rgb colors, px font sizes or px radii outside token files (`src/design-system/tokens.css`, `themes/*.css`, `languages/*/theme.css`, `languages/*/palette-*.css`). Use semantic tokens (`--color-*`, `--text-*`, `--space-*`, `--radius-*`, `--shadow-*`).
- Missing something? Add a token or component variant to the design system (and its showcase specimen) first, then use it.
- Do not reproduce another product's visual design (colors, layouts, assets). Research informs patterns only.
- Run `npm run typecheck && npm run check:design` before committing.
