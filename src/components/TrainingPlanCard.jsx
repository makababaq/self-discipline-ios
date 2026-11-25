import { useState } from 'react';
import { ArrowDown, ArrowUp, ChevronRight, Dumbbell, Plus, RotateCcw } from 'lucide-react';
import { uid } from '../utils/dateAndCalc.js';
import { haptic } from '../utils/haptics.js';
import { getTrainingSchedule, offsetForTrainingDay, TRAINING_PARTS } from '../utils/trainingPlan.js';
import { BottomSheet } from './CommonUI.jsx';
import { WheelPickerSheet } from './WheelPickerSheet.jsx';

function TrainingDayEditor({ day, index, dayCount, onSave, onDelete, onClose }) {
  const [parts, setParts] = useState(day.parts);
  const [position, setPosition] = useState(index);
  const availableParts = [...new Set([...TRAINING_PARTS, ...day.parts])];

  function togglePart(part) {
    if (part === '休息') {
      if (parts.length === 1 && parts[0] === '休息') return;
      setParts(['休息']);
      void haptic.tap();
      return;
    }

    setParts((previous) => {
      const selected = new Set(previous);
      selected.delete('休息');
      if (selected.has(part)) selected.delete(part);
      else selected.add(part);
      return selected.size ? [...selected] : ['休息'];
    });
    void haptic.tap();
  }

  return (
    <BottomSheet open onClose={onClose} title={onDelete ? `编辑第 ${index + 1} 天` : '添加一天'}>
      <div className="space-y-4">
        <fieldset>
          <legend className="mb-2 text-xs font-semibold text-slate-600">训练部位</legend>
          <div className="flex flex-wrap gap-2">
            {availableParts.map((part) => (
              <button
                key={part}
                type="button"
                aria-pressed={parts.includes(part)}
                onClick={() => togglePart(part)}
                className={`rounded-full border px-3.5 py-2 text-xs font-bold transition active:scale-95 ${
                  parts.includes(part)
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                {part}
              </button>
            ))}
          </div>
        </fieldset>

        {dayCount > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
            <div>
              <p className="text-[11px] font-semibold text-slate-500">循环位置</p>
              <p className="text-xs font-bold text-slate-900 tabular-nums">第 {position + 1} 天</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button" aria-label="上移一天" title="上移一天"
                disabled={position === 0} onClick={() => setPosition((current) => current - 1)}
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition active:scale-95 disabled:opacity-40"
              >
                <ArrowUp className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button" aria-label="下移一天" title="下移一天"
                disabled={position === dayCount - 1} onClick={() => setPosition((current) => current + 1)}
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition active:scale-95 disabled:opacity-40"
              >
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => onSave(parts, position)}
          className="w-full rounded-xl bg-slate-900 px-3 py-3 text-sm font-bold text-white shadow-sm transition active:scale-[0.98]"
        >
          保存设置
        </button>
        {onDelete && (
          <button
            type="button"
            disabled={dayCount === 1}
            onClick={onDelete}
            className="w-full rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-bold text-rose-600 transition active:scale-[0.98] disabled:opacity-40"
          >
            删除这一天
          </button>
        )}
      </div>
    </BottomSheet>
  );
}

export function TrainingPlanCard({ trainingPlan, cycleStartDate, todayStr, onUpdateTrainingPlan }) {
  const [editor, setEditor] = useState(null);
  const [calibrating, setCalibrating] = useState(false);
  const { days } = trainingPlan;
  const { index: todayIndex, day: today, daysUntilStart } = getTrainingSchedule(trainingPlan, cycleStartDate, todayStr);
  const newDay = editor?.newDay;
  const editingIndex = newDay ? days.length : days.findIndex((day) => day.id === editor?.id);
  const editingDay = newDay ?? days[editingIndex];

  function addDay() {
    setEditor({ newDay: { id: uid('plan'), parts: ['休息'] } });
  }

  function saveDay(parts, position) {
    onUpdateTrainingPlan((previous) => {
      const nextDays = [...previous.days];
      let day = newDay;
      if (!day) {
        const from = nextDays.findIndex((item) => item.id === editor.id);
        if (from === -1) return previous;
        [day] = nextDays.splice(from, 1);
      }
      nextDays.splice(position, 0, { ...day, parts });
      return { ...previous, days: nextDays };
    });
    setEditor(null);
  }

  function deleteDay() {
    onUpdateTrainingPlan((previous) => {
      if (previous.days.length <= 1) return previous;
      return { ...previous, days: previous.days.filter((day) => day.id !== editor.id) };
    });
    setEditor(null);
  }

  function calibrateToday({ index }) {
    onUpdateTrainingPlan((previous) => ({
      ...previous,
      offsetDays: offsetForTrainingDay(previous, cycleStartDate, todayStr, index)
    }));
    setCalibrating(false);
  }

  return (
    <>
      <section className="space-y-3.5 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.025)]">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-[14px] font-bold text-slate-900">
            <Dumbbell className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            训练循环计划
          </h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 tabular-nums">{days.length} 天一轮</span>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5">
          <div aria-live="polite" className="min-w-0">
            <p className="text-[11px] font-semibold text-emerald-700">今日训练</p>
            <p className="mt-0.5 text-sm font-bold text-emerald-950 tabular-nums">
              {today ? `第 ${todayIndex + 1} 天 · ${today.parts.join(' / ')}` : `还有 ${daysUntilStart} 天开始`}
            </p>
          </div>
          <button
            type="button"
            aria-haspopup="dialog"
            disabled={!today}
            onClick={() => setCalibrating(true)}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 transition active:scale-95 disabled:opacity-40"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            校准今日
          </button>
        </div>

        <ol aria-label="训练循环日程" className="space-y-2">
          {days.map((day, index) => {
            const active = index === todayIndex;
            return (
              <li key={day.id}>
                <button
                  type="button"
                  aria-label={`编辑第 ${index + 1} 天`}
                  aria-description={day.parts.join('、')}
                  aria-current={active ? 'date' : undefined}
                  aria-haspopup="dialog"
                  onClick={() => setEditor({ id: day.id })}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition active:scale-[0.99] ${
                    active ? 'border-emerald-200 bg-emerald-50/70' : 'border-slate-100 bg-slate-50'
                  }`}
                >
                  <span className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-[11px] font-semibold text-slate-500 tabular-nums">第 {index + 1} 天</span>
                    <span className={`text-[13px] font-bold ${active ? 'text-emerald-800' : 'text-slate-900'}`}>{day.parts.join(' / ')}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ol>

        <button
          type="button"
          onClick={addDay}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600 transition active:scale-[0.99]"
          aria-haspopup="dialog"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          添加一天
        </button>
      </section>

      {editingDay && (
        <TrainingDayEditor
          key={editingDay.id}
          day={editingDay}
          index={editingIndex}
          dayCount={days.length + (newDay ? 1 : 0)}
          onSave={saveDay}
          onDelete={newDay ? undefined : deleteDay}
          onClose={() => setEditor(null)}
        />
      )}
      <WheelPickerSheet
        open={calibrating}
        title="校准今日"
        initialValues={{ index: todayIndex }}
        columns={[{
          id: 'index',
          label: '今日在训练循环中的位置',
          options: days.map((day, index) => ({ value: index, label: `第 ${index + 1} 天 · ${day.parts.join(' / ')}` }))
        }]}
        onClose={() => setCalibrating(false)}
        onConfirm={calibrateToday}
      />
    </>
  );
}
