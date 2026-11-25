import { diffDays } from './dateAndCalc.js';

export const TRAINING_PARTS = ['胸', '腿', '肩膀', '背', '手臂', '休息'];

export function createTrainingPlan() {
  return {
    days: TRAINING_PARTS.map((part, index) => ({ id: `d${index + 1}`, parts: [part] })),
    offsetDays: 0
  };
}

function positiveModulo(value, count) {
  return ((value % count) + count) % count;
}

export function getTrainingSchedule(trainingPlan, cycleStartDate, todayStr) {
  const elapsed = diffDays(cycleStartDate, todayStr);
  if (elapsed < 0) return { index: -1, day: null, daysUntilStart: -elapsed, status: 'upcoming' };

  const { days, offsetDays } = trainingPlan;
  const index = positiveModulo(elapsed % days.length + offsetDays % days.length, days.length);
  const day = days[index];
  const status = day.parts.length === 1 && day.parts[0] === '休息' ? 'rest' : 'train';
  return { index, day, daysUntilStart: 0, status };
}

export function offsetForTrainingDay(trainingPlan, cycleStartDate, todayStr, targetIndex) {
  const elapsed = diffDays(cycleStartDate, todayStr);
  const count = trainingPlan.days.length;
  if (elapsed < 0 || !Number.isInteger(targetIndex) || targetIndex < 0 || targetIndex >= count) {
    return trainingPlan.offsetDays;
  }
  return targetIndex - (elapsed % count);
}
