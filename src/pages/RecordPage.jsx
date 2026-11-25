import { useEffect, useMemo, useState } from 'react';
import { Droplets, Moon, Scale, Dumbbell, Footprints, Plus, Trash2, ChevronLeft, ChevronRight, Calendar, Star } from 'lucide-react';
import { INTENSITY_OPTIONS, MEAL_SECTIONS, SLEEP_TAG_OPTIONS, SLEEP_QUALITY_LABELS } from '../data/exercisePresets.js';
import { addDays, formatChineseHeaderDate, calcSleepMinutes, formatDurationShort, formatDurationCN } from '../utils/dateAndCalc.js';
import { WeightSparkline } from '../components/CommonUI.jsx';
import { WheelPickerSheet } from '../components/WheelPickerSheet.jsx';
import { numberOptions, weightPicker } from '../utils/wheelOptions.js';

const padTime = (value) => String(value).padStart(2, '0');
const waterColumns = [{ id: 'ml', label: '毫升', options: numberOptions(50, 1500, (ml) => `${ml} ml`, 50) }];
const timeColumns = [
  { id: 'hour', label: '小时', options: numberOptions(0, 23, padTime) },
  { id: 'minute', label: '分钟', options: numberOptions(0, 55, padTime, 5) }
];
const napColumns = [{ id: 'duration', label: '时长', options: numberOptions(10, 180, (minutes) => `${minutes} 分钟`, 5) }];

function RecordPickerField({ label, value, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-description={value}
      aria-haspopup="dialog"
      onClick={onClick}
      className="flex w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 text-left transition active:scale-[0.98]"
    >
      <span className="min-w-0">
        {value && <span className="mb-0.5 block text-[11px] font-medium text-slate-500">{label}</span>}
        <span className="block text-sm font-bold text-slate-900 tabular-nums">{value ?? label}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
    </button>
  );
}

export function RecordPage({
  todayStr,
  selectedDate,
  onChangeDate,
  subTab,
  onChangeSubTab,
  data,
  currentWeight,
  waterGoal,
  onOpenFoodSheet,
  onDeleteMeal,
  onAddWater,
  onDeleteWater,
  onOpenWorkoutSheet,
  onDeleteWorkout,
  onSaveSleep,
  onDeleteSleep,
  onSaveWeight,
  onDeleteWeight
}) {
  const [picker, setPicker] = useState(null);
  const isToday = selectedDate === todayStr;

  const dayMeals = useMemo(() => data.mealLogs.filter((m) => m.date === selectedDate), [data.mealLogs, selectedDate]);
  const dayWater = useMemo(() => data.waterLogs.filter((w) => w.date === selectedDate), [data.waterLogs, selectedDate]);
  const dayWorkouts = useMemo(
    () => data.workoutLogs.filter((w) => w.date === selectedDate),
    [data.workoutLogs, selectedDate]
  );
  const daySleeps = useMemo(() => data.sleepLogs.filter((s) => s.date === selectedDate), [data.sleepLogs, selectedDate]);

  // 饮食汇总
  const mealSummary = useMemo(
    () =>
      dayMeals.reduce(
        (acc, m) => ({
          kcal: acc.kcal + m.calories,
          protein: acc.protein + (m.protein || 0),
          carbs: acc.carbs + (m.carbs || 0),
          fat: acc.fat + (m.fat || 0)
        }),
        { kcal: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [dayMeals]
  );

  const totalWaterMl = dayWater.reduce((s, w) => s + w.ml, 0);
  const waterPct = Math.min(100, Math.round((totalWaterMl / Math.max(1, waterGoal)) * 100));

  const openWaterPicker = () => setPicker({
    title: '自定义饮水',
    initialValues: { ml: 250 },
    columns: waterColumns,
    onConfirm: ({ ml }) => onAddWater(ml, '自定义饮水')
  });

  // 训练汇总
  const totalWorkoutMin = dayWorkouts.reduce((s, w) => s + w.durationMin, 0);
  const totalWorkoutKcal = dayWorkouts.reduce((s, w) => s + w.caloriesBurned, 0);

  // 睡眠表单状态
  const [bedtime, setBedtime] = useState('23:20');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [isNap, setIsNap] = useState(false);
  const [sleepQuality, setSleepQuality] = useState(4);
  const [sleepTags, setSleepTags] = useState(['入睡快', '深度好']);

  useEffect(() => {
    setIsNap(false);
  }, [selectedDate]);

  useEffect(() => {
    const main = daySleeps.find((s) => !s.isNap);
    if (main) {
      setBedtime(main.bedtime);
      setWakeTime(main.wakeTime);
      setSleepQuality(main.quality);
      setSleepTags(main.tags || []);
    } else {
      setBedtime('23:30');
      setWakeTime('07:00');
      setSleepQuality(4);
      setSleepTags([]);
    }
  }, [selectedDate, daySleeps]);

  const toggleSleepTag = (tag) => {
    setSleepTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const previewSleepMin = calcSleepMinutes(bedtime, wakeTime);

  const openTimePicker = (title, time, onSelect) => {
    const [hour, minute] = time.split(':').map(Number);
    setPicker({
      title,
      initialValues: { hour, minute },
      columns: timeColumns,
      onConfirm: ({ hour, minute }) => onSelect(`${padTime(hour)}:${padTime(minute)}`)
    });
  };

  const openNapDurationPicker = () => setPicker({
    title: '午睡时长',
    initialValues: { duration: previewSleepMin },
    columns: napColumns,
    onConfirm: ({ duration }) => {
      const [hour, minute] = bedtime.split(':').map(Number);
      const end = (hour * 60 + minute + duration) % (24 * 60);
      setWakeTime(`${padTime(Math.floor(end / 60))}:${padTime(end % 60)}`);
    }
  });

  const dayWeight = data.weightLogs.find((log) => log.date === selectedDate);
  const weightValue = dayWeight?.weightKg ?? currentWeight;
  const [weightTag, setWeightTag] = useState('晨起空腹');

  useEffect(() => {
    setWeightTag(dayWeight?.tag || '晨起空腹');
  }, [selectedDate, dayWeight]);

  const openWeightPicker = () => setPicker({
    title: '记录体重',
    ...weightPicker(weightValue, (weight) => onSaveWeight(weight, weightTag), { min: 30, max: 150.9 })
  });

  return (
    <div className="px-4 pt-2 pb-6 space-y-3.5">
      {/* 顶部粘性日期切换器 + 4-Segment 胶囊 */}
      <div className="sticky top-0 z-20 -mx-4 px-4 pt-2 pb-3 bg-[#F7F8FA]/95 backdrop-blur-md space-y-2.5">
        <div className="flex items-center justify-between bg-white rounded-2xl px-2 py-1.5 border border-slate-100 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
          <button
            onClick={() => onChangeDate(addDays(selectedDate, -1))}
            className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 active:scale-90 transition"
            aria-label="前一天"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[13px] font-bold text-slate-800 tabular-nums">
              {isToday ? `今天 · ${formatChineseHeaderDate(selectedDate)}` : formatChineseHeaderDate(selectedDate)}
            </span>
            {!isToday && (
              <button
                onClick={() => onChangeDate(todayStr)}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white active:scale-95 transition"
              >
                今天
              </button>
            )}
          </div>

          <button
            onClick={() => onChangeDate(addDays(selectedDate, 1))}
            className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 active:scale-90 transition"
            aria-label="后一天"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-4 bg-slate-200/75 p-1 rounded-2xl">
          {[
            { id: 'meals', label: '饮食' },
            { id: 'water', label: '饮水' },
            { id: 'workout', label: '训练' },
            { id: 'sleepWeight', label: '睡眠/体重' }
          ].map((seg) => (
            <button
              key={seg.id}
              onClick={() => onChangeSubTab(seg.id)}
              className={`py-1.5 rounded-xl text-[12px] font-semibold transition-all ${
                subTab === seg.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {seg.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================== 1. 饮食 ================== */}
      {subTab === 'meals' && (
        <div className="space-y-3">
          {/* 当日摄入与营养素汇总 */}
          <div className="rounded-2xl bg-white border border-slate-100 p-4 shadow-[0_3px_14px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-400">当日饮食总摄入</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-[26px] font-extrabold text-slate-900 tabular-nums leading-none">
                    {mealSummary.kcal}
                  </span>
                  <span className="text-xs font-medium text-slate-400">kcal</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <div className="bg-orange-50/80 rounded-xl px-2.5 py-1.5 text-center">
                  <p className="text-[9px] text-orange-600/80 font-medium">蛋白质</p>
                  <p className="text-[12px] font-bold text-slate-800 tabular-nums">{mealSummary.protein.toFixed(0)}g</p>
                </div>
                <div className="bg-amber-50/80 rounded-xl px-2.5 py-1.5 text-center">
                  <p className="text-[9px] text-amber-600/80 font-medium">碳水</p>
                  <p className="text-[12px] font-bold text-slate-800 tabular-nums">{mealSummary.carbs.toFixed(0)}g</p>
                </div>
                <div className="bg-rose-50/80 rounded-xl px-2.5 py-1.5 text-center">
                  <p className="text-[9px] text-rose-500/80 font-medium">脂肪</p>
                  <p className="text-[12px] font-bold text-slate-800 tabular-nums">{mealSummary.fat.toFixed(0)}g</p>
                </div>
              </div>
            </div>
          </div>

          {/* 早餐 / 午餐 / 晚餐 / 加餐 */}
          {MEAL_SECTIONS.map((sec) => {
            const items = dayMeals.filter((m) => m.mealType === sec.key);
            const secKcal = items.reduce((s, i) => s + i.calories, 0);
            return (
              <div
                key={sec.key}
                className="rounded-2xl bg-white border border-slate-100 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.025)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-base">
                      {sec.emoji}
                    </span>
                    <div>
                      <h3 className="text-[14px] font-bold text-slate-900">{sec.label}</h3>
                      <p className="text-[11px] text-slate-400 tabular-nums">
                        {items.length > 0 ? `小计 ${secKcal} kcal` : sec.hint}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenFoodSheet(sec.key)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-50 hover:bg-orange-100 text-orange-600 text-[12px] font-bold active:scale-95 transition"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    添加食物
                  </button>
                </div>

                {items.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 divide-y divide-slate-50">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                        <div className="min-w-0 pr-2">
                          <p className="text-[13px] font-semibold text-slate-800 truncate">{item.name}</p>
                          <p className="text-[11px] text-slate-400 tabular-nums">
                            {item.portionText || `${item.grams}g`} · 蛋{item.protein}g 碳{item.carbs}g
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[13px] font-bold text-slate-900 tabular-nums">
                            {item.calories}
                            <span className="text-[10px] font-normal text-slate-400 ml-0.5">kcal</span>
                          </span>
                          <button
                            onClick={() => onDeleteMeal(item.id)}
                            className="w-7 h-7 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition"
                            aria-label="删除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ================== 2. 饮水 ================== */}
      {subTab === 'water' && (
        <div className="space-y-3.5">
          <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white p-5 shadow-[0_10px_28px_-10px_rgba(14,165,233,0.45)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-sky-100" />
                <span className="text-[13px] font-semibold text-sky-50">当日饮水进度</span>
              </div>
              <span className="text-[12px] font-bold bg-white/20 px-2.5 py-0.5 rounded-full tabular-nums">
                {waterPct}%
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-[38px] font-extrabold tracking-tight leading-none tabular-nums">
                {totalWaterMl}
              </span>
              <span className="text-sm font-medium text-sky-100 tabular-nums">/ {waterGoal} ml</span>
            </div>

            <div className="mt-4 w-full h-2.5 rounded-full bg-black/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${Math.max(waterPct, totalWaterMl > 0 ? 4 : 0)}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-100 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.025)] space-y-3">
            <h3 className="text-[13px] font-bold text-slate-800">一键快捷补水</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { ml: 150, label: '小杯温水', sub: '+150ml' },
                { ml: 250, label: '标准一杯', sub: '+250ml' },
                { ml: 330, label: '罐装 / 小瓶', sub: '+330ml' },
                { ml: 500, label: '运动水壶', sub: '+500ml' }
              ].map((btn) => (
                <button
                  key={btn.ml}
                  onClick={() => onAddWater(btn.ml, btn.label)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-sky-50/75 hover:bg-sky-100/70 border border-sky-100 active:scale-[0.97] transition"
                >
                  <div className="text-left">
                    <p className="text-[14px] font-extrabold text-sky-700 tabular-nums">{btn.sub}</p>
                    <p className="text-[11px] text-sky-600/75 mt-0.5">{btn.label}</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-white text-sky-500 flex items-center justify-center shadow-sm">
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </button>
              ))}
            </div>

            <RecordPickerField label="自定义饮水" onClick={openWaterPicker} />
          </div>

          <div className="rounded-2xl bg-white border border-slate-100 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.025)]">
            <h3 className="text-[13px] font-bold text-slate-800 mb-2">饮水流水 ({dayWater.length})</h3>
            {dayWater.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-5">当天暂无饮水记录</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {dayWater.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-semibold text-slate-400 tabular-nums w-10">{item.time}</span>
                      <div className="w-2 h-2 rounded-full bg-sky-400" />
                      <span className="text-[13px] font-medium text-slate-700">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-sky-600 tabular-nums">+{item.ml} ml</span>
                      <button
                        onClick={() => onDeleteWater(item.id)}
                        className="w-7 h-7 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================== 3. 训练 ================== */}
      {subTab === 'workout' && (
        <div className="space-y-3.5">
          <div className="rounded-2xl bg-white border border-slate-100 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.025)] grid grid-cols-2 divide-x divide-slate-100">
            <div className="pr-3">
              <p className="text-[11px] text-slate-400 font-medium">当日训练总时长</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-[28px] font-extrabold text-slate-900 tabular-nums leading-none">
                  {totalWorkoutMin}
                </span>
                <span className="text-xs text-slate-400">分钟</span>
              </div>
            </div>
            <div className="pl-4">
              <p className="text-[11px] text-slate-400 font-medium">训练总消耗</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-[28px] font-extrabold text-emerald-600 tabular-nums leading-none">
                  {totalWorkoutKcal}
                </span>
                <span className="text-xs text-slate-400">kcal</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onOpenWorkoutSheet('cardio')}
              className="rounded-2xl bg-emerald-50/90 hover:bg-emerald-100/80 border border-emerald-200/60 p-4 text-left active:scale-[0.97] transition"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm shadow-emerald-200 mb-2.5">
                <Footprints className="w-4 h-4" />
              </div>
              <p className="text-[14px] font-bold text-slate-900">+ 有氧训练</p>
              <p className="text-[11px] text-emerald-700/80 mt-0.5">跑步 / 爬坡 / 跳绳 / 游泳</p>
            </button>

            <button
              onClick={() => onOpenWorkoutSheet('anaerobic')}
              className="rounded-2xl bg-teal-50/85 hover:bg-teal-100/75 border border-teal-200/60 p-4 text-left active:scale-[0.97] transition"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm shadow-teal-200 mb-2.5">
                <Dumbbell className="w-4 h-4" />
              </div>
              <p className="text-[14px] font-bold text-slate-900">+ 无氧训练</p>
              <p className="text-[11px] text-teal-700/80 mt-0.5">器械 / 臀腿 / 上肢 / 普拉提</p>
            </button>
          </div>

          <div className="rounded-2xl bg-white border border-slate-100 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.025)]">
            <h3 className="text-[13px] font-bold text-slate-800 mb-2.5">当日训练记录 ({dayWorkouts.length})</h3>
            {dayWorkouts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                暂无训练记录，添加后将自动计入概况页的净热量扣减
              </p>
            ) : (
              <div className="space-y-2.5">
                {dayWorkouts.map((w) => {
                  const isCardio = w.category === 'cardio';
                  const intLabel = INTENSITY_OPTIONS.find((o) => o.key === w.intensity)?.label || '中强度';
                  return (
                    <div
                      key={w.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 ${
                            isCardio ? 'bg-emerald-100 text-emerald-700' : 'bg-teal-100 text-teal-700'
                          }`}
                        >
                          {isCardio ? '有氧' : '无氧'}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-slate-900 truncate">{w.name}</p>
                          <p className="text-[11px] text-slate-400 tabular-nums">
                            {w.durationMin}分钟 · {intLabel} · MET {w.met}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[14px] font-extrabold text-emerald-600 tabular-nums">
                          -{w.caloriesBurned}
                          <span className="text-[10px] font-normal text-slate-400 ml-0.5">kcal</span>
                        </span>
                        <button
                          onClick={() => onDeleteWorkout(w.id)}
                          className="w-7 h-7 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================== 4. 睡眠 / 体重 ================== */}
      {subTab === 'sleepWeight' && (
        <div className="space-y-4">
          {/* 睡眠记录卡片 */}
          <div className="rounded-2xl bg-white border border-slate-100 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.025)] space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">睡眠记录</h3>
                  <p className="text-[10px] text-slate-400">支持跨午夜自动计算总时长</p>
                </div>
              </div>
              <div className="inline-flex bg-slate-100 p-0.5 rounded-xl text-[11px] font-semibold">
                <button
                  type="button"
                  aria-pressed={!isNap}
                  onClick={() => setIsNap(false)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    !isNap ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  主睡眠
                </button>
                <button
                  type="button"
                  aria-pressed={isNap}
                  onClick={() => setIsNap(true)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    isNap ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  午睡
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <RecordPickerField label="入睡时间" value={bedtime} onClick={() => openTimePicker('入睡时间', bedtime, setBedtime)} />
              <RecordPickerField label="起床时间" value={wakeTime} onClick={() => openTimePicker('起床时间', wakeTime, setWakeTime)} />
            </div>

            {isNap ? (
              <RecordPickerField label="午睡时长" value={formatDurationCN(previewSleepMin)} onClick={openNapDurationPicker} />
            ) : (
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-indigo-50/70">
                <span className="text-[12px] text-indigo-700 font-medium">预计睡眠时长</span>
                <span className="text-[15px] font-extrabold text-indigo-700 tabular-nums">
                  {formatDurationCN(previewSleepMin)}
                </span>
              </div>
            )}

            {/* 1-5 星质量评分 */}
            <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3.5 py-2.5">
              <span className="text-[12px] font-semibold text-slate-600">睡眠质量</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setSleepQuality(star)}
                    className="p-0.5 active:scale-90 transition"
                    aria-label={`${star}星`}
                  >
                    <Star
                      className={`w-5 h-5 transition ${
                        star <= sleepQuality ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-[11px] font-bold text-indigo-600 ml-1 w-7 text-right">
                  {SLEEP_QUALITY_LABELS[sleepQuality]}
                </span>
              </div>
            </div>

            {/* 睡眠状态标签多选 */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-slate-400">睡眠标签（可多选）</span>
              <div className="flex flex-wrap gap-1.5">
                {SLEEP_TAG_OPTIONS.map((tag) => {
                  const selected = sleepTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleSleepTag(tag)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition active:scale-95 ${
                        selected
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() =>
                onSaveSleep({
                  date: selectedDate,
                  bedtime,
                  wakeTime,
                  durationMin: previewSleepMin,
                  isNap,
                  quality: sleepQuality,
                  tags: sleepTags
                })
              }
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold shadow-sm shadow-indigo-200 active:scale-[0.98] transition"
            >
              保存睡眠记录
            </button>

            {daySleeps.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                {daySleeps.map((s) => (
                  <div key={s.id} className="bg-slate-50 rounded-xl p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold text-[10px]">
                          {s.isNap ? '午睡' : '主睡眠'}
                        </span>
                        <span className="font-bold text-slate-800 tabular-nums">
                          {s.bedtime} → {s.wakeTime} ({formatDurationShort(s.durationMin)})
                        </span>
                      </div>
                      <button onClick={() => onDeleteSleep(s.id)} className="text-slate-300 hover:text-rose-500 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="inline-flex items-center gap-0.5 text-amber-500 font-semibold">
                        {'★'.repeat(s.quality)}
                        <span className="text-slate-400 ml-1">{SLEEP_QUALITY_LABELS[s.quality]}</span>
                      </span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {(s.tags || []).map((t) => (
                          <span key={t} className="px-1.5 py-0.5 rounded bg-white text-indigo-600 border border-indigo-100">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 体重记录与趋势曲线卡片 */}
          <div className="rounded-2xl bg-white border border-slate-100 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.025)] space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">体重记录与趋势</h3>
                  <p className="text-[10px] text-slate-400">精确至 0.1kg · 同步用于运动 MET 计算</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full tabular-nums">
                目标 {data.settings.targetWeightKg.toFixed(1)}kg
              </span>
            </div>

            <RecordPickerField label="记录体重" value={`${weightValue.toFixed(1)} kg`} onClick={openWeightPicker} />

            <div className="flex gap-2">
              {['晨起空腹', '运动后', '睡前'].map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={weightTag === t}
                  onClick={() => setWeightTag(t)}
                  className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold border transition ${
                    weightTag === t
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                      : 'bg-white border-slate-200/80 text-slate-500'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="pt-1">
              <WeightSparkline logs={data.weightLogs} targetWeight={data.settings.targetWeightKg} />
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1">
              {[...data.weightLogs]
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 6)
                .map((w) => (
                  <div key={w.id} className="flex items-center justify-between py-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-500 tabular-nums">{w.date}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{w.tag}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-slate-900 tabular-nums">
                        {w.weightKg.toFixed(1)} kg
                      </span>
                      <button onClick={() => onDeleteWeight(w.id)} className="text-slate-300 hover:text-rose-500 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

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
