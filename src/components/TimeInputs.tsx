import { Clock } from 'lucide-react';

interface Props {
  startTime: string;
  durationMin: string;
  blocked: boolean;
  currentTimeLabel: string;
  onChangeStart: (val: string) => void;
  onChangeDuration: (val: string) => void;
  onChangeBlocked: (val: boolean) => void;
}

export function TimeInputs({
  startTime,
  durationMin,
  blocked,
  currentTimeLabel,
  onChangeStart,
  onChangeDuration,
  onChangeBlocked,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Clock className="h-4 w-4" />
        Current campus time: <span className="font-semibold text-slate-700">{currentTimeLabel}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Start time</span>
          <input
            type="time"
            value={startTime}
            onChange={(e) => onChangeStart(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Duration (min)</span>
          <input
            type="number"
            min={1}
            max={120}
            value={durationMin}
            onChange={(e) => onChangeDuration(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
          />
        </label>
      </div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={blocked}
          onChange={(e) => onChangeBlocked(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-2 focus:ring-sky-200"
        />
        <span className="text-sm font-medium text-slate-700">Room blocked</span>
      </label>
    </div>
  );
}
