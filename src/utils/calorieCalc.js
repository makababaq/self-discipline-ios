export const DEFAULT_PROFILE = {
  gender: 'male',
  height: 175,
  age: 22,
  referenceWeight: 70,
  activityLevel: 1.2,
  goalType: 'lose_std'
};

export const GOAL_PRESETS = {
  lose_mild: { label: '温和减脂', delta: -300, mode: 'deficit' },
  lose_std: { label: '标准减脂', delta: -500, mode: 'deficit' },
  maintain: { label: '维持体重', delta: 0, mode: 'maintain' },
  gain_mild: { label: '温和增肌', delta: 250, mode: 'surplus' }
};

const MACRO_RULES = {
  lose_mild: { proteinPerKg: 1.6, fatRatio: 0.25 },
  lose_std: { proteinPerKg: 1.8, fatRatio: 0.25 },
  maintain: { proteinPerKg: 1.3, fatRatio: 0.28 },
  gain_mild: { proteinPerKg: 1.8, fatRatio: 0.25 }
};

export function calculateAutoTargets(profile = {}) {
  const {
    gender = DEFAULT_PROFILE.gender,
    height = DEFAULT_PROFILE.height,
    age = DEFAULT_PROFILE.age,
    currentWeight = DEFAULT_PROFILE.referenceWeight,
    activityLevel = DEFAULT_PROFILE.activityLevel,
    goalType = DEFAULT_PROFILE.goalType
  } = profile;

  const bmr = Math.round(10 * currentWeight + 6.25 * height - 5 * age + (gender === 'male' ? 5 : -161));
  const baselineTdee = Math.round(bmr * activityLevel);
  const goal = Object.prototype.hasOwnProperty.call(GOAL_PRESETS, goalType) ? goalType : DEFAULT_PROFILE.goalType;
  const preset = GOAL_PRESETS[goal];
  const rawTarget = baselineTdee + preset.delta;
  const minSafe = Math.max(bmr, gender === 'male' ? 1500 : 1200);
  const isFloored = rawTarget < minSafe;
  const clamped = Math.max(rawTarget, minSafe);
  const targetCalories = (isFloored ? Math.ceil(clamped / 50) : Math.round(clamped / 50)) * 50;
  const { proteinPerKg, fatRatio } = MACRO_RULES[goal];
  const targetProtein = Math.round(Math.min(
    Math.max(currentWeight * proteinPerKg, (targetCalories * 0.15) / 4),
    (targetCalories * 0.35) / 4
  ));
  const targetFat = Math.round(Math.min(
    Math.max((targetCalories * fatRatio) / 9, Math.max(35, currentWeight * 0.6)),
    (targetCalories * 0.32) / 9
  ));
  const targetCarbs = Math.round(Math.max(0, targetCalories - targetProtein * 4 - targetFat * 9) / 4);
  const targetDeficit = baselineTdee - targetCalories;
  const recommendedWater = Math.round((currentWeight * 33) / 50) * 50;

  return {
    bmr,
    baselineTdee,
    targetCalories,
    targetDeficit,
    goalLabel: preset.label,
    goalMode: preset.mode,
    isFloored,
    recommendedWater,
    macros: { protein: targetProtein, carbs: targetCarbs, fat: targetFat }
  };
}
