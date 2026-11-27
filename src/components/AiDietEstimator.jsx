import { useRef, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { MEAL_SECTIONS } from '../data/exercisePresets.js';
import { estimateFoodCalories } from '../utils/aiService.js';
import { haptic } from '../utils/haptics.js';
import { numberOptions } from '../utils/wheelOptions.js';
import { WheelPickerSheet } from './WheelPickerSheet.jsx';

const gramOptions = [{ value: 1, label: '1 g' }, ...numberOptions(5, 2000, (value) => `${value} g`, 5)];
const calorieOptions = numberOptions(0, 3000, (value) => `${value} kcal`, 10);

function defaultMealType() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 15) return 'lunch';
  if (hour >= 17 && hour < 22) return 'dinner';
  return 'snack';
}

function optionsForAmount(field, currentValue) {
  const isGrams = field === 'grams';
  const options = isGrams ? gramOptions : calorieOptions;
  if (options.some(({ value }) => value === currentValue)) return options;
  return [...options, { value: currentValue, label: `${currentValue} ${isGrams ? 'g' : 'kcal'}` }]
    .sort((first, second) => first.value - second.value);
}

function resizeEstimate(item, grams) {
  if (grams === item.grams) return item;
  const scale = grams / item.grams;
  const macro = (value) => Math.round(value * scale * 10) / 10;
  return {
    ...item,
    grams,
    calories: Math.round(item.calories * scale),
    protein: macro(item.protein),
    carbs: macro(item.carbs),
    fat: macro(item.fat)
  };
}

function EstimateReview({ initialItems, onClose, onSave }) {
  const [items, setItems] = useState(initialItems);
  const [mealType, setMealType] = useState(defaultMealType);
  const [picker, setPicker] = useState(null);
  const editedItem = picker && items.find(({ tempId }) => tempId === picker.id);
  const isGrams = picker?.field === 'grams';
  const totalCalories = items.reduce((total, item) => total + item.calories, 0);
  const mealLabel = MEAL_SECTIONS.find(({ key }) => key === mealType).label;

  function applyAmount({ value }) {
    setItems((previous) => previous.map((item) => {
      if (item.tempId !== picker.id) return item;
      return isGrams ? resizeEstimate(item, value) : { ...item, calories: value };
    }));
    setPicker(null);
  }

  function saveItems() {
    if (!items.length) return;
    onSave(mealType, items.map(({ name, grams, calories, protein, carbs, fat }) => ({
      name, grams, calories, protein, carbs, fat
    })));
  }

  return (
    <>
      <section
        aria-label="AI 饮食估算结果"
        aria-hidden={editedItem ? true : undefined}
        inert={editedItem ? '' : undefined}
        className="space-y-3 rounded-2xl border border-indigo-100 bg-white px-3.5 py-3 shadow-[0_3px_14px_rgba(15,23,42,0.03)]"
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[13px] font-bold text-slate-900">核对估算结果</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭估算结果"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition active:scale-95"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-3">
          {items.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-3 text-center text-xs text-slate-500">没有待添加的食物</p>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.tempId} className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="min-w-0 break-words text-sm font-bold text-slate-900">{item.name}</p>
                    <button
                      type="button"
                      aria-label={`移除 ${item.name}`}
                      onClick={() => setItems((previous) => previous.filter(({ tempId }) => tempId !== item.tempId))}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 transition active:scale-95"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 tabular-nums">
                    <button
                      type="button"
                      aria-haspopup="dialog"
                      aria-label={`调整 ${item.name} 克数，当前 ${item.grams} 克`}
                      onClick={() => setPicker({ id: item.tempId, field: 'grams' })}
                      className="rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition active:scale-95"
                    >
                      {item.grams} g
                    </button>
                    <button
                      type="button"
                      aria-haspopup="dialog"
                      aria-label={`调整 ${item.name} 热量，当前 ${item.calories} 千卡`}
                      onClick={() => setPicker({ id: item.tempId, field: 'calories' })}
                      className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1.5 text-xs font-semibold text-orange-700 transition active:scale-95"
                    >
                      {item.calories} kcal
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 tabular-nums">蛋白质 {item.protein} g · 碳水 {item.carbs} g · 脂肪 {item.fat} g</p>
                </li>
              ))}
            </ul>
          )}

          <fieldset>
            <legend className="mb-2 text-xs font-semibold text-slate-600">记入今天的餐次</legend>
            <div className="grid grid-cols-4 gap-1.5">
              {MEAL_SECTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={mealType === key}
                  onClick={() => {
                    if (mealType === key) return;
                    setMealType(key);
                    void haptic.tap();
                  }}
                  className={`rounded-full border px-2 py-1.5 text-xs font-semibold transition active:scale-95 ${
                    mealType === key ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <button
            type="button"
            disabled={!items.length}
            onClick={saveItems}
            className="w-full rounded-xl bg-slate-900 px-3 py-3 text-sm font-bold text-white shadow-sm transition active:scale-[0.98] disabled:opacity-40"
          >
            一键记入 · 今日{mealLabel} · {totalCalories} kcal
          </button>
        </div>
      </section>

      {editedItem && (
        <WheelPickerSheet
          open
          title={isGrams ? '调整克数' : '调整热量'}
          initialValues={{ value: editedItem[picker.field] }}
          columns={[{
            id: 'value',
            label: isGrams ? '克数' : '热量',
            options: optionsForAmount(picker.field, editedItem[picker.field])
          }]}
          onClose={() => setPicker(null)}
          onConfirm={applyAmount}
        />
      )}
    </>
  );
}

export function AiDietEstimator({ aiConfig, onAddEstimatedMeals }) {
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reviewItems, setReviewItems] = useState(null);
  const inputRef = useRef(null);
  const estimating = useRef(false);

  async function estimate(event) {
    event.preventDefault();
    const food = description.trim();
    if (!food || estimating.current) return;
    inputRef.current?.blur();
    estimating.current = true;
    setBusy(true);
    setError('');
    setReviewItems(null);
    try {
      const results = await estimateFoodCalories(aiConfig, food);
      setReviewItems(results.map(({ kcal, ...item }) => ({ ...item, calories: kcal })));
    } catch (failure) {
      let message = failure instanceof Error ? failure.message : '估算失败，请重试';
      const key = aiConfig.apiKey.trim();
      if (key) message = message.split(key).join('••••');
      setError(message);
    } finally {
      estimating.current = false;
      setBusy(false);
    }
  }

  function save(mealType, items) {
    onAddEstimatedMeals(mealType, items);
    setReviewItems(null);
    setDescription('');
  }

  return (
    <div className="grid gap-2">
      <form onSubmit={estimate} className="space-y-2 rounded-2xl border border-indigo-100 bg-white px-3.5 py-3 shadow-[0_3px_14px_rgba(15,23,42,0.03)]">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 text-indigo-500" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            aria-label="AI 饮食估算"
            placeholder="AI 估算：如 牛肉面一碗加卤蛋"
            enterKeyHint="go"
            value={description}
            disabled={busy}
            onChange={(event) => {
              setDescription(event.target.value);
              if (error) setError('');
            }}
            className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-base text-slate-900 placeholder:text-sm placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !description.trim()}
            className="shrink-0 rounded-xl bg-indigo-600 px-2.5 py-2 text-xs font-semibold text-white transition active:scale-95 disabled:opacity-40"
          >
            {busy ? '估算中…' : '估算'}
          </button>
        </div>
        {error && <p role="alert" className="break-words text-xs text-rose-600">{error}</p>}
      </form>
      {reviewItems && <EstimateReview initialItems={reviewItems} onClose={() => setReviewItems(null)} onSave={save} />}
    </div>
  );
}
