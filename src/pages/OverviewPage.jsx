import { Flame, Droplets, Moon, Scale, Sparkles, Clock, ArrowRight, Star, Dumbbell, ChevronRight, CircleCheck } from 'lucide-react';
import { SLEEP_QUALITY_LABELS } from '../data/exercisePresets.js';
import { formatChineseHeaderDate, formatDurationShort } from '../utils/dateAndCalc.js';
import { CalorieRing } from '../components/CommonUI.jsx';

function TodayTrainingHint({ training, workoutLogged, todayBurned, onOpenTraining }) {
  let text;
  let Icon;
  if (training.status === 'upcoming') {
    text = `训练循环将在 ${training.daysUntilStart} 天后开始`;
    Icon = Clock;
  } else if (training.status === 'rest') {
    text = workoutLogged ? `休息日加练（-${todayBurned} kcal）` : '今日休息日 · 好好恢复与拉伸';
    Icon = workoutLogged ? CircleCheck : Moon;
  } else {
    const parts = training.day.parts.join(' · ');
    text = workoutLogged ? `今日已完成 · ${parts}（-${todayBurned} kcal）` : `今日训练：${parts}`;
    Icon = workoutLogged ? CircleCheck : Dumbbell;
  }

  const hasAction = training.status === 'train' || (training.status === 'rest' && workoutLogged);
  const style = `flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold ${
    workoutLogged && hasAction ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-100' : 'border-white/10 bg-white/5 text-slate-200'
  }`;
  const content = (
    <>
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1 tabular-nums">{text}</span>
    </>
  );

  if (!hasAction) return <div className={style}>{content}</div>;
  return (
    <button
      type="button"
      onClick={onOpenTraining}
      className={`${style} pointer-events-auto transition active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300`}
    >
      {content}
      <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    </button>
  );
}

export function OverviewPage({
  todayStr, settings, stats, targets, trainingToday,
  onQuickWater, onOpenWeight, onJumpRecord, onJumpPlanning
}) {
  const sleepTargetMin = Math.round(settings.dailySleepGoalHours * 60);
  const sleepMet = stats.lastSleep && stats.lastSleep.durationMin >= sleepTargetMin;
  const { targetCalories, targetDeficit, goalLabel, recommendedWater, baselineTdee } = targets;
  const balanceLabel = targetDeficit > 0 ? '目标缺口' : targetDeficit < 0 ? '目标盈余' : '目标平衡';
  const weightStatus = stats.weightDelta > 0 ? `+${stats.weightDelta}` : stats.weightDelta || '持平';

  return (
    <div className="px-4 pt-3 pb-4 space-y-3.5">
      {/* 紧凑页头：标题 + 今日日期 + 可点击体重胶囊 */}
      <header className="flex items-center justify-between pt-1 pb-0.5">
        <div>
          <p className="text-[11px] font-medium text-slate-400">{formatChineseHeaderDate(todayStr)}</p>
          <h1 className="text-[21px] font-bold tracking-tight text-slate-900 mt-0.5">自律日记</h1>
        </div>
        <button
          onClick={onOpenWeight}
          aria-label={`记录今日体重，${stats.hasWeightRecord ? '最新' : '参考'} ${stats.latestWeight.toFixed(1)} kg`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-100 shadow-[0_2px_10px_rgba(15,23,42,0.04)] active:scale-95 transition"
        >
          <Scale className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-[12px] font-extrabold text-slate-800 tabular-nums">
            {stats.latestWeight.toFixed(1)} kg
          </span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums ${
              !stats.hasWeightRecord
                ? 'bg-slate-100 text-slate-500'
                : stats.weightDelta <= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
            }`}
          >
            {stats.hasWeightRecord ? weightStatus : '参考'}
          </span>
        </button>
      </header>

      {/* Card 1: 自律期限倒计时 (Slate / Amber) */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-[0_10px_28px_-10px_rgba(15,23,42,0.45)] active:scale-[0.99] transition">
        <div className="absolute -right-8 -top-10 w-36 h-36 rounded-full bg-amber-400/15 blur-2xl pointer-events-none" />
        <button
          type="button"
          aria-label="打开自律规划"
          onClick={onJumpPlanning}
          className="absolute inset-0 rounded-2xl focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-300"
        />
        <div className="pointer-events-none relative z-10 p-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 bg-amber-400/15 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3" />
              {settings.cycleName || '自律蜕变期'}
            </span>
            <span className="text-[11px] font-semibold text-slate-300 tabular-nums">
              第 {stats.elapsedDays} / {stats.totalDays} 天
            </span>
          </div>

          <div className="flex items-end justify-between mt-3.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[12px] text-slate-400 font-medium">剩余</span>
              <span className="text-[38px] font-extrabold tracking-tight leading-none tabular-nums text-white">
                {stats.remainingDays}
              </span>
              <span className="text-[13px] text-slate-300 font-medium">天</span>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400">周期起止</p>
              <p className="text-[11px] font-semibold text-slate-200 tabular-nums mt-0.5">
                {settings.cycleStartDate.slice(5)} → {settings.cycleEndDate.slice(5)}
              </p>
            </div>
          </div>

          <div className="mt-3.5 flex items-center gap-2.5">
            <div className="flex-1 h-1.5 rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(4, stats.cyclePercent))}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-amber-300 tabular-nums">{stats.cyclePercent}%</span>
          </div>
          <div className="mt-3.5">
            <TodayTrainingHint
              training={trainingToday}
              workoutLogged={stats.todayWorkouts.length > 0}
              todayBurned={stats.todayBurned}
              onOpenTraining={() => onJumpRecord('workout')}
            />
          </div>
        </div>
      </section>

      {/* Card 2: 当日总热量（净热量 = 摄入 - 训练消耗）与目标热量对比 (Warm Coral/Orange) */}
      <section
        onClick={() => onJumpRecord('meals')}
        className="rounded-2xl bg-white border border-slate-100 p-4 shadow-[0_3px_16px_rgba(15,23,42,0.03)] cursor-pointer active:scale-[0.99] transition"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-slate-900">当日总热量</h2>
              <p className="text-[10px] text-slate-400">净热量 = 饮食摄入 - 训练消耗</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full tabular-nums">
            目标 {targetCalories} kcal
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 space-y-2.5">
            <div>
              <p className="text-[11px] font-medium text-slate-400">今日净热量</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-[32px] font-extrabold text-slate-900 tracking-tight tabular-nums leading-none">
                  {stats.netCalories}
                </span>
                <span className="text-[11px] font-medium text-slate-400 tabular-nums">
                  / {targetCalories} kcal
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-50 text-orange-700 text-[11px] font-bold tabular-nums">
                摄入 {stats.todayIntake}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-[11px] font-bold tabular-nums">
                消耗 -{stats.todayBurned}
              </span>
            </div>
          </div>

          <CalorieRing net={stats.netCalories} goal={targetCalories} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2.5 text-[11px] font-semibold tabular-nums">
          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-orange-700">{goalLabel}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{balanceLabel} {Math.abs(targetDeficit)} kcal</span>
          <span className="px-1 text-slate-500">日常消耗估算 {baselineTdee} kcal</span>
        </div>
      </section>

      {/* Card 3: 当日饮水量与建议饮水量（自带 +250ml 与 +500ml 一键快捷按钮）(Sky Blue) */}
      <section
        onClick={() => onJumpRecord('water')}
        className="rounded-2xl bg-white border border-slate-100 p-4 shadow-[0_3px_16px_rgba(15,23,42,0.03)] cursor-pointer active:scale-[0.99] transition"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-slate-900">当日饮水量</h2>
              <p className="text-[10px] text-slate-400 tabular-nums">
                建议 {recommendedWater} ml · 已完成 {stats.waterPercent}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onQuickWater(250)}
              className="px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-600 text-[11px] font-bold border border-sky-200/60 active:scale-95 transition tabular-nums"
            >
              +250ml
            </button>
            <button
              onClick={() => onQuickWater(500)}
              className="px-2.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-[11px] font-bold shadow-sm shadow-sky-200 active:scale-95 transition tabular-nums"
            >
              +500ml
            </button>
          </div>
        </div>

        <div className="mt-3.5">
          <div className="flex items-baseline justify-between mb-1.5">
            <div className="flex items-baseline gap-1">
              <span className="text-[24px] font-extrabold text-slate-900 tabular-nums leading-none">
                {stats.todayWater}
              </span>
              <span className="text-xs font-medium text-slate-400 tabular-nums">
                / {recommendedWater} ml
              </span>
            </div>
            <span className="text-[11px] font-semibold text-sky-600 tabular-nums">
              {stats.todayWater >= recommendedWater
                ? '今日已达标'
                : `还差 ${recommendedWater - stats.todayWater} ml`}
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-sky-50 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-500 transition-all duration-500"
              style={{ width: `${Math.max(stats.waterPercent, stats.todayWater > 0 ? 5 : 0)}%` }}
            />
          </div>
        </div>
      </section>

      {/* Card 4: 上一日睡眠 (Indigo / Violet) */}
      <section
        onClick={() => onJumpRecord('sleepWeight')}
        className="rounded-2xl bg-white border border-slate-100 p-4 shadow-[0_3px_16px_rgba(15,23,42,0.03)] cursor-pointer active:scale-[0.99] transition"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-slate-900">上一日睡眠</h2>
              <p className="text-[10px] text-slate-400 tabular-nums">目标 {settings.dailySleepGoalHours}h</p>
            </div>
          </div>

          {stats.lastSleep ? (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Star className="w-3 h-3 fill-indigo-500 text-indigo-500" />
              <span className="text-[11px] font-bold tabular-nums">
                {stats.lastSleep.quality}.0 · {SLEEP_QUALITY_LABELS[stats.lastSleep.quality] || '良好'}
              </span>
            </div>
          ) : (
            <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              去补录
            </span>
          )}
        </div>

        {stats.lastSleep ? (
          <div className="mt-3 bg-indigo-50/45 rounded-xl p-3 space-y-2">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[24px] font-extrabold text-slate-900 tabular-nums leading-none">
                  {formatDurationShort(stats.lastSleep.durationMin)}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mt-1.5 tabular-nums">
                  <Clock className="w-3 h-3 text-indigo-400" />
                  <span>{stats.lastSleep.bedtime}</span>
                  <ArrowRight className="w-3 h-3 text-slate-300" />
                  <span>{stats.lastSleep.wakeTime}</span>
                </div>
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full tabular-nums ${
                  sleepMet ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}
              >
                {sleepMet ? '时长达标' : `少 ${sleepTargetMin - stats.lastSleep.durationMin}m`}
              </span>
            </div>

            {stats.lastSleep.tags && stats.lastSleep.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1 border-t border-indigo-100/70">
                {stats.lastSleep.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-indigo-600 border border-indigo-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-3 py-3 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
            尚未录入昨晚睡眠，点击记录
          </div>
        )}
      </section>
    </div>
  );
}
