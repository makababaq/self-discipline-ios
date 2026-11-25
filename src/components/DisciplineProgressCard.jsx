import { useMemo, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { parseLocalDate } from '../utils/dateAndCalc.js';
import { getDisciplineProgress } from '../utils/disciplineProgress.js';

function formatMonthDay(dateStr) {
  const date = parseLocalDate(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

const dotStyles = {
  full: 'bg-emerald-600',
  partial: 'bg-emerald-200',
  missed: 'bg-slate-200',
  future: 'border border-slate-200 bg-white'
};

export function DisciplineProgressCard({ data, targets, todayStr }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const { days, eligibleDays, rate, streak } = useMemo(
    () => getDisciplineProgress(data, targets, todayStr), [data, targets, todayStr]
  );
  const selected = days.find((day) => !day.isFuture && day.date === selectedDate);

  return (
    <section aria-labelledby="discipline-progress-title" className="space-y-3.5 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.025)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="discipline-progress-title" className="flex items-center gap-2 text-[14px] font-bold text-slate-900">
          <CalendarCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          自律打卡进度
        </h2>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 tabular-nums">
          第 {eligibleDays} / {days.length} 天
        </span>
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 rounded-xl bg-slate-50 px-3 py-2.5">
        <p className="text-[11px] font-medium text-slate-600">
          本周期完整达标率 <strong className="ml-1 text-sm font-bold text-emerald-700 tabular-nums">{rate}%</strong>
        </p>
        <p className="text-xs font-semibold text-slate-700 tabular-nums">连续 {streak} 天</p>
      </div>
      <ul aria-label="每日自律打卡" className="grid grid-cols-10 gap-x-1 gap-y-0.5">
        {days.map((day) => {
          const appearance = day.isFuture ? 'future' : day.completedCount === 3 ? 'full' : day.completedCount === 0 ? 'missed' : 'partial';
          const dayLabel = `${formatMonthDay(day.date)}，${day.isFuture ? '未到日期' : `${day.completedCount} 项达标`}`;
          return (
            <li key={day.date}>
              <button
                type="button"
                aria-label={dayLabel}
                aria-pressed={selected?.date === day.date}
                aria-current={day.isToday ? 'date' : undefined}
                disabled={day.isFuture}
                onClick={() => setSelectedDate(day.date)}
                className={`flex h-7 w-full items-center justify-center rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 ${
                  selected?.date === day.date ? 'bg-emerald-50' : 'enabled:hover:bg-slate-50'
                }`}
              >
                <span aria-hidden="true" className={`h-3.5 w-3.5 rounded-full ${dotStyles[appearance]} ${
                  day.isToday ? 'ring-2 ring-emerald-600 ring-offset-2' : ''
                }`} />
              </button>
            </li>
          );
        })}
      </ul>
      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-medium text-slate-500">
        {Object.entries({ full: '完整达标', partial: '部分达标', missed: '未达标', future: '未到日期' }).map(([status, label]) => (
          <li key={status} className="flex items-center gap-1.5">
            <span aria-hidden="true" className={`h-2 w-2 rounded-full ${dotStyles[status]}`} />{label}
          </li>
        ))}
      </ul>
      {(selected || !eligibleDays) && (
        <p aria-live="polite" className="text-[11px] font-semibold text-slate-600">
          {selected ? `${formatMonthDay(selected.date)} · 热量 ${selected.nutritionMet ? '✓' : '✗'} · 饮水 ${selected.hydrationMet ? '✓' : '✗'} · 训练 ${selected.trainingMet ? '✓' : '✗'}` : '周期开始后可查看每日打卡'}
        </p>
      )}
    </section>
  );
}
