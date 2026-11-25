import { Plus, Trash2, Sparkles, Download, Upload, RotateCcw, Utensils, SlidersHorizontal, Database, Copy } from 'lucide-react';
import { addDays, diffDays } from '../utils/dateAndCalc.js';

export function SettingsPage({
  settings,
  todayStr,
  customFoods,
  builtinCount,
  onUpdateSettings,
  onOpenAddFood,
  onDeleteCustomFood,
  onDownloadJSON,
  onCopyJSON,
  onOpenImport,
  onOpenReset,
  showToast
}) {
  const totalDays = Math.max(1, diffDays(settings.cycleStartDate, settings.cycleEndDate) + 1);
  const remainingDays = Math.max(0, diffDays(todayStr, settings.cycleEndDate));

  const updateCycleTotalDays = (days) => {
    const safeDays = Math.max(1, Math.min(365, parseInt(days, 10) || 1));
    onUpdateSettings({
      cycleTotalDays: safeDays,
      cycleEndDate: addDays(settings.cycleStartDate, safeDays - 1)
    });
  };

  const recommendWater = () => {
    const rec = Math.round((settings.currentWeightKg * 33) / 50) * 50;
    onUpdateSettings({ dailyWaterGoalMl: rec });
    showToast(`已按体重推荐饮水 ${rec} ml`);
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
                onClick={() => {
                  updateCycleTotalDays(d);
                  showToast(`已切换为 ${d} 天自律周期`);
                }}
                className={`py-2 rounded-xl text-[12px] font-bold tabular-nums border transition active:scale-95 ${
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
          <label className="block bg-slate-50 rounded-xl p-2.5 border border-slate-100">
            <span className="text-[10px] font-medium text-slate-400 block mb-1">开始日期</span>
            <input
              type="date"
              value={settings.cycleStartDate}
              onChange={(e) => {
                const start = e.target.value;
                if (start) {
                  onUpdateSettings({
                    cycleStartDate: start,
                    cycleEndDate: addDays(start, totalDays - 1)
                  });
                }
              }}
              className="w-full bg-transparent text-[13px] font-bold text-slate-800 tabular-nums focus:outline-none"
            />
          </label>
          <label className="block bg-slate-50 rounded-xl p-2.5 border border-slate-100">
            <span className="text-[10px] font-medium text-slate-400 block mb-1">自定义总天数</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="1"
                max="365"
                value={totalDays}
                onChange={(e) => updateCycleTotalDays(e.target.value)}
                className="w-full bg-transparent text-[14px] font-extrabold text-slate-900 tabular-nums focus:outline-none"
              />
              <span className="text-[11px] text-slate-400">天</span>
            </div>
          </label>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 rounded-xl px-3 py-2 tabular-nums">
          <span>自动推算结束日期</span>
          <span className="font-bold text-slate-800">{settings.cycleEndDate}</span>
        </div>
      </section>

      {/* Section 2: 个人目标配置 */}
      <section className="rounded-2xl bg-white border border-slate-100 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.025)] space-y-3">
        <h2 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-orange-500" />
          个人目标配置
        </h2>

        <div className="grid grid-cols-2 gap-2.5">
          <label className="block bg-orange-50/55 rounded-xl p-3 border border-orange-100">
            <span className="text-[11px] text-orange-600/85 font-medium block">每日目标热量 (kcal)</span>
            <input
              type="number"
              step="50"
              value={settings.dailyCalorieGoal}
              onChange={(e) => onUpdateSettings({ dailyCalorieGoal: parseInt(e.target.value, 10) || 0 })}
              className="w-full bg-transparent text-[17px] font-extrabold text-slate-900 tabular-nums mt-1 focus:outline-none"
            />
          </label>

          <label className="block bg-indigo-50/55 rounded-xl p-3 border border-indigo-100">
            <span className="text-[11px] text-indigo-600/85 font-medium block">目标体重 (kg)</span>
            <input
              type="number"
              step="0.1"
              value={settings.targetWeightKg}
              onChange={(e) => onUpdateSettings({ targetWeightKg: Number(e.target.value) || 0 })}
              className="w-full bg-transparent text-[17px] font-extrabold text-indigo-700 tabular-nums mt-1 focus:outline-none"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <label className="block bg-slate-50 rounded-xl p-3 border border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium block">当前参考体重 (kg)</span>
            <input
              type="number"
              step="0.1"
              value={settings.currentWeightKg}
              onChange={(e) => onUpdateSettings({ currentWeightKg: Number(e.target.value) || 0 })}
              className="w-full bg-transparent text-[17px] font-extrabold text-slate-900 tabular-nums mt-1 focus:outline-none"
            />
          </label>

          <label className="block bg-violet-50/55 rounded-xl p-3 border border-violet-100">
            <span className="text-[11px] text-violet-600/85 font-medium block">目标睡眠时长 (小时)</span>
            <input
              type="number"
              step="0.5"
              value={settings.dailySleepGoalHours}
              onChange={(e) => onUpdateSettings({ dailySleepGoalHours: parseFloat(e.target.value) || 7.5 })}
              className="w-full bg-transparent text-[17px] font-extrabold text-slate-900 tabular-nums mt-1 focus:outline-none"
            />
          </label>
        </div>

        <div className="bg-sky-50/65 rounded-xl p-3 border border-sky-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[11px] text-sky-600/85 font-medium block">每日建议饮水 (ml)</span>
            <input
              type="number"
              step="50"
              value={settings.dailyWaterGoalMl}
              onChange={(e) => onUpdateSettings({ dailyWaterGoalMl: parseInt(e.target.value, 10) || 0 })}
              className="w-28 bg-transparent text-[17px] font-extrabold text-slate-900 tabular-nums mt-0.5 focus:outline-none"
            />
          </div>
          <button
            onClick={recommendWater}
            className="px-3 py-2 rounded-xl bg-white border border-sky-200 text-sky-600 text-[11px] font-bold shadow-sm active:scale-95 transition shrink-0"
          >
            按体重自动推荐 (×33ml)
          </button>
        </div>
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
    </div>
  );
}
