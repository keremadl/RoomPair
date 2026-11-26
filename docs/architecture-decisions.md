# RoomPair — Architecture & Product Decisions

This document explains the engineering and product trade-offs behind RoomPair's current MVP, why specific constraints are intentional at this stage, and how the architecture evolves from a university pilot to a production product.

---

## 1. Why Next.js for the MVP — and React Native (Expo) Next

### Why we built the MVP with Next.js
- **Zero-install validation:** Early user interviews, pilot testing, and jury reviews require instant access via a single URL (`roompair.vercel.app`) on both mobile browsers and desktops, without App Store / Play Store review cycles or TestFlight friction.
- **Single TypeScript stack:** One repository delivers the touch-first mobile layout, responsive desktop workspace, design-system showcase (`/design-system`), and server-side route handlers (`/api/translations`).
- **Fast iteration with high UI fidelity:** Next.js + CSS design tokens + Playwright E2E + the self-contained mobile lab (`npm run lab`) allowed rapid visual and UX iteration before locking into native mobile packaging.

### Planned mobile transition: React Native (Expo)
Once product-market fit is validated in the initial pilot cities, RoomPair will transition its primary user experience to **React Native (Expo)** in a monorepo (`packages/core` + `apps/web` + `apps/mobile`):
- **High code reuse (~40–50%):** Core domain logic is already written as framework-agnostic TypeScript — `src/lib/matching.ts`, `src/lib/types.ts`, `src/lib/backend/` (`mapping.ts`, `sync.ts`, `remote.ts`), `src/lib/locales/*.json`, and the unit test suite transfer directly into a shared package with zero rewrite.
- **Native capabilities where they matter:** Push notifications for matches and messages, native gesture physics (`react-native-reanimated` + `react-native-gesture-handler`), camera/photo permissions, and app-store distribution.
- **Single hiring and maintenance profile:** Staying in TypeScript across web, mobile, and edge/API code keeps velocity high for a small startup team.

### Why not Flutter?
Flutter was evaluated for its smooth rendering engine, but adopting Dart would require rewriting the entire domain, matching, backend-sync, and test layers from scratch and maintaining two separate language ecosystems (TypeScript for web/backend + Dart for mobile). For a lean startup with an existing TypeScript + React + Supabase codebase, Expo offers substantially higher leverage and lower risk.

---

## 2. Backend Strategy: Supabase Now, Staged Evolution Without Lock-In

RoomPair runs on **Supabase (PostgreSQL 17, Row Level Security, Auth, Storage, and Realtime)** and will continue on Supabase through pilot and early growth, following a three-phase evolution:

1. **Phase 1 — MVP & Pilot (0–10k users): Supabase as the core platform**
   - All security boundaries are enforced in PostgreSQL itself: Row Level Security across all `public` and `private` tables, column-level `SELECT`/`UPDATE` privileges, private Storage buckets with short-lived signed URLs, advisory-locked match/block triggers, and `SECURITY DEFINER` RPCs for sensitive operations (`set_birth_date`, `my_filter_preferences`, `my_blocks`, `mark_conversation_read`, `delete_account`, moderation).
   - Keeping authorization inside the database ensures the client can never bypass access rules regardless of whether requests come from Next.js today or React Native tomorrow.
2. **Phase 2 — Growth (10k–100k users): Hybrid Postgres + Edge Functions / Thin API**
   - Keep PostgreSQL/Supabase as the data and identity backbone while moving asynchronous and abuse-sensitive workflows into **Supabase Edge Functions** or a dedicated thin TypeScript API layer:
     - Server-side discovery pagination and filtered feed queries (replacing full-pool client fetches as the active user count grows beyond a few thousand per city).
     - Push notification dispatch (Expo Push / APNs / FCM).
     - University email verification and KYC webhook processing.
     - API rate limiting and anti-spam controls.
3. **Phase 3 — Scale (if economics or compliance require it): Full Portability**
   - RoomPair avoids proprietary NoSQL lock-in: every table, constraint, index, trigger, and policy is versioned as standard PostgreSQL SQL in `supabase/migrations/` and verified by `supabase/tests/policies.sql`. If scale or regional compliance ever demands a custom backend and managed/self-hosted PostgreSQL (e.g., AWS RDS / Neon), the data layer migrates cleanly without redesigning the schema.

---

## 3. Why Early Language Support Is Scoped to English & Turkish

RoomPair currently ships with **English (`en`)** and **Turkish (`tr`)** and intentionally defers adding more locales until the pilot expands:
- **Pilot focus and QA discipline:** International students arriving in Riga use English as their shared lingua franca, while Turkish provides a second complete, native-reviewed language to prove the entire i18n architecture end-to-end (including pluralization, placeholder safety, and layout resilience).
- **Avoiding premature translation drift:** In early-stage products, UI copy changes weekly. Maintaining 5–10 languages before product-market fit creates constant stale strings and review overhead without improving retention.
- **Built for zero-friction expansion:**
  - All UI strings are extracted statically via TypeScript AST (`npm run i18n:check`, 100% coverage enforced in CI).
  - Locale catalogs are static JSON bundles — switching languages never calls a paid translation API at runtime.
  - An offline **n8n translation pipeline** (`n8n/translation-workflow.json` and `automation/n8n/i18n-sync.workflow.json`) is already wired and validated, so adding Latvian (`lv`) or other pilot-city languages is a single CLI command (`npm run translate -- lv "Latviešu"`) followed by native review.

---

## 4. Why Student & Identity Verification (KYC) Is Deferred Post-MVP

- **Trust requires real verification, not a self-declared badge:** Enabling a "verify student email" button while email confirmation is turned off for prototype convenience would let anyone type a fake `.edu` address and appear verified — which is worse than having no badge at all.
- **Database already enforces the security boundary:** The `verified` column on `public.profiles` is excluded from `authenticated` `UPDATE` privileges at the PostgreSQL level and stripped from client writes. No user can self-verify via the UI or direct REST calls.
- **Production plan:** When real user onboarding opens, student verification will be backed by enforced email confirmation + university domain allowlisting (or SheerID/institutional SSO), followed by optional government-ID KYC via a specialized provider (e.g., Stripe Identity / Veriff) so RoomPair never stores raw ID documents.

---

## 5. Why a Dual-Mode Architecture (Browser Demo + Live Account Mode)

The same Next.js interface runs in two modes controlled solely by environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`):
- **Browser demo mode (no env vars):** Opens directly into Discover with 72 fictional profiles, simulated replies, and resettable `localStorage` state so reviewers, professors, and juries can test the complete product flow in 3 minutes with zero setup or credentials.
- **Live account mode (Supabase configured):** Switches the exact same UI to real authentication, PostgreSQL + RLS persistence, private Storage uploads, and Realtime matches/messages.

This dual-mode boundary is isolated cleanly behind `src/lib/app-data.ts` and `src/lib/backend/`, avoiding a throwaway "clickable prototype" that would have to be discarded when moving to real users.

---

## 6. Why Explainable Rule-Based Matching Instead of Black-Box AI

Choosing a roommate is a high-trust, high-consequence decision — unlike casual content feeds, users need to know **why** someone is a 92% match and what trade-offs to discuss before signing a lease.
- **Hard constraints first, transparent weights second:** `src/lib/matching.ts` filters out deal-breakers (city, budget/rent overlap, complementary intent, ±45-day move-in window, smoking/pet requirements, optional gender preference) before computing a deterministic weighted score (budget 25%, cleanliness 20%, sleep 15%, social 15%, move date 15%, stay length 10%).
- **Fairness by design:** Age, nationality, popularity, and like counts are explicitly excluded from ranking. Every card exposes its exact score breakdown and "differences to talk about" in the **Fit** tab.
- **When ML makes sense:** Predictive or collaborative-filtering models only add value once real-world cohabitation outcome data exists (e.g., mutual matches that convert to successful 6-month leases). Starting with an explainable, unit-tested rule engine avoids cold-start failure and opaque bias.

---

## 7. Security & Privacy (GDPR / KVKK) Production Readiness

### Already enforced in the MVP
- Strict PostgreSQL RLS on all `public` and `private` tables, verified by an automated SQL authorization test suite (`supabase/tests/policies.sql`).
- Column-level `SELECT`/`UPDATE` restrictions hiding private filter preferences (`wants_smoke_free`, `accepts_pets`, `wants_verified_only`, `living_with`), moderator audit fields (`reviewed_by`, `reviewed_at`), and server-owned flags (`verified`, `age`, `is_demo`).
- Private Storage buckets (`profile-photos`, `chat-photos`) with 5 MB limits, MIME allowlists, per-folder quotas, published-only visibility, and short-lived signed URLs.
- Adult-only (18+) date-of-birth verification stored in `private.birth_dates`, session-pinned atomic account deletion (`delete_account`) that removes Storage objects and `auth.users`, and `0` known `npm audit` vulnerabilities.

### Checklist before public user launch
- Enable **Leaked Password Protection** (requires Supabase Pro plan) and **Email Confirmation** in Supabase Auth.
- Add server-side rate limiting on Auth, messaging, reporting, and `/api/translations`.
- Complete the `/privacy` notice with formal GDPR/KVKK legal entity details, data controller contact, and retention schedules.
- Move demo seed accounts out of the production database (keeping them strictly in staging/preview environments) and add a dedicated internal moderator workflow.

---

## 8. Working Codename ("RoomPair")

*"RoomPair"* is an **early-stage working codename**, not the final brand name of the startup. Rather than spending pre-PMF time on naming, domain acquisition, and trademark clearance, the team adopted a descriptive internal codename to focus on user research, matching logic, UX, and security engineering. Because the name may overlap with existing registered trademarks or products, it should be treated strictly as a placeholder until final branding and legal clearance are completed before commercial launch.

---

## 9. Theme Exploration & Motion / Visual Polish Roadmap

- **Multiple color palettes are temporary (design-selection tool):** The 8 color palettes currently available in **Settings** (each verified in light and dark modes by `npm run check:design`) are included intentionally so the team and reviewers can evaluate visual directions inside the live product. Our current recommended direction is the green-forward **Meadow** palette (`meadow`). Once the final brand palette is locked in, the extra palettes will be removed so the production app ships with a single, cohesive visual identity (while keeping light/dark mode).
- **Minimal, reliable animations today — Lottie/Rive & SwiftUI-grade motion next:** Our MVP priority has been rock-solid infrastructure, deterministic matching, accessibility (`prefers-reduced-motion`), and database security rather than visual effects. Current animations are intentionally simple and predictable. In the upcoming polish and React Native (Expo) phase, we plan to introduce **Lottie / Rive** interactive animations (onboarding, match moments, empty states) alongside a **SwiftUI-inspired, interruptible spring-physics motion system** built on native gesture and animation primitives (`react-native-reanimated` + `react-native-gesture-handler`).

---

## 10. Performance Optimization Roadmap

Advanced performance engineering has been **intentionally deferred** until core architecture, security boundaries, and product-market fit are validated. The MVP maintains solid baseline hygiene (single-pass data mapping, bounded 15-minute signed-URL caching, covering foreign-key indexes, and zero-runtime-cost static locale catalogs), while deeper optimizations are scheduled for the growth phase:

- **Server-side discovery pagination & filtering:** Moving candidate ranking/filtering from client-side pool fetches to paginated SQL/RPC queries as city populations scale.
- **Image delivery & transcoding:** Adding CDN-backed responsive image transforms (WebP/AVIF resizing) and progressive loading instead of serving full-resolution uploads directly.
- **Rendering & bundle tuning:** Virtualizing long message/discovery lists, code-splitting non-critical dialogs, and profiling Postgres query plans (`EXPLAIN ANALYZE`) under realistic concurrent load.
