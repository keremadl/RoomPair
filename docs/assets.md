# Asset sources

All images, illustrations, fonts and icons are bundled locally so the application runs offline without third-party asset requests. All demo people, names, biographies, student badges and Riga room listings are fictional presentation data and do not depict actual RoomPair members or available properties.

## Demo portraits and rooms (`public/images/`)

- **72 fictional people** (`<name>-1.jpg`, `<name>-2.jpg`, plus `<name>-1.jpg` for the demo viewer profile `alex-1.jpg`) and **32 shared-flat room sets** (`<name>-room-1.jpg` … `<name>-room-3.jpg`), built from curated royalty-free stock photography (Pexels / Unsplash) and synthetic demo imagery generated specifically for the presentation (`scripts/demo/`).
- In authenticated account mode (`NEXT_PUBLIC_SUPABASE_*`), member-uploaded profile and chat photos are stored privately in Supabase Storage buckets (`profile-photos`, `chat-photos`) and served only via short-lived signed URLs.

## Setup illustrations (`public/images/onboarding/`)

- **25 custom sticker illustrations** (`<question>.{base,ink,primary,accent}.webp`) created for the RoomPair setup flow (`docs/onboarding-illustrations/`).
- Each source illustration (`docs/onboarding-illustrations/source/*.webp`) is split into four WebP layers by `scripts/illustrations/split.py` so outlines and primary/accent fills dynamically adapt to all 8 colour palettes in both light and dark modes.

## Typography

- **Rubik** (`src/design-system/languages/fonts.ts`, loaded via `next/font/google` and shimmed in `lab/next-font-shim.ts`) is the primary typeface of the **F · Card** design language (SIL Open Font License).
- **DM Sans** and **Manrope** (`public/fonts/`) are self-hosted fallback/base fonts under the SIL Open Font License; full license texts are included in `public/fonts/DM-Sans-LICENSE.txt` and `public/fonts/Manrope-LICENSE.txt`.

## Icons and brand

- **Icons** (`src/design-system/icons/`): RoomPair's own custom hand-drawn 24×24 SVG icon set, built specifically for the Card design language with zero external icon-library dependencies.
- **Brand mark** (`src/components/app/Brand.tsx`, `public/icon.svg`): created in code for RoomPair.
- Competitor screenshots studied in `docs/interface-research.md` and `docs/onboarding-illustrations/reference/` were used strictly for UX pattern research and are never embedded in the product.

## Licenses

- Pexels license: https://www.pexels.com/license/
- Unsplash license: https://unsplash.com/license/
- Rubik (SIL OFL): https://github.com/googlefonts/rubik
- DM Sans (SIL OFL): https://github.com/google/fonts/tree/main/ofl/dmsans
- Manrope (SIL OFL): https://github.com/google/fonts/tree/main/ofl/manrope
