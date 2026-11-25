import { useState } from 'react';
import {
  ChevronRight, Copy, Database, Download, Flame, Plus, RotateCcw, SlidersHorizontal,
  Sparkles, Trash2, Upload, Utensils
} from 'lucide-react';
import { WheelPickerSheet } from '../components/WheelPickerSheet.jsx';
import { GOAL_PRESETS } from '../utils/calorieCalc.js';
import { addDays, diffDays } from '../utils/dateAndCalc.js';
import { numberOptions, weightPicker } from '../utils/wheelOptions.js';

const cycleDayOptions = numberOptions(1, 365, (value) => `${value} 天`);
const heightOptions = numberOptions(120, 230, (value) => `${value} cm`);
const ageOptions = numberOptions(18, 100, (value) => `${value} 岁`);
const sleepOptions = Array.from({ length: 17 }, (_, index) => {
  const value = 4 + index / 2;
  return { value, label: `${value.toFixed(1)} 小时` };
});
const genderOptions = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' }
];
const activityOptions = [
  { value: 1.2, label: '久坐日常' },
  { value: 1.35, label: '走动较多' }
];
const goalOptions = Object.entries(GOAL_PRESETS).map(([value, { label }]) => ({ value, label }));

function PickerField({ label, value, onClick }) {
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

function CapsuleOptions({ label, options, selected, onSelect }) {
  return (
    <div role="group" aria-label={label}>
      <span className="block mb-1.5 text-[11px] font-medium text-slate-500">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map(({ value, label: optionLabel }) => (
          <button
            key={value}
            type="button"
            aria-pressed={selected === value}
            onClick={() => onSelect(value)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
              selected === value
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200/70 bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {optionLabel}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SettingsPage({
  settings,
  targets,
  currentWeight,
  todayStr,
  customFoods,
  builtinCount,
  onUpdateSettings,
  onUpdateProfile,
  onOpenAddFood,
  onDeleteCustomFood,
  onDownloadJSON,
  onCopyJSON,
  onOpenImport,
  onOpenReset,
  showToast
}) {
  const [picker, setPicker] = useState(null);
  const { profile } = settings;
  const totalDays = Math.max(1, diffDays(settings.cycleStartDate, settings.cycleEndDate) + 1);
  const remainingDays = Math.max(0, diffDays(todayStr, settings.cycleEndDate));
  const energyDifferenceLabel = targets.targetDeficit === 0
    ? '每日热量平衡'
    : targets.targetDeficit < 0 ? '每日热量盈余' : '每日热量赤字';

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

  const openWeightPicker = (title, weight, onSelect) => {
    setPicker({ title, ...weightPicker(weight, onSelect) });
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
    <div className="px-4 pt-3 pb-6 space-y-4">
      <header className="pt-1">
        <p className="text-[11px] font-medium text-slate-400">周期规划 · 目标 · 本地数据</p>
        <h1 className="text-[21px] font-bold tracking-tight text-slate-900 mt-0.5">设置</h1>
      </header>

      {/* Section 1: 自律周期设置 */}
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

      {/* Section 2: 个人资料 */}
      <section className="rounded-2xl bg-white border border-slate-100 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.025)] space-y-3.5">
        <h2 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-orange-500" />
          个人资料
        </h2>

        <CapsuleOptions
          label="性别"
          options={genderOptions}
          selected={profile.gender}
          onSelect={(gender) => onUpdateProfile({ gender })}
        />
        <div className="grid grid-cols-2 gap-2.5">
          <PickerField
            label="身高"
            value={`${profile.height} cm`}
            onClick={() => openNumberPicker('身高', profile.height, heightOptions, (height) => onUpdateProfile({ height }))}
          />
          <PickerField
            label="年龄"
            value={`${profile.age} 岁`}
            onClick={() => openNumberPicker('年龄', profile.age, ageOptions, (age) => onUpdateProfile({ age }))}
          />
        </div>
        <div className="grid gap-1.5">
          <PickerField
            label="参考体重"
            value={`${profile.referenceWeight.toFixed(1)} kg`}
            onClick={() => openWeightPicker('参考体重', profile.referenceWeight, (referenceWeight) => onUpdateProfile({ referenceWeight }))}
          />
          <p className="text-[11px] text-slate-500">
            当前用于估算的体重为 {currentWeight.toFixed(1)} kg，优先使用最新记录。
          </p>
        </div>

        <CapsuleOptions
          label="日常活动量"
          options={activityOptions}
          selected={profile.activityLevel}
          onSelect={(activityLevel) => onUpdateProfile({ activityLevel })}
        />
        <CapsuleOptions
          label="体重管理目标"
          options={goalOptions}
          selected={profile.goalType}
          onSelect={(goalType) => onUpdateProfile({ goalType })}
        />

        <div className="grid grid-cols-2 gap-2.5">
          <PickerField
            label="目标体重"
            value={`${settings.targetWeightKg.toFixed(1)} kg`}
            onClick={() => openWeightPicker('目标体重', settings.targetWeightKg, (targetWeightKg) => onUpdateSettings({ targetWeightKg }))}
          />
          <PickerField
            label="目标睡眠时长"
            value={`${settings.dailySleepGoalHours.toFixed(1)} 小时`}
            onClick={() => openNumberPicker('目标睡眠时长', settings.dailySleepGoalHours, sleepOptions, (dailySleepGoalHours) => onUpdateSettings({ dailySleepGoalHours }))}
          />
        </div>
      </section>

      <section className="rounded-2xl bg-white border border-slate-100 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.025)] space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            自动目标
          </h2>
          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-700">
            {targets.goalLabel}
          </span>
        </div>

        <dl className="grid grid-cols-2 gap-2.5 tabular-nums">
          <div className="rounded-xl border border-orange-100 bg-orange-50/55 p-3">
            <dt className="text-[11px] font-medium text-orange-700">每日目标热量</dt>
            <dd className="mt-0.5 text-base font-extrabold text-slate-900">{targets.targetCalories} <span className="text-xs">kcal</span></dd>
          </div>
          <div className="rounded-xl border border-sky-100 bg-sky-50/65 p-3">
            <dt className="text-[11px] font-medium text-sky-700">每日建议饮水</dt>
            <dd className="mt-0.5 text-base font-extrabold text-slate-900">{targets.recommendedWater} <span className="text-xs">ml</span></dd>
          </div>
          {[
            ['基础代谢（BMR）', targets.bmr],
            ['日常消耗（TDEE）', targets.baselineTdee],
            [energyDifferenceLabel, Math.abs(targets.targetDeficit)]
          ].map(([label, value]) => (
            <div key={label} className="col-span-2 flex items-center justify-between gap-2 text-xs text-slate-600">
              <dt>{label}</dt>
              <dd className="font-semibold text-slate-800">{value} kcal</dd>
            </div>
          ))}
        </dl>
        {targets.isFloored && (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
            已应用热量下限。下限取基础代谢与性别最低值（{profile.gender === 'male' ? 1500 : 1200} kcal）中的较高值。
          </p>
        )}
      </section>

      {/* Section 3: 自定义食物库 */}
      <section className="rounded-2xl bg-white border border-slate-100 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.025)] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-500" />
              自定义食物库 ({customFoods.length})
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5 tabular-nums">
              已内置 {builtinCount} 种常见食物，自定义项同步出现在饮食检索中
            </p>
          </div>
          <button
            onClick={onOpenAddFood}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900 text-white text-[11px] font-bold active:scale-95 transition shrink-0"
          >
            <Plus className="w-3 h-3" />
            添加
          </button>
        </div>

        {customFoods.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-3 bg-slate-50 rounded-xl">暂无自定义食物</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {customFoods.map((f) => (
              <div key={f.id} className="flex items-center justify-between py-2">
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[13px] font-bold text-slate-800 truncate">{f.name}</p>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 shrink-0">
                      {f.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 tabular-nums mt-0.5">
                    {f.kcalPer100g} kcal/100g {f.unitName ? `· 1${f.unitName}≈${f.unitGrams}g` : ''}
                  </p>
                </div>
                <button
                  onClick={() => onDeleteCustomFood(f.id)}
                  className="w-7 h-7 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 4: 本地数据管理 */}
      <section className="rounded-2xl bg-white border border-slate-100 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.025)] space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-600" />
            数据管理
          </h2>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
            纯本地存储
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onDownloadJSON}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-[12px] font-bold text-slate-700 active:scale-[0.98] transition"
          >
            <Download className="w-3.5 h-3.5" />
            导出 JSON 备份
          </button>
          <button
            onClick={onCopyJSON}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-[12px] font-bold text-slate-700 active:scale-[0.98] transition"
          >
            <Copy className="w-3.5 h-3.5" />
            复制 JSON 文本
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenImport}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 text-white text-[12px] font-bold active:scale-[0.98] transition"
          >
            <Upload className="w-3.5 h-3.5" />
            导入恢复数据
          </button>
          <button
            onClick={onOpenReset}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-semibold text-rose-500 bg-rose-50/80 hover:bg-rose-100/70 active:scale-[0.98] transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            重置本地数据
          </button>
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
    </div>
  );
}
