import { describe, it, expect } from 'vitest';
import {
  explainAvailability,
  isValidExplainInput,
  isValidExplainOutput,
  EXPLAIN_TIMEOUT_MS,
  type ExplainInput,
} from './explain';
import type { CheckResult } from './availability';

const baseInput: ExplainInput = {
  roomId: 'A101',
  start: 660,
  end: 720,
  available: true,
  reasons: [],
};

const unavailableInput: ExplainInput = {
  roomId: 'B204',
  start: 600,
  end: 660,
  available: false,
  reasons: ['Overlaps existing booking "Existing" (10:00–11:00).'],
};

function withTimeout(ms: number): AbortSignal {
  return AbortSignal.timeout(ms);
}

describe('explainAvailability input validation', () => {
  it('accepts a well-formed input object', () => {
    expect(isValidExplainInput(baseInput)).toBe(true);
  });

  it('rejects null', () => {
    expect(isValidExplainInput(null)).toBe(false);
  });

  it('rejects missing roomId', () => {
    const { roomId: _omit, ...rest } = baseInput;
    void _omit;
    expect(isValidExplainInput(rest)).toBe(false);
  });

  it('rejects non-numeric start', () => {
    expect(isValidExplainInput({ ...baseInput, start: '660' })).toBe(false);
  });

  it('rejects non-boolean available flag', () => {
    expect(isValidExplainInput({ ...baseInput, available: 'yes' })).toBe(false);
  });

  it('rejects non-array reasons', () => {
    expect(isValidExplainInput({ ...baseInput, reasons: 'overlap' })).toBe(false);
  });

  it('rejects reasons containing non-strings', () => {
    expect(isValidExplainInput({ ...baseInput, reasons: [42] })).toBe(false);
  });

  it('rejects NaN start', () => {
    expect(isValidExplainInput({ ...baseInput, start: NaN })).toBe(false);
  });
});

describe('explainAvailability output validation', () => {
  it('accepts a non-empty explanation string', () => {
    expect(isValidExplainOutput({ explanation: 'ok' })).toBe(true);
  });

  it('rejects empty explanation', () => {
    expect(isValidExplainOutput({ explanation: '' })).toBe(false);
  });

  it('rejects missing explanation field', () => {
    expect(isValidExplainOutput({})).toBe(false);
  });

  it('rejects null', () => {
    expect(isValidExplainOutput(null)).toBe(false);
  });

  it('rejects non-string explanation', () => {
    expect(isValidExplainOutput({ explanation: 123 })).toBe(false);
  });
});

describe('explainAvailability happy path', () => {
  it('returns an explanation for an available slot', async () => {
    const out = await explainAvailability(baseInput, { fault: null });
    expect(out.explanation).toContain('A101');
    expect(out.explanation).toContain('11:00–12:00');
    expect(out.explanation).toContain('free');
  });

  it('returns an explanation citing the first reason for an unavailable slot', async () => {
    const out = await explainAvailability(unavailableInput, { fault: null });
    expect(out.explanation).toContain('B204');
    expect(out.explanation).toContain('Overlaps existing booking');
  });

  it('handles multiple reasons by noting the total count', async () => {
    const multi: ExplainInput = {
      roomId: 'C310',
      start: -30,
      end: 200,
      available: false,
      reasons: ['End time must be after start time.', 'Booking duration cannot exceed 120 minutes.'],
    };
    const out = await explainAvailability(multi, { fault: null });
    expect(out.explanation).toContain('2 issues found in total');
  });
});

describe('explainAvailability failure modes', () => {
  it('rejects on timeout fault', async () => {
    await expect(
      explainAvailability(baseInput, { fault: 'timeout' }),
    ).rejects.toThrow('Simulated timeout');
  });

  it('rejects on simulated API failure', async () => {
    await expect(
      explainAvailability(baseInput, { fault: 'api-failure' }),
    ).rejects.toThrow('Simulated API failure');
  });

  it('rejects on invalid-output fault', async () => {
    await expect(
      explainAvailability(baseInput, { fault: 'invalid-output' }),
    ).rejects.toThrow('Invalid output');
  });

  it('rejects invalid input synchronously', async () => {
    await expect(explainAvailability({ bad: true })).rejects.toThrow('Invalid explain input');
  });

  it('respects an AbortSignal', async () => {
    await expect(
      explainAvailability(baseInput, { fault: null, signal: withTimeout(1) }),
    ).rejects.toThrow();
  });

  it('rejects an oversized 10,000-character reason string', async () => {
    const oversizedReason = 'x'.repeat(10000);
    const oversized: ExplainInput = {
      roomId: 'A101',
      start: 660,
      end: 720,
      available: false,
      reasons: [oversizedReason],
    };
    await expect(
      explainAvailability(oversized, { fault: null }),
    ).rejects.toThrow();
  });

  it('exposes a sensible timeout constant', () => {
    expect(EXPLAIN_TIMEOUT_MS).toBeGreaterThan(0);
  });
});

describe('explainAvailability uses only provided facts', () => {
  it('does not reference fields outside ExplainInput', async () => {
    const minimal: ExplainInput = {
      roomId: 'D105',
      start: 700,
      end: 750,
      available: true,
      reasons: [],
    };
    const out = await explainAvailability(minimal, { fault: null });
    expect(out.explanation).toContain('D105');
    expect(out.explanation).toContain('11:40–12:30');
    // Must not invent reason text for an available slot.
    expect(out.explanation).not.toContain('Overlaps');
  });

  it('falls back to a generic phrase when reasons is empty but available is false', async () => {
    const weird: ExplainInput = {
      roomId: 'A101',
      start: 660,
      end: 720,
      available: false,
      reasons: [],
    };
    const out = await explainAvailability(weird, { fault: null });
    expect(out.explanation).toContain('unspecified rule');
  });
});

describe('explainAvailability compatibility with CheckResult', () => {
  it('accepts a CheckResult-derived input without extra fields', async () => {
    const checkResult: CheckResult = { available: true, reasons: [] };
    const input: ExplainInput = {
      roomId: 'A101',
      start: 660,
      end: 720,
      available: checkResult.available,
      reasons: checkResult.reasons,
    };
    const out = await explainAvailability(input, { fault: null });
    expect(isValidExplainOutput(out)).toBe(true);
  });
});
