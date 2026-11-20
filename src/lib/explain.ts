import { minutesToHHMM } from './time';

export interface ExplainInput {
  roomId: string;
  start: number;
  end: number;
  available: boolean;
  reasons: string[];
}

export interface ExplainOutput {
  explanation: string;
}

export type ExplainFault = 'timeout' | 'api-failure' | 'invalid-output' | null;

const TIMEOUT_MS = 400;
const ARTIFICIAL_LATENCY_MS = 60;

export function isValidExplainInput(input: unknown): input is ExplainInput {
  if (typeof input !== 'object' || input === null) return false;
  const obj = input as Record<string, unknown>;
  return (
    typeof obj.roomId === 'string' &&
    typeof obj.start === 'number' &&
    Number.isFinite(obj.start) &&
    typeof obj.end === 'number' &&
    Number.isFinite(obj.end) &&
    typeof obj.available === 'boolean' &&
    Array.isArray(obj.reasons) &&
    obj.reasons.every((r) => typeof r === 'string' && r.length <= 500)
  );
}

export function isValidExplainOutput(output: unknown): output is ExplainOutput {
  if (typeof output !== 'object' || output === null) return false;
  const obj = output as Record<string, unknown>;
  return typeof obj.explanation === 'string' && obj.explanation.length > 0;
}

function buildExplanation(input: ExplainInput): ExplainOutput {
  const { roomId, start, end, available, reasons } = input;
  const slot = `${minutesToHHMM(start)}–${minutesToHHMM(end)}`;

  if (available) {
    return {
      explanation: `Room ${roomId} is free during ${slot}. No booking rules are violated, so you may proceed.`,
    };
  }

  const firstReason = reasons.length > 0 ? reasons[0] : 'an unspecified rule';
  const suffix =
    reasons.length > 1 ? ` (${reasons.length} issues found in total).` : '';

  return {
    explanation: `Room ${roomId} is unavailable for ${slot}: ${firstReason}${suffix}`,
  };
}

export function explainAvailability(
  rawInput: unknown,
  options: { fault?: ExplainFault; signal?: AbortSignal } = {},
): Promise<ExplainOutput> {
  const fault = options.fault ?? null;

  if (!isValidExplainInput(rawInput)) {
    return Promise.reject(new Error('Invalid explain input'));
  }

  // Simulated network latency.
  const latency =
    fault === 'timeout' ? TIMEOUT_MS * 3 : ARTIFICIAL_LATENCY_MS;

  return new Promise<ExplainOutput>((resolve, reject) => {
    const timer = setTimeout(() => {
      if (fault === 'timeout') {
        reject(new Error('Simulated timeout'));
        return;
      }
      if (fault === 'api-failure') {
        reject(new Error('Simulated API failure'));
        return;
      }
      if (fault === 'invalid-output') {
        // Deliberately malformed output to exercise output validation.
        reject(new Error('Invalid output'));
        return;
      }

      const produced: unknown = buildExplanation(rawInput);
      if (!isValidExplainOutput(produced)) {
        reject(new Error('Invalid output'));
        return;
      }
      resolve(produced);
    }, latency);

    if (options.signal) {
      options.signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
          reject(new Error('Aborted'));
        },
        { once: true },
      );
    }
  });
}

export const EXPLAIN_TIMEOUT_MS = TIMEOUT_MS;
