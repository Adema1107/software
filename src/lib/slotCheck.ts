import { minutesToHHMM } from './time';
import type { Booking } from './types';

export type ReasonCode =
  | 'OK'
  | 'PAST_START'
  | 'INVALID_DURATION'
  | 'INVALID_INPUT'
  | 'BLOCKED'
  | 'OVERLAP';

export interface SlotCheckResult {
  available: boolean;
  reasonCode: ReasonCode;
  message: string;
}

const MIN_DURATION = 1;
const MAX_DURATION = 120;

/**
 * Validates raw slot input. Returns a reasonCode for the first invalid aspect
 * (evaluation order: INVALID_INPUT, PAST_START, INVALID_DURATION) or null.
 */
export function validateInput(
  startHHMM: string,
  durationMin: number,
  now: number,
): ReasonCode | null {
  if (!/^\d{1,2}:\d{2}$/.test(startHHMM)) return 'INVALID_INPUT';
  const start = hhmmToMinutesStrict(startHHMM);
  if (start === null) return 'INVALID_INPUT';
  if (!Number.isFinite(durationMin)) return 'INVALID_INPUT';
  if (start <= now) return 'PAST_START';
  if (durationMin < MIN_DURATION || durationMin > MAX_DURATION || !Number.isInteger(durationMin)) {
    return 'INVALID_DURATION';
  }
  return null;
}

function hhmmToMinutesStrict(hhmm: string): number | null {
  const [hStr, mStr] = hhmm.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

export function checkSlot(
  slot: { start: number; durationMin: number; blocked: boolean },
  bookings: Booking[],
  now: number,
): SlotCheckResult {
  const invalid = validateInput(`${Math.floor(slot.start / 60)}:${String(slot.start % 60).padStart(2, '0')}`, slot.durationMin, now);
  if (invalid === 'INVALID_INPUT' || invalid === 'PAST_START' || invalid === 'INVALID_DURATION') {
    return { available: false, reasonCode: invalid, message: reasonMessage(invalid) };
  }

  const end = slot.start + slot.durationMin;

  if (slot.blocked) {
    return { available: false, reasonCode: 'BLOCKED', message: reasonMessage('BLOCKED') };
  }

  for (const b of bookings) {
    if (slot.start < b.end && b.start < end) {
      return {
        available: false,
        reasonCode: 'OVERLAP',
        message: `Overlaps existing booking "${b.title}" (${minutesToHHMM(b.start)}–${minutesToHHMM(b.end)}).`,
      };
    }
  }

  return {
    available: true,
    reasonCode: 'OK',
    message: `Room is free from ${minutesToHHMM(slot.start)} to ${minutesToHHMM(end)}.`,
  };
}

function reasonMessage(code: ReasonCode): string {
  switch (code) {
    case 'INVALID_INPUT':
      return 'Invalid time format. Use HH:MM.';
    case 'PAST_START':
      return 'Start time must be after the current campus time.';
    case 'INVALID_DURATION':
      return 'Duration must be between 1 and 120 minutes.';
    case 'BLOCKED':
      return 'This room is currently blocked and unavailable for booking.';
    default:
      return '';
  }
}
