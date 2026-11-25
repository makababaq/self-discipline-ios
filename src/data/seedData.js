import { addDays, toLocalDateStr } from '../utils/dateAndCalc.js';

export function createSeedData() {
  const cycleStartDate = toLocalDateStr();
  const cycleTotalDays = 60;

  return {
    version: 2,
    settings: {
      cycleName: '60天自律蜕变期',
      cycleStartDate,
      cycleTotalDays,
      cycleEndDate: addDays(cycleStartDate, cycleTotalDays - 1),
      currentWeightKg: 61.8,
      targetWeightKg: 58.5,
      dailyCalorieGoal: 1600,
      dailyWaterGoalMl: 2050,
      dailySleepGoalHours: 7.5
    },
    customFoods: [],
    mealLogs: [],
    waterLogs: [],
    workoutLogs: [],
    sleepLogs: [],
    weightLogs: []
  };
}
