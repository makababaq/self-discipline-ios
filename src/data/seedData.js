import { DEFAULT_AI_CONFIG } from '../utils/aiService.js';
import { DEFAULT_PROFILE } from '../utils/calorieCalc.js';
import { addDays, toLocalDateStr } from '../utils/dateAndCalc.js';
import { createTrainingPlan } from '../utils/trainingPlan.js';

export const DATA_VERSION = 5;

export function createAiCache() {
  return {
    dailyBrief: { date: '', fingerprint: '', text: '' },
    dailyQuote: { date: '', text: '' }
  };
}

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
    aiConfig: { ...DEFAULT_AI_CONFIG, apiKeysByProvider: { ...DEFAULT_AI_CONFIG.apiKeysByProvider } },
    aiCache: createAiCache(),
    customFoods: [],
    mealLogs: [],
    waterLogs: [],
    workoutLogs: [],
    sleepLogs: [],
    weightLogs: []
  };
}
