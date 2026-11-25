---
name: test-runner
description: Runs the unit tests for the stocky project (Vitest) and reports the results. Use when the user asks to run, check or re-run the tests, or to verify a change did not break anything. Optionally takes a file path or test name filter.
---

Run the unit tests for this project and report the outcome. Optional filter from the user: '$ARGUMENTS'

## How to run

Run from the `stocky` project directory (the folder that contains `package.json`):

- No filter: `npm test`
- With a filter (a file path or part of a test name): `npx vitest run $ARGUMENTS`

Notes about this project's setup:

- Tests are Vitest specs named `*.spec.ts`, kept in `__tests__` folders next to the code (`src/utils`, `src/stores`, `src/composables`, `src/components`). Shared test data is in `src/__tests__/fixtures.ts`.
- Firebase services are mocked, so no network, `.env.local` or dev server is needed.
- `vitest.config.ts` sets `pool: 'vmThreads'` on purpose. The default pools crash on Node 26 with Vitest 5 ("Cannot read properties of undefined (reading 'config')"). Do not remove it unless the user asks.
- Use `npm test` (single run). Do not use `npm run test:watch`, which never exits.

## Report

Start with the result in one line: number of test files and tests passed and failed, and the duration.

If everything passes, say so and stop.

If something fails:

1. List each failing test with its file and the assertion or error message.
2. Find the root cause by reading the failing test and the code it covers. Decide whether the code or the test is wrong.
3. Fix real bugs in the code. Only change a test when its expectation is wrong or outdated, and say why. Never delete, skip or loosen a test just to make it pass.
4. Re-run the same tests and confirm they pass, then run the full `npm test` once more to check nothing else broke.
5. Summarise what was wrong and what you changed.

Common causes in this project:

- A mock leaking between tests: use `vi.resetAllMocks()` (not `clearAllMocks`) in `beforeEach`.
- A test that depends on the current date: use `vi.useFakeTimers()` and `vi.setSystemTime(...)`.
- A changed prop, label or text in a component: update the matching component test.
- A new field on a type: update `src/__tests__/fixtures.ts`.

If the tests cannot start at all (for example a config or install error), report the exact error instead of guessing, and suggest `npm install` only if a package is missing.
