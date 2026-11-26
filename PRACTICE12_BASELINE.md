# Practice #12 — Task #01: Frozen Baseline

## Version
- Project: Bolt.new export `project-bolt-github-wdm89jyq` (Vite + React + TypeScript)
- State: end of Practice #11 (includes optional explanation feature — not required for #12)
- Date frozen: 2026-11-26
- Not under git yet (will be pushed to a public repo for submission)

## Simulated current time
`CURRENT_TIME_MIN = 600` → **10:00** (fixed, in `src/App.tsx`)

## Booking data used for Practice #12 (one fictional room)
Room **A101 — Lecture Hall A** (blocked = false)

| ID | Start | End   | Title                |
|----|-------|-------|----------------------|
| b1 | 09:00 | 10:30 | Data Structures 101  |
| b2 | 12:00 | 13:00 | Faculty Meeting      |
| b3 | 15:00 | 17:00 | Robotics Workshop    |

(The full fixture still has 4 rooms / 8 bookings; Practice #12 tests use A101 only,
with the "blocked" flag as an input toggle.)

## Expected behaviour (rules — NOT changed for #12)
Validation order in `checkAvailability(room, start, end, currentTime)`:
1. Interval valid (0 ≤ start < end ≤ 1440), else error
2. Start must be after current time (10:00), else error
3. Duration ≤ 120 min, else error
4. Blocked room → Unavailable
5. Overlap check (strict: touching endpoints allowed)
6. Bookings are never mutated

## Existing checks
| Command | Expected | Observed |
|---|---|---|
| `npm test` | availability.test.ts (23) + explain.test.ts (26) pass | _fill in from Bolt terminal_ |
| `npm run typecheck` | no errors | _fill in_ |
| `npm run build` | build succeeds | _fill in_ |

## Baseline screenshots
- `screenshots/01_baseline_ui.png` — app running
- `screenshots/02_baseline_tests.png` — `npm test` output