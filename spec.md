# Stocky: Calorie Tracker Specification

Status: v1 implemented. Implementation notes: timestamps (`createdAt`, `lastUsedAt`) are stored as epoch-millisecond numbers rather than Firestore Timestamps; ESLint + Prettier are set up; Firebase config goes in `.env.local` (see `.env.example`) and `firestore.rules` must be deployed to your Firebase project.

## 1. Overview

Stocky is a mobile-first website (Vue 3 + TypeScript + Vite) for tracking daily calorie intake, in the style of MyFitnessPal. Users log in, then log food against four meals (Breakfast, Lunch, Dinner, Snacks). Foods are saved per user so they can be re-added on later days.

Backend: Firebase Authentication (email + password, Google) and Cloud Firestore.

## 2. Scope

### In v1
- Email + password signup, login, logout, password reset
- Google sign-in (popup, with redirect fallback when popups are blocked)
- Per-user food library: create, edit, delete, search
- Daily diary with Breakfast / Lunch / Dinner / Snacks
- Add food to a meal from the library, or create a new food inline
- Edit servings of, or delete, a diary entry
- Calories + macros (protein, carbs, fat) per food and per day
- Onboarding (gender, age, height, weight, activity level) that calculates a daily calorie goal, with a slider to compare weekly lose/gain rates (-2 to +2 lb/week)
- Daily calorie goal with remaining/progress display
- Navigate to previous/next day
- Planning ahead: food logged for a future day is saved as **planned** and does not count as eaten; on the day the user confirms it ("Ate it") to count it

### Out of scope for v1
- Public food database / barcode scanning
- Charts, weekly summaries, trends
- Offline support / PWA install
- Social features, exercise tracking, water tracking
- Micronutrients (fiber, sugar, sodium)

## 3. Tech Stack

| Concern | Choice |
|---|---|
| Framework | Vue 3 (`<script setup>`), TypeScript, Vite (existing) |
| Routing | Vue Router |
| State | Pinia |
| Backend | Firebase JS SDK (modular): Auth + Firestore |
| Styling | Plain CSS, mobile-first, CSS variables for theme |
| Config | `VITE_FIREBASE_*` env vars in `.env.local` (git-ignored) |

## 4. User Flows

### 4.1 Sign up
1. Open app while logged out -> redirected to `/login`.
2. Tap "Create account" -> `/signup`: email, password, confirm password.
3. On success -> create `users/{uid}` doc -> go to first-run goal setup (4.3).

### 4.2 Log in / out / reset
- Login: email + password -> Diary. Errors shown inline (wrong password, unknown user, network).
- Forgot password: enter email -> Firebase sends reset email -> confirmation message (always generic, to avoid revealing which emails exist).
- Logout: Settings -> "Log out" -> `/login`.

### 4.3 Onboarding (first run, or until completed)
Users whose profile has `onboardingCompleted` false are redirected to `/onboarding` by the router guard (including existing users).
1. **About you**: gender, age (18+), height (ft/in), weight (lb), activity level.
2. **Your daily calories**: BMR via Mifflin-St Jeor, times an activity factor = maintenance calories. A slider from -2 to +2 lb/week (0.5 steps) shows the daily calories live: target = maintenance + weeklyChange x 3500 / 7. Never below 1200 kcal (1500 for male); if raised to that floor, the screen explains the effective rate.
3. Confirm saves stats, weekly change and the calorie goal and marks onboarding complete. "Skip for now" completes onboarding keeping the default goal. Settings has "Recalculate goal from my details".

### 4.4 View the diary
- Diary opens on today.
- Header: date with prev/next arrows (tap date to jump back to today).
- Summary card: eaten / goal / remaining kcal, progress bar, and total protein/carbs/fat.
- Four meal sections, each with its entries and a meal subtotal. There are no per-meal add buttons; logging starts from the footer + button.

### 4.5 Log food
1. Tap the **+** button at the right of the footer (visible on Diary, My Foods and Settings) -> `/log`.
2. Search box with live autocomplete: matches appear as the user types, from the signed-in user's own foods only (data lives under `users/{uid}/foods`, and security rules block other users). Empty search shows recently used foods.
3. Tap a food -> details screen: number of servings (default 1), meal selector (Breakfast/Lunch/Dinner/Snacks, defaulting by time of day), live calorie/macro preview, **Log food** button.
4. The entry is saved to the day open in the diary and the user returns to the Diary.
5. If there is no exact match: "Create new food" (prefilled with the search text, see 4.6).

### 4.5a Planning ahead
- On a future day the summary card shows **Planned calorie intake** (planned vs goal) instead of Eaten; planned rows carry a Planned badge and the meal subtotal reads "X kcal planned". The log button reads **Plan food**.
- Planned food never counts towards eaten totals. On today (or a past day) each planned row shows **Ate it**; confirming sets status to eaten in the same meal section. Confirming a future day is refused.
- On a day with both, the summary counts only eaten food and notes how many kcal are still planned.

### 4.6 Create / edit a food
Form fields: name (required), serving size (number), serving unit (g, ml, piece, cup, tbsp, tsp, slice, serving), calories (required), protein, carbs, fat (default 0).
- From Add Food: after saving, the new food goes straight to the servings sheet.
- From My Foods: saving returns to the list.

### 4.7 Edit / delete a diary entry
Tap an entry -> change servings or move to another meal -> Save, or Delete (with confirmation).

### 4.8 Manage My Foods
List with search; tap to edit; delete with confirmation. Deleting a food does NOT remove past diary entries (they hold a nutrition snapshot).

### 4.9 Change calorie goal
Settings -> edit goal -> Save. Applies immediately to all days' "remaining" display.

## 5. Screens (mobile, 360px base)

Footer on Diary, My Foods and Settings: a full-width green **+ Log food** bar sits above the tab bar (**Diary | My Foods | Settings**) and opens Log food.

| Route | Screen | Key elements |
|---|---|---|
| `/login` | Login | Email, password, "Log in", links to signup and reset |
| `/signup` | Sign up | Email, password, confirm, "Create account" |
| `/reset` | Reset password | Email, "Send reset link" |
| `/onboarding` | Onboarding | Step 1 body details form; step 2 calorie slider and confirm |
| `/` | Diary | Date nav, summary card, 4 meal sections |
| `/log` | Log food | Autocomplete search of own foods, details step (servings, meal, preview, Log), "Create new food" |
| `/foods` | My Foods | Search, list, "+" button |
| `/foods/new`, `/foods/:id` | Food form | Fields from 4.6, Save, Delete (edit only) |
| `/entries/:id` | Edit entry | Servings stepper, meal selector, Save, Delete |
| `/settings` | Settings | Email shown, calorie goal, Log out |

Wireframe of Diary:

```
+---------------------------+
| <   Today, 24 Nov   >     |
| Goal 2000 | Eaten 1250    |
| [=========-------] 750 left|
| P 80g   C 140g   F 40g    |
+---------------------------+
| Breakfast          320    |
|  Oats, 1 serving   150    |
|  Banana, 1         105    |
| Lunch              ...    |
| Dinner             ...    |
| Snacks             ...    |
+---------------------------+
| [+ Log food]              |
| Diary | My Foods | Settings|
+---------------------------+
```

## 6. Data Model (Firestore)

```
users/{uid}
  email: string
  calorieGoal: number            // default 2000, set by onboarding
  onboardingCompleted: boolean
  stats?: { gender, age, heightIn, weightLb, activityLevel }
  weeklyChangeLb?: number        // negative = lose, positive = gain
  createdAt: timestamp

users/{uid}/foods/{foodId}
  name: string
  nameLower: string              // for search
  servingSize: number
  servingUnit: string
  calories: number               // per serving
  protein: number                // g per serving
  carbs: number
  fat: number
  lastUsedAt: timestamp | null   // for "recent" list
  createdAt: timestamp

users/{uid}/entries/{entryId}
  date: string                   // "YYYY-MM-DD", user's local date
  meal: "breakfast" | "lunch" | "dinner" | "snack"
  status: "eaten" | "planned"   // missing = eaten (older entries); future-day entries are saved as planned
  foodId: string | null          // reference, may point to a deleted food
  foodName: string               // snapshot
  servingSize: number            // snapshot
  servingUnit: string            // snapshot
  servings: number               // multiplier, > 0
  calories, protein, carbs, fat: number   // totals = per-serving snapshot * servings
  createdAt: timestamp
```

Rationale: entries store a snapshot so later edits or deletion of a food never change history.

## 7. Queries

- Diary for a day: `entries where date == D` (single-field, no composite index). Grouped by meal client-side.
- Food search: load the user's foods once (small collection), filter client-side by `nameLower.includes(query)`. Revisit if libraries grow past ~1000 items.
- Recent foods: sort by `lastUsedAt` desc, limit 20.

## 8. Security Rules (outline)

- Everything under `users/{uid}/**` is readable/writable only when `request.auth.uid == uid`.
- Validate on write: numeric fields are numbers >= 0, `servings > 0`, `meal` in the allowed set, `name` non-empty string under 100 chars.
- No access to other users' data; no public collections.

## 9. Auth & Routing

- Auth state listener starts at app boot; show a splash/loader until resolved to avoid login-page flicker.
- Route guards: unauthenticated -> `/login`; authenticated visiting `/login|/signup|/reset` -> `/`.
- Session persistence: Firebase default (local), so users stay logged in.
- Friendly mapping of Firebase error codes to messages.

## 10. Validation & Edge Cases

- Password minimum 6 characters (Firebase minimum); recommend 8 in UI hint.
- Numeric inputs: non-negative, max reasonable bounds (e.g. calories <= 10000), decimals allowed for servings.
- Duplicate food names: warn but allow.
- Empty states: no foods yet, no entries today, no search results.
- Loading and error states on every Firestore call; retry option.
- Dates use the user's local timezone, stored as `YYYY-MM-DD` strings; day rolls over at local midnight.
- Goal of 0 or empty: treated as "no goal" (hide progress bar).
- Over goal: remaining shown as negative / highlighted.
- Double-tap protection on Save buttons.

## 11. Non-functional

- Mobile-first: designed at 360px, scales up (centered max-width column on desktop).
- Touch targets >= 44px; number inputs use `inputmode="decimal"`.
- Accessible: labels on inputs, sufficient contrast, keyboard operable.
- Respect `prefers-color-scheme` (light/dark via CSS variables).
- No secrets in repo; Firebase web config goes in env vars (it is not a secret, but keeps environments separable).

## 12. Proposed Project Structure

```
src/
  main.ts
  App.vue
  router/index.ts
  services/                // all Firebase access lives here, nothing else imports firebase/*
    firebase.ts            // init app, auth, db
    authService.ts
    foodService.ts
    entryService.ts
    userService.ts
  stores/                  // Pinia setup stores; call services, hold state
    auth.ts
    foods.ts
    diary.ts
    settings.ts
  composables/             // reusable stateful logic (useDebouncedRef, useDateNav, ...)
  views/                   // route-level pages only; thin, compose components
  components/
    base/                  // generic UI, no app knowledge: BaseButton, BaseInput, BaseModal, BaseSheet, BaseSpinner, BaseEmptyState
    layout/                // AppShell, TabBar, PageHeader
    food/                  // FoodForm, FoodListItem, ServingsSheet
    diary/                 // MealSection, EntryRow, SummaryCard, DateNav
  types/                   // shared TS types (Food, Entry, Meal, UserProfile)
  utils/                   // pure functions: date.ts, nutrition.ts, firebaseErrors.ts
  assets/main.css          // CSS variables, resets, global base styles only
firestore.rules
```

The current create-vue demo components (`HelloWorld`, `TheWelcome`, etc.) will be removed.

## 13. Coding Standards (Vue)

### 13.1 Architecture and layering
Dependencies flow one way: `views -> components -> composables/stores -> services -> Firebase`.
- **Views** are route-level and thin: read route params, call stores, compose components. No Firebase calls, little markup of their own.
- **Components** render UI from props and emit events. They never call Firebase directly.
- **Stores (Pinia)** own app state and orchestrate services. Use setup-store syntax (`defineStore('x', () => {...})`).
- **Services** are the only code that imports `firebase/*`. They return plain typed data (convert Firestore timestamps and snapshots at this boundary).
- **Utils** are pure, framework-free functions and are unit-testable.

### 13.2 Component rules
- Always `<script setup lang="ts">` with the Composition API. No Options API, no mixins.
- Block order in every SFC: `<script setup>`, `<template>`, `<style scoped>`.
- One component per file. File names are PascalCase (`MealSection.vue`).
- **Extract a component when** the markup is used in 2+ places, OR it has its own state/behavior, OR a template section exceeds roughly 50 lines or has a clear single purpose. Prefer extracting early over copy-pasting.
- **Base components** (`components/base/`) are prefixed `Base`, are generic, and know nothing about foods, diary or Firebase. Feature components live in a feature folder (`food/`, `diary/`).
- Single-instance layout components use the `The` prefix (`TheTabBar`) if only ever rendered once; multi-word names always (no `Card.vue`).
- Keep components small and focused; if a component needs more than ~5 props or does two jobs, split it.

### 13.3 Props, emits, slots
- Type props with `defineProps<{...}>()` and defaults via `withDefaults`. Never mutate props.
- Type emits with `defineEmits<{ (e: 'save', value: Food): void }>()`; event names are kebab-case in templates.
- Use `v-model` via `defineModel()` for two-way binding on form-like components.
- Use slots for flexible content instead of many boolean/config props.
- Props down, events up. No reaching into child internals, no `$parent`.

### 13.4 Reactivity and state
- Prefer `ref` for primitives and `reactive` sparingly; use `computed` for derived values (never recompute in templates or watchers).
- Use `watch` only for side effects; avoid watchers that just sync state.
- Local UI state stays in the component; shared or persisted state goes in a store. Do not put everything in a store.
- Extract reusable stateful logic into `composables/` named `useXxx`, returning refs and functions. Clean up listeners (`onUnmounted`, Firestore `unsubscribe`).
- Use `storeToRefs` when destructuring store state.

### 13.5 TypeScript
- `strict` on; no `any` (use `unknown` and narrow). Shared domain types live in `src/types/`.
- Type all props, emits, store state, and service return values. Avoid non-null `!` assertions.
- Use `import type` for type-only imports. Use the `@/` alias instead of long relative paths.

### 13.6 Naming and files
- Components `PascalCase.vue`; composables `useCamelCase.ts`; stores `camelCase.ts` exporting `useXxxStore`; utils/services `camelCase.ts`; types `PascalCase`.
- Constants `UPPER_SNAKE_CASE`; booleans read as `isX`, `hasX`, `canX`.
- Prefer named exports for utils/services/composables.

### 13.7 Template rules
- Always `:key` on `v-for` with a stable id (never the index for mutable lists). Never combine `v-if` and `v-for` on one element.
- Keep template expressions simple; move logic to `computed` or functions.
- Use semantic HTML (`button`, `label`, `form`, `nav`, `ul`) and associate every input with a `<label>`.

### 13.8 Styling
- `<style scoped>` per component; global CSS limited to `assets/main.css` (variables, reset, base).
- Colors, spacing, radii, and font sizes come from CSS variables; no magic numbers or hard-coded colors in components.
- Mobile-first: base styles target 360px, enhance with `min-width` media queries.
- Class names are descriptive kebab-case; no inline styles except for truly dynamic values.

### 13.9 Error handling, async, and quality
- Every async call has loading and error state surfaced to the user; map Firebase error codes in `utils/firebaseErrors.ts`. Never swallow errors silently.
- Use `async/await` with `try/catch/finally`; disable submit buttons while pending.
- No `console.log` left in committed code. No dead code or commented-out blocks.
- Validate user input at the form and again in security rules.
- Lazy-load route views (`() => import(...)`).
- Keep Firebase config in `VITE_*` env vars; never hard-code.
- Before finishing any change run `npm run type-check` and `npm run build`.

### 13.10 Tooling (to add during milestone 1)
ESLint (`eslint-plugin-vue` recommended + TypeScript rules) and Prettier, so these rules are enforced automatically. Vitest for utils/stores/key components can be added when logic grows.

## 14. Milestones

1. Firebase project setup, SDK init, env config, router + Pinia, app shell and tab bar
2. Auth: signup, login, logout, reset, route guards
3. Foods: My Foods list, create/edit/delete, search
4. Diary: date nav, add food to meal, servings sheet, edit/delete entry
5. Summary card, calorie goal, goal setup and Settings
6. Security rules, validation, empty/error states, polish and responsive check

Milestone 1 also adds ESLint + Prettier (13.10).

## 15. Assumptions / Open Questions

- Calories are in kcal only; metric/imperial units are per-food free choice, no conversion.
- One calorie goal for all days (no per-day goals).
- A food belongs to a single user; there is no sharing.
- Do you want email verification enforced before use? (Assumed: not in v1.)
- Do you already have a Firebase project, or should setup steps be included? (Assumed: you will create it and provide config values.)
- Hosting: Firebase Hosting assumed for deployment, not in v1 scope to configure.
