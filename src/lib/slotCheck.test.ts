import { describe, it, expect } from 'vitest';
import { checkSlot, validateInput } from './slotCheck';
import { rooms } from './data';
import type { Booking } from './types';

const A101 = rooms.find((r) => r.id === 'A101')!;
const NOW = 600;

const snapshot = (bookings: Booking[]) =>
  JSON.stringify(bookings.map((b) => ({ id: b.id, start: b.start, end: b.end, title: b.title })));

describe('validateInput', () => {
  it('rejects malformed start times as INVALID_INPUT', () => {
    expect(validateInput('25:99', 60, NOW)).toBe('INVALID_INPUT');
  });
  it('rejects start times at or before now as PAST_START', () => {
    expect(validateInput('08:00', 30, NOW)).toBe('PAST_START');
    expect(validateInput('10:00', 30, NOW)).toBe('PAST_START');
  });
  it('rejects durations outside 1–120 as INVALID_DURATION', () => {
    expect(validateInput('13:00', 0, NOW)).toBe('INVALID_DURATION');
    expect(validateInput('13:00', 121, NOW)).toBe('INVALID_DURATION');
  });
  it('accepts valid future input', () => {
    expect(validateInput('13:00', 60, NOW)).toBeNull();
  });
});

describe('checkSlot (room A101, now = 600)', () => {
  it('T1: 13:00 + 60min is Available / OK', () => {
    const r = checkSlot({ start: 780, durationMin: 60, blocked: false }, A101.bookings, NOW);
    expect(r).toEqual({ available: true, reasonCode: 'OK', message: expect.any(String) });
  });

  it('T2: 11:30 + 60min is Unavailable / OVERLAP (b2)', () => {
    const r = checkSlot({ start: 690, durationMin: 60, blocked: false }, A101.bookings, NOW);
    expect(r.available).toBe(false);
    expect(r.reasonCode).toBe('OVERLAP');
  });

  it('T3: 13:00 + 60min blocked is Unavailable / BLOCKED', () => {
    const r = checkSlot({ start: 780, durationMin: 60, blocked: true }, A101.bookings, NOW);
    expect(r.available).toBe(false);
    expect(r.reasonCode).toBe('BLOCKED');
  });

  it('T4: 13:00 + 0min is a validation error / INVALID_DURATION', () => {
    const r = checkSlot({ start: 780, durationMin: 0, blocked: false }, A101.bookings, NOW);
    expect(r.available).toBe(false);
    expect(r.reasonCode).toBe('INVALID_DURATION');
  });

  it('T5: 18:00 + 121min is a validation error / INVALID_DURATION', () => {
    const r = checkSlot({ start: 1080, durationMin: 121, blocked: false }, A101.bookings, NOW);
    expect(r.available).toBe(false);
    expect(r.reasonCode).toBe('INVALID_DURATION');
  });

  it('T6: 08:00 + 30min is a validation error / PAST_START', () => {
    const r = checkSlot({ start: 480, durationMin: 30, blocked: false }, A101.bookings, NOW);
    expect(r.available).toBe(false);
    expect(r.reasonCode).toBe('PAST_START');
  });

  it('T7: 10:30 + 90min touches b1 end and b2 start — Available / OK', () => {
    const r = checkSlot({ start: 630, durationMin: 90, blocked: false }, A101.bookings, NOW);
    expect(r.available).toBe(true);
    expect(r.reasonCode).toBe('OK');
  });

  it('T8: does not mutate bookings', () => {
    const before = snapshot(A101.bookings);
    checkSlot({ start: 780, durationMin: 60, blocked: false }, A101.bookings, NOW);
    checkSlot({ start: 690, durationMin: 60, blocked: false }, A101.bookings, NOW);
    checkSlot({ start: 780, durationMin: 0, blocked: false }, A101.bookings, NOW);
    expect(snapshot(A101.bookings)).toBe(before);
    expect(A101.bookings).toHaveLength(3);
  });
});
