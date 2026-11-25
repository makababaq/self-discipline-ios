import { ChevronRight } from 'lucide-react';

export function PickerField({ label, value, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-description={value}
      aria-haspopup="dialog"
      onClick={onClick}
      className="flex min-w-0 items-center justify-between gap-1 rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-left transition active:scale-[0.98]"
    >
      <span className="min-w-0">
        <span className="block text-[11px] font-medium text-slate-500">{label}</span>
        <span className="block font-bold tabular-nums text-slate-900 text-sm">{value}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
    </button>
  );
}
