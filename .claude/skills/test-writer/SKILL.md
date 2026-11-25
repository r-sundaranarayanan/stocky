---
name: test-writer
description: Writes unit tests for the stocky project (Vitest + Vue Test Utils) following the project's existing test conventions. Use when the user asks to add, write or improve tests for a file, component, store, composable or util, or after a feature or bug fix that has no tests yet. Takes a file path, feature name or description of what to cover.
---

Write unit tests for: '$ARGUMENTS'

If no target was given, use the files changed in the current work (check `git status` / `git diff`) that have no tests yet.

## Before writing

1. Read the code under test completely, and read one or two existing specs of the same kind to copy their style:
   - utils: `src/utils/__tests__/calories.spec.ts`
   - stores: `src/stores/__tests__/diary.spec.ts`, `diaryPlanning.spec.ts`
   - composables: `src/composables/__tests__/useAsyncAction.spec.ts`
   - components: `src/components/__tests__/diary.spec.ts`, `food.spec.ts`, `onboarding.spec.ts`
2. Check whether tests already exist for the target (`Glob` for `*.spec.ts`). Extend them or add a new spec next to them. Do not duplicate existing cases.
3. Decide behaviours to test from the code and the spec (`spec.md`), not from guesses.

## Where files go

- Specs live in an `__tests__` folder next to the code and are named `<thing>.spec.ts`, for example `src/utils/__tests__/date.spec.ts`.
- Component specs are grouped by feature folder in `src/components/__tests__/` (`base.spec.ts`, `diary.spec.ts`, `food.spec.ts`, ...). Add to the matching file, or create `<feature>.spec.ts` for a new area.
- Reuse the factories in `src/__tests__/fixtures.ts` (`makeFood`, `makeEntry`, `makeStats`). When a type gets a new field, update the fixtures first.
- Import from `vitest` explicitly (`describe`, `it`, `expect`, `vi`); globals are not enabled. Use the `@/` alias for imports from `src`, and relative paths (`../date`) for the file under test.

## What to cover

- The normal case, then edge cases: empty input, zero, boundaries (for example age 18 vs 17, the 1200 kcal floor), rounding, invalid values.
- Error paths: the service rejects, state is unchanged, an error message is shown.
- For components: what the user sees (text, labels, roles, disabled state) and the events they emit (`wrapper.emitted(...)`). Do not test implementation details such as internal refs or CSS class names unless the class is the behaviour.
- For stores: the state after each action and which service call was made with which arguments.
- One behaviour per test, with a name that reads like a sentence ("refuses to confirm food planned for a future day").

## Project rules for tests

- Mock services, never call Firebase. Use a factory mock so the real module (which initialises Firebase) is never loaded:
  ```ts
  vi.mock('@/services/foodService', () => ({ listFoods: vi.fn(), createFood: vi.fn() }))
  const service = vi.mocked(foodService)
  ```
- Stores: `setActivePinia(createPinia())` in `beforeEach`.
- Call `vi.resetAllMocks()` (not `clearAllMocks`) in `beforeEach`; otherwise `mockRejectedValue` leaks into later tests.
- Dates and time: never depend on the real clock. Use `vi.useFakeTimers()` with `vi.setSystemTime(new Date(2026, 10, 24, 12))` and restore with `vi.useRealTimers()` in `afterEach`.
- Components: `mount` from `@vue/test-utils`; stub the router with `global: { stubs: { RouterLink: RouterLinkStub } }`. Do not mount whole views that need Firebase or the real router; test the components and stores they use.
- Async: `await` every `setValue`, `trigger` and store action.
- No `any`, no `console.log`, no `.only` or `.skip`, no unused variables (lint is strict). Keep the code Prettier-formatted.
- `vitest.config.ts` pins `pool: 'vmThreads'` on purpose (default pools crash on Node 26 with Vitest 5). Do not change it.

## After writing

1. Run the new spec: `npx vitest run <path-to-spec>`. Fix failures. A failure can mean a real bug in the code: if the test is right and the code is wrong, tell the user and fix the code only if they asked for bug fixes; otherwise report it.
2. Check the tests can fail: pick one key assertion and confirm it would catch a plausible mistake (for example change the expected value in your head or temporarily). Do not leave tests that always pass.
3. Run the full checks: `npm test`, `npm run type-check` and `npx eslint .` (run `npx prettier --write` on the new files). All must pass.
4. Report: the spec files added or changed, how many tests were added, what behaviour they cover, anything you deliberately did not cover and why, and any bug you found.
