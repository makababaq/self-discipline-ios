import { DEFAULT_PROFILE } from '../utils/calorieCalc.js';
import { addDays, toLocalDateStr } from '../utils/dateAndCalc.js';
import { createTrainingPlan } from '../utils/trainingPlan.js';

export const DATA_VERSION = 4;

export function createSeedData() {
  const cycleStartDate = toLocalDateStr();
  const cycleTotalDays = 60;

  return {
    version: DATA_VERSION,
    settings: {
      cycleName: '60天自律蜕变期',
      cycleStartDate,
      cycleTotalDays,
      cycleEndDate: addDays(cycleStartDate, cycleTotalDays - 1),
      profile: { ...DEFAULT_PROFILE },
      targetWeightKg: 58.5,
      dailySleepGoalHours: 7.5
    },
    trainingPlan: createTrainingPlan(),
    customFoods: [],
    mealLogs: [],
    waterLogs: [],
    workoutLogs: [],
    sleepLogs: [],
    weightLogs: []
  };
}
