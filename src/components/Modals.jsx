import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Minus, Search, X, Check } from 'lucide-react';
import { FOOD_CATEGORIES, BUILTIN_FOODS } from '../data/foodCatalog.js';
import { WORKOUT_PRESETS, INTENSITY_OPTIONS, MEAL_SECTIONS } from '../data/exercisePresets.js';
import { getCurrentTimeStr } from '../utils/dateAndCalc.js';
import { BottomSheet } from './CommonUI.jsx';

export function AddFoodBottomSheet({ open, mealType, selectedDate, allFoods, onClose, onAddMeal, onOpenCreateCustom }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('全部');
  const [selectedFood, setSelectedFood] = useState(null);

  // 计算器模式：'gram'（按克数） | 'portion'（按份量）
  const [calcMode, setCalcMode] = useState('portion');
  const [grams, setGrams] = useState(100);
  const [portionCount, setPortionCount] = useState(1);

  useEffect(() => {
    if (open) {
      setSearch('');
      setCategory('全部');
      setSelectedFood(null);
      setCalcMode('portion');
      setGrams(100);
      setPortionCount(1);
    }
  }, [open]);

  const mealLabel = MEAL_SECTIONS.find((m) => m.key === mealType)?.label || '饮食';

  // 模糊搜索（支持食物名 + 拼音/别名）与分类筛选
  const filteredFoods = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allFoods.filter((f) => {
      const matchCat =
        category === '全部'
          ? true
          : category === '自定义'
          ? Boolean(f.isCustom)
          : f.category === category;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        (f.keywords && f.keywords.toLowerCase().includes(q)) ||
        f.category.toLowerCase().includes(q)
      );
    });
  }, [allFoods, category, search]);

  const handleSelectFood = (food) => {
    setSelectedFood(food);
    if (food.unitName && food.unitGrams) {
      setCalcMode('portion');
      setPortionCount(1);
      setGrams(food.unitGrams);
    } else {
      setCalcMode('gram');
      setGrams(100);
      setPortionCount(1);
    }
  };

  // 计算实际克数与实时营养素
  const effectiveGrams = useMemo(() => {
    if (!selectedFood) return 0;
    if (calcMode === 'portion' && selectedFood.unitGrams) {
      return Math.round(selectedFood.unitGrams * portionCount);
    }
    return Math.max(0, Number(grams) || 0);
  }, [selectedFood, calcMode, portionCount, grams]);

  const liveKcal = selectedFood ? Math.round((selectedFood.kcalPer100g * effectiveGrams) / 100) : 0;
  const liveP = selectedFood ? Number((((selectedFood.protein || 0) * effectiveGrams) / 100).toFixed(1)) : 0;
  const liveC = selectedFood ? Number((((selectedFood.carbs || 0) * effectiveGrams) / 100).toFixed(1)) : 0;
  const liveF = selectedFood ? Number((((selectedFood.fat || 0) * effectiveGrams) / 100).toFixed(1)) : 0;

  const handleConfirmAdd = () => {
    if (!selectedFood || effectiveGrams <= 0) return;
    const portionText =
      calcMode === 'portion' && selectedFood.unitName
        ? `${portionCount}${selectedFood.unitName} (${effectiveGrams}g)`
        : `${effectiveGrams}g`;

    onAddMeal({
      date: selectedDate,
      mealType,
      foodId: selectedFood.id,
      name: selectedFood.name,
      grams: effectiveGrams,
      portionText,
      calories: liveKcal,
      protein: liveP,
      carbs: liveC,
      fat: liveF,
      time: getCurrentTimeStr()
    });
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={`添加${mealLabel}食物`}
      subtitle={`内置 ${BUILTIN_FOODS.length} 种常见食物 · 支持拼音/别名搜索`}
      bodyClassName="p-0 flex flex-col"
    >
      {/* 顶部搜索栏 + 横向分类筛选 Chips */}
      <div className="px-4 pt-3 pb-2.5 border-b border-slate-100 space-y-2.5 shrink-0 bg-white">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜食物或拼音，如 鸡胸、mifan、拿铁..."
              className="w-full bg-transparent text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 p-0.5">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={onOpenCreateCustom}
            className="px-2.5 py-2 rounded-xl bg-orange-50 text-orange-600 text-[11px] font-bold shrink-0 active:scale-95 transition"
          >
            + 自定义
          </button>
        </div>

        {/* 横向滚动 11 个分类胶囊 */}
        <div className="flex gap-1.5 overflow-x-auto overscroll-none no-scrollbar pb-0.5">
          {FOOD_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition shrink-0 ${
                category === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 中间可滚动食物列表 */}
      <div className="flex-1 overflow-y-auto overscroll-none no-scrollbar px-4 divide-y divide-slate-100 min-h-[150px]">
        {filteredFoods.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <p className="text-xs text-slate-400">没有找到「{search}」相关食物</p>
            <button
              onClick={onOpenCreateCustom}
              className="text-xs font-bold text-orange-600 bg-orange-50 px-3.5 py-1.5 rounded-full"
            >
              + 去添加自定义食物
            </button>
          </div>
        ) : (
          filteredFoods.map((food) => {
            const isSelected = selectedFood?.id === food.id;
            return (
              <button
                key={food.id}
                onClick={() => handleSelectFood(food)}
                className={`w-full flex items-center justify-between py-2.5 px-2 -mx-2 rounded-xl text-left transition ${
                  isSelected ? 'bg-orange-50/90' : 'hover:bg-slate-50'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-[13px] font-bold truncate ${isSelected ? 'text-orange-700' : 'text-slate-800'}`}>
                      {food.name}
                    </p>
                    {food.isCustom && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 shrink-0">
                        自定义
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 tabular-nums mt-0.5">
                    <span className="font-semibold text-slate-600">{food.kcalPer100g}</span> kcal/100g
                    {food.unitName ? ` · 1${food.unitName}≈${food.unitGrams}g` : ''}
                    <span className="ml-1.5 text-[10px] text-slate-400">
                      蛋{food.protein} 碳{food.carbs} 脂{food.fat}
                    </span>
                  </p>
                </div>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition ${
                    isSelected ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isSelected ? <Check className="w-3.5 h-3.5 stroke-[2.6]" /> : <Plus className="w-3.5 h-3.5" />}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* 底部常驻双模式换算面板（选中任意食物后立即呼出） */}
      {selectedFood && (
        <div className="shrink-0 bg-white border-t border-slate-200/90 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] px-4 pt-3 pb-5 space-y-3 animate-slideUp">
          {/* 食物名称 + 实时热量 + 三大营养素 */}
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-[14px] font-extrabold text-slate-900 truncate">{selectedFood.name}</h4>
                <span className="text-[11px] font-semibold text-slate-400 tabular-nums shrink-0">
                  ({effectiveGrams}g)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 tabular-nums mt-0.5">
                蛋白质 <b className="text-slate-700">{liveP}g</b> · 碳水 <b className="text-slate-700">{liveC}g</b> ·
                脂肪 <b className="text-slate-700">{liveF}g</b>
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[24px] font-extrabold text-orange-600 tabular-nums leading-none">{liveKcal}</span>
              <span className="text-[11px] font-semibold text-orange-500 ml-0.5">kcal</span>
            </div>
          </div>

          {/* 切换开关：按克数 (g) / 按份量 */}
          <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => {
                setCalcMode('gram');
                setGrams(effectiveGrams || 100);
              }}
              className={`py-1.5 rounded-lg text-[11px] font-bold transition ${
                calcMode === 'gram' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              按克数 (g)
            </button>
            <button
              onClick={() => {
                if (selectedFood.unitName && selectedFood.unitGrams) {
                  setCalcMode('portion');
                }
              }}
              disabled={!selectedFood.unitName || !selectedFood.unitGrams}
              className={`py-1.5 rounded-lg text-[11px] font-bold transition disabled:opacity-40 ${
                calcMode === 'portion' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              按份量 ({selectedFood.unitName || '份'})
            </button>
          </div>

          {/* 模式 A：按克数 (g) */}
          {calcMode === 'gram' ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={grams}
                    onChange={(e) => setGrams(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full bg-transparent text-[16px] font-extrabold text-slate-900 tabular-nums focus:outline-none"
                  />
                  <span className="text-xs font-bold text-slate-400">g</span>
                </div>
                {[50, 100, 150, 200].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGrams(g)}
                    className={`px-2.5 py-2.5 rounded-xl text-[11px] font-bold tabular-nums border transition ${
                      grams === g
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {g}g
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* 模式 B：按份量 (个/碗/杯/片) */
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                {/* 步进器 */}
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1.5">
                  <button
                    onClick={() => setPortionCount((c) => Math.max(0.5, Number((c - 0.5).toFixed(1))))}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 active:scale-90 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="min-w-[54px] text-center text-[13px] font-extrabold text-slate-900 tabular-nums">
                    {portionCount} {selectedFood.unitName}
                  </span>
                  <button
                    onClick={() => setPortionCount((c) => Math.min(20, Number((c + 0.5).toFixed(1))))}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 active:scale-90 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 快捷份量按钮 0.5 / 1 / 1.5 / 2 */}
                <div className="flex gap-1.5">
                  {[0.5, 1, 1.5, 2].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPortionCount(p)}
                      className={`px-2.5 py-2 rounded-xl text-[11px] font-bold tabular-nums border transition ${
                        portionCount === p
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleConfirmAdd}
            disabled={effectiveGrams <= 0}
            className="w-full py-3 rounded-xl bg-slate-900 disabled:bg-slate-300 text-white text-[13px] font-bold shadow-sm active:scale-[0.98] transition"
          >
            加入{mealLabel}记录 · {liveKcal} kcal
          </button>
        </div>
      )}
    </BottomSheet>
  );
}

export function AddWorkoutBottomSheet({ open, initialType, selectedDate, currentWeightKg, onClose, onAddWorkout }) {
  const [category, setCategory] = useState(initialType);
  const [selectedPreset, setSelectedPreset] = useState(WORKOUT_PRESETS.cardio[0]);
  const [intensity, setIntensity] = useState('medium');
  const [durationMin, setDurationMin] = useState(30);
  const [manualKcal, setManualKcal] = useState('');

  useEffect(() => {
    if (open) {
      setCategory(initialType);
      setSelectedPreset(WORKOUT_PRESETS[initialType][0]);
      setIntensity('medium');
      setDurationMin(30);
      setManualKcal('');
    }
  }, [open, initialType]);

  const presets = WORKOUT_PRESETS[category] || WORKOUT_PRESETS.cardio;
  const activeMet = selectedPreset.met[intensity] ?? selectedPreset.met.medium;
  const weight = currentWeightKg > 0 ? currentWeightKg : 60;
  const autoKcal = Math.round((activeMet * weight * durationMin) / 60);
  const finalKcal = manualKcal !== '' ? Math.max(0, parseInt(manualKcal, 10) || 0) : autoKcal;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={category === 'cardio' ? '记录有氧训练' : '记录无氧训练'}
      subtitle={`按当前体重 ${weight.toFixed(1)}kg 与 ACSM MET 公式实时计算`}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl">
          {[
            { id: 'cardio', label: '有氧训练 (11)' },
            { id: 'anaerobic', label: '无氧训练 (7)' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setCategory(t.id);
                setSelectedPreset(WORKOUT_PRESETS[t.id][0]);
                setManualKcal('');
              }}
              className={`py-2 rounded-lg text-xs font-bold transition ${
                category === t.id ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 运动项目选择网格 */}
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto overscroll-none no-scrollbar pr-0.5">
          {presets.map((p) => {
            const active = selectedPreset.key === p.key;
            return (
              <button
                key={p.key}
                onClick={() => {
                  setSelectedPreset(p);
                  setManualKcal('');
                }}
                className={`p-2.5 rounded-xl text-left border transition ${
                  active
                    ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-400/25'
                    : 'bg-slate-50/70 border-slate-100 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[12px] font-bold text-slate-900 truncate">{p.name}</span>
                  <span className="text-[10px] font-bold text-emerald-600 tabular-nums shrink-0">
                    {p.met[intensity]}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{p.desc}</p>
              </button>
            );
          })}
        </div>

        {/* 低 / 中 / 高 强度 */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">运动强度 (对应 MET 值)</span>
          <div className="grid grid-cols-3 gap-2">
            {INTENSITY_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => {
                  setIntensity(opt.key);
                  setManualKcal('');
                }}
                className={`py-2 rounded-xl text-xs font-bold border transition tabular-nums ${
                  intensity === opt.key
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                {opt.short} · MET {selectedPreset.met[opt.key]}
              </button>
            ))}
          </div>
        </div>

        {/* 时长调节 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">运动时长（分钟）</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                inputMode="numeric"
                value={durationMin}
                onChange={(e) => {
                  setDurationMin(Math.max(1, parseInt(e.target.value, 10) || 0));
                  setManualKcal('');
                }}
                className="w-16 text-right bg-slate-100 rounded-lg px-2 py-1 text-sm font-extrabold text-slate-900 tabular-nums focus:outline-none"
              />
              <span className="text-xs text-slate-500">min</span>
            </div>
          </div>
          <input
            type="range"
            min="5"
            max="120"
            step="5"
            value={Math.min(120, durationMin)}
            onChange={(e) => {
              setDurationMin(Number(e.target.value));
              setManualKcal('');
            }}
            className="w-full accent-emerald-500"
          />
          <div className="grid grid-cols-4 gap-2">
            {[15, 30, 45, 60].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setDurationMin(m);
                  setManualKcal('');
                }}
                className={`py-1.5 rounded-xl text-xs font-semibold tabular-nums border ${
                  durationMin === m
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                {m} min
              </button>
            ))}
          </div>
        </div>

        {/* 消耗结果 + 手表同步手动覆盖 */}
        <div className="rounded-xl bg-emerald-50/75 border border-emerald-100 p-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-emerald-800">预估消耗（可手动覆盖同步手表）</p>
            <p className="text-[10px] text-emerald-600/80 tabular-nums mt-0.5">
              MET {activeMet} × {weight.toFixed(1)}kg × {durationMin}/60h = {autoKcal} kcal
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <input
              type="number"
              inputMode="numeric"
              value={manualKcal === '' ? autoKcal : manualKcal}
              onChange={(e) => setManualKcal(e.target.value)}
              className="w-20 text-right bg-white border border-emerald-200 rounded-xl px-2 py-1 text-[16px] font-extrabold text-emerald-700 tabular-nums focus:outline-none"
            />
            <span className="text-[11px] font-semibold text-emerald-600">kcal</span>
          </div>
        </div>

        <button
          onClick={() =>
            onAddWorkout({
              date: selectedDate,
              category,
              presetKey: selectedPreset.key,
              name: selectedPreset.name,
              durationMin,
              intensity,
              met: activeMet,
              caloriesBurned: finalKcal,
              time: getCurrentTimeStr()
            })
          }
          className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[14px] font-bold shadow-sm shadow-emerald-200 active:scale-[0.98] transition"
        >
          保存训练 (-{finalKcal} kcal)
        </button>
      </div>
    </BottomSheet>
  );
}

export function CustomFoodBottomSheet({ open, onClose, onSave }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('轻食外食');
  const [kcal, setKcal] = useState('');
  const [unitName, setUnitName] = useState('份');
  const [unitGrams, setUnitGrams] = useState('100');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  useEffect(() => {
    if (open) {
      setName('');
      setCategory('轻食外食');
      setKcal('');
      setUnitName('份');
      setUnitGrams('100');
      setProtein('');
      setCarbs('');
      setFat('');
    }
  }, [open]);

  const selectableCategories = FOOD_CATEGORIES.filter((c) => c !== '全部' && c !== '自定义');

  return (
    <BottomSheet open={open} onClose={onClose} title="新增自定义食物" subtitle="保存后可在「自定义」分类和搜索中立即使用">
      <div className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="食物名称（必填，如：老乡鸡葱油鸡）"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-slate-900"
        />

        <div className="grid grid-cols-2 gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            {selectableCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="number"
            inputMode="numeric"
            value={kcal}
            onChange={(e) => setKcal(e.target.value)}
            placeholder="热量 kcal/100g *"
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold tabular-nums focus:outline-none focus:border-slate-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={unitName}
            onChange={(e) => setUnitName(e.target.value)}
            placeholder="默认份量单位（如 碗/个）"
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none"
          />
          <input
            type="number"
            inputMode="numeric"
            value={unitGrams}
            onChange={(e) => setUnitGrams(e.target.value)}
            placeholder="每份约克数 (g)"
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs tabular-nums focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            placeholder="蛋白 g (选填)"
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs tabular-nums focus:outline-none"
          />
          <input
            type="number"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            placeholder="碳水 g (选填)"
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs tabular-nums focus:outline-none"
          />
          <input
            type="number"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            placeholder="脂肪 g (选填)"
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs tabular-nums focus:outline-none"
          />
        </div>

        <button
          onClick={() => {
            if (!name.trim() || !kcal) return;
            onSave({
              name: name.trim(),
              category,
              kcalPer100g: Math.max(0, Number(kcal)),
              unitName: unitName.trim() || '份',
              unitGrams: Math.max(1, Number(unitGrams) || 100),
              protein: Number(protein) || 0,
              carbs: Number(carbs) || 0,
              fat: Number(fat) || 0,
              keywords: name.trim().toLowerCase()
            });
          }}
          disabled={!name.trim() || !kcal}
          className="w-full py-3 rounded-xl bg-slate-900 disabled:bg-slate-300 text-white text-sm font-bold active:scale-[0.98] transition"
        >
          保存到自定义食物库
        </button>
      </div>
    </BottomSheet>
  );
}

export function ImportJsonSheet({ open, onClose, onImport }) {
  const [text, setText] = useState('');
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') setText(ev.target.result);
    };
    reader.readAsText(file);
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="导入 JSON 恢复数据" subtitle="支持上传备份文件或直接粘贴 JSON 文本">
      <div className="space-y-3">
        <input ref={fileRef} type="file" accept=".json,application/json" onChange={handleFileChange} className="hidden" />
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full py-3 rounded-xl border border-dashed border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
        >
          选择本地 .json 备份文件
        </button>
        <textarea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="或在此粘贴导出的 JSON 数据..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-slate-900"
        />
        <button
          onClick={() => onImport(text)}
          disabled={!text.trim()}
          className="w-full py-3 rounded-xl bg-slate-900 disabled:bg-slate-300 text-white text-sm font-bold active:scale-[0.98] transition"
        >
          确认恢复数据
        </button>
      </div>
    </BottomSheet>
  );
}
