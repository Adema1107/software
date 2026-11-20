import { useState } from 'react';
import { Lightbulb, Loader2, AlertTriangle } from 'lucide-react';
import {
  explainAvailability,
  EXPLAIN_TIMEOUT_MS,
  type ExplainInput,
} from '@/lib/explain';

interface Props {
  input: ExplainInput;
  disabled: boolean;
}

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ok'; text: string }
  | { kind: 'error' };

export function ExplanationPanel({ input, disabled }: Props) {
  const [state, setState] = useState<State>({ kind: 'idle' });

  const handleExplain = async () => {
    setState({ kind: 'loading' });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), EXPLAIN_TIMEOUT_MS + 250);
    try {
      const out = await explainAvailability(input, { fault: 'api-failure', signal: controller.signal });
      setState({ kind: 'ok', text: out.explanation });
    } catch {
      setState({ kind: 'error' });
    } finally {
      clearTimeout(timeout);
    }
  };

  const canClick = !disabled && state.kind !== 'loading';

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleExplain}
        disabled={!canClick}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {state.kind === 'loading' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Lightbulb className="h-4 w-4" />
        )}
        Explain availability
      </button>

      {state.kind === 'ok' && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
          <p className="text-sm text-sky-800">{state.text}</p>
        </div>
      )}

      {state.kind === 'error' && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800">Explanation is currently unavailable.</p>
        </div>
      )}
    </div>
  );
}
