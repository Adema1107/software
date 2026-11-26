# Practice #12 — Task #02: Common Contract (shared by code-based and low-code)

## User story
As a student, I want to choose a future start time and a duration for the fictional
campus room A101, so that I can see whether the room is available and, if not, why —
without changing any existing booking.

## Acceptance criteria (identical for both solutions)
- **AC1:** Start time must be in the future (after the simulated current time 10:00).
- **AC2:** Duration must be greater than 0 and at most 120 minutes.
- **AC3:** An interval that overlaps an existing booking is Unavailable
  (touching endpoints, e.g. 10:30 after a booking ending 10:30, is NOT an overlap).
- **AC4:** If the room is blocked, the result is Unavailable.
- **AC5:** A clear decision is displayed and existing bookings are never changed.
- **AC6:** Invalid input receives understandable feedback (no crash, no silent failure).

## Inputs
| Input | Type | Rule |
|---|---|---|
| `startTime` | HH:MM (same day) | must be > 10:00 (simulated now) |
| `durationMin` | integer minutes | 1 … 120 |
| `blocked` | boolean | room status toggle |
| `bookings` | fixed fictional list | read-only |

Simulated current time: **10:00** (fixed, so tests are reproducible).
`end = start + durationMin`

### Fictional bookings — room A101
| ID | Start | End | Title |
|---|---|---|---|
| b1 | 09:00 | 10:30 | Data Structures 101 |
| b2 | 12:00 | 13:00 | Faculty Meeting |
| b3 | 15:00 | 17:00 | Robotics Workshop |

## Outputs
| Output | Values |
|---|---|
| `available` | `true` / `false` |
| `reasonCode` | `OK`, `PAST_START`, `INVALID_DURATION`, `INVALID_INPUT`, `BLOCKED`, `OVERLAP` |
| `message` | human-readable text shown on screen |

Evaluation order: INVALID_INPUT → PAST_START → INVALID_DURATION → BLOCKED → OVERLAP → OK.
Overlap rule: `start < booking.end AND booking.start < end` (strict).

## Common test set (prepared before implementation)
| ID | Start | Duration | Blocked | Expected available | Expected reasonCode | AC |
|---|---|---|---|---|---|---|
| T1 | 13:00 | 60 | no | true (Available) | OK | AC3, AC5 |
| T2 | 11:30 | 60 | no | false (Unavailable) | OVERLAP (with b2) | AC3 |
| T3 | 13:00 | 60 | yes | false (Unavailable) | BLOCKED | AC4 |
| T4 | 13:00 | 0 | no | validation error | INVALID_DURATION | AC2, AC6 |
| T5 | 18:00 | 121 | no | validation error | INVALID_DURATION | AC2, AC6 |
| T6 | 08:00 | 30 | no | validation error | PAST_START | AC1, AC6 |
| T7 | 10:30 | 90 | no | true (Available) — touches b1 end and b2 start | OK | AC3 |
| T8 | after T1–T7 | — | — | A101 still has exactly b1, b2, b3 with same times | — | AC5 |

## Test results (fill in during Task #05)
| ID | Expected | Code-based observed | Pass? | Low-code observed | Pass? |
|---|---|---|---|---|---|
| T1 | Available / OK | | | | |
| T2 | Unavailable / OVERLAP | | | | |
| T3 | Unavailable / BLOCKED | | | | |
| T4 | Error / INVALID_DURATION | | | | |
| T5 | Error / INVALID_DURATION | | | | |
| T6 | Error / PAST_START | | | | |
| T7 | Available / OK | | | | |
| T8 | Bookings unchanged | | | | |
| **Total** | | | **_/8** | | **_/8** |