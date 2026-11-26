import { CheckCircle2, XCircle } from 'lucide-react';
import type { SlotCheckResult } from '@/lib/slotCheck';

interface Props {
  result: SlotCheckResult | null;
}

export function SlotResultBanner({ result }: Props) {
  if (result === null) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        Pick a start time and duration, then click "Check Availability".
      </div>
    );
  }

  if (result.available) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
        <div>
          <p className="font-semibold text-emerald-800">Available</p>
          <p className="text-sm text-emerald-700">{result.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
      <XCircle className="h-6 w-6 shrink-0 text-red-600" />
      <div>
        <p className="font-semibold text-red-800">Unavailable</p>
        <p className="text-sm text-red-700">{result.message}</p>
      </div>
    </div>
  );
}
