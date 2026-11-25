import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { PickerField } from './PickerField.jsx';
import { WheelPickerSheet } from './WheelPickerSheet.jsx';
import { addDays, diffDays } from '../utils/dateAndCalc.js';
import { numberOptions } from '../utils/wheelOptions.js';

const cycleDayOptions = numberOptions(1, 365, (value) => `${value} 天`);

export function CycleSettingsCard({ settings, todayStr, onUpdateSettings, showToast }) {
  const [picker, setPicker] = useState(null);
  const totalDays = Math.max(1, diffDays(settings.cycleStartDate, settings.cycleEndDate) + 1);
  const remainingDays = Math.max(0, diffDays(todayStr, settings.cycleEndDate));

  const updateCycleTotalDays = (days) => {
    onUpdateSettings({
      cycleTotalDays: days,
      cycleEndDate: addDays(settings.cycleStartDate, days - 1)
    });
  };

  const openNumberPicker = (title, value, options, onSelect) => {
    setPicker({
      title,
      initialValues: { value },
      columns: [{ id: 'value', label: title, options }],
      onConfirm: ({ value }) => onSelect(value)
    });
  };

  const openStartDatePicker = () => {
    const [year, month, day] = settings.cycleStartDate.split('-').map(Number);
    const currentYear = Number(todayStr.slice(0, 4));
    const yearOptions = numberOptions(currentYear - 30, currentYear + 30, (value) => `${value} 年`);
    if (!yearOptions.some((option) => option.value === year)) {
      yearOptions.push({ value: year, label: `${year} 年` });
      yearOptions.sort((a, b) => a.value - b.value);
    }

    setPicker({
      title: '开始日期',
      initialValues: { year, month, day },
      columns: (draft) => [
        { id: 'year', label: '年', options: yearOptions },
        { id: 'month', label: '月', options: numberOptions(1, 12, (value) => `${value} 月`) },
        {
          id: 'day',
          label: '日',
          options: numberOptions(1, new Date(draft.year ?? year, draft.month ?? month, 0).getDate(), (value) => `${value} 日`)
        }
      ],
      onConfirm: ({ year, month, day }) => {
        const start = [String(year).padStart(4, '0'), String(month).padStart(2, '0'), String(day).padStart(2, '0')].join('-');
        onUpdateSettings({ cycleStartDate: start, cycleEndDate: addDays(start, totalDays - 1) });
      }
    });
  };

  return (
    <>
      <section className="rounded-2xl bg-white border border-slate-100 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.025)] space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            自律周期设置
          </h2>
          <span className="text-[11px] font-bold text-slate-700 bg-amber-50 border border-amber-200/70 px-2.5 py-0.5 rounded-full tabular-nums">
            剩 {remainingDays} 天
          </span>
        </div>

        <label className="block">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">自律计划名称</span>
          <input
            type="text"
            value={settings.cycleName}
            onChange={(e) => onUpdateSettings({ cycleName: e.target.value })}
            placeholder="例如：60天自律蜕变期"
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
          />
        </label>

        <div>
          <span className="text-[11px] font-medium text-slate-400 block mb-1.5">快捷周期天数</span>
          <div className="grid grid-cols-4 gap-2">
            {[21, 30, 60, 90].map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={totalDays === d}
                onClick={() => {
                  updateCycleTotalDays(d);
                  showToast(`已切换为 ${d} 天自律周期`);
                }}
                className={`py-2 rounded-full text-[12px] font-bold tabular-nums border transition active:scale-95 ${
                  totalDays === d
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200/70 hover:bg-slate-100'
                }`}
              >
                {d}天
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <PickerField label="开始日期" value={settings.cycleStartDate} onClick={openStartDatePicker} />
          <PickerField
            label="自定义总天数"
            value={`${totalDays} 天`}
            onClick={() => openNumberPicker('自定义总天数', totalDays, cycleDayOptions, updateCycleTotalDays)}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 rounded-xl px-3 py-2 tabular-nums">
          <span>自动推算结束日期</span>
          <span className="font-bold text-slate-800">{settings.cycleEndDate}</span>
        </div>
      </section>

      {picker && (
        <WheelPickerSheet
          open
          title={picker.title}
          initialValues={picker.initialValues}
          columns={picker.columns}
          onClose={() => setPicker(null)}
          onConfirm={(values) => {
            picker.onConfirm(values);
            setPicker(null);
          }}
        />
      )}
    </>
  );
}
