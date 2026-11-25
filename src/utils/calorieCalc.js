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
  const preset = Object.prototype.hasOwnProperty.call(GOAL_PRESETS, goalType)
    ? GOAL_PRESETS[goalType]
    : GOAL_PRESETS.lose_std;
  const rawTarget = baselineTdee + preset.delta;
  const minSafe = Math.max(bmr, gender === 'male' ? 1500 : 1200);
  const isFloored = rawTarget < minSafe;
  const clamped = Math.max(rawTarget, minSafe);
  const targetCalories = (isFloored ? Math.ceil(clamped / 50) : Math.round(clamped / 50)) * 50;
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
    recommendedWater
  };
}
