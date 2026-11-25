import { addDays, diffDays } from './dateAndCalc.js';
import { getTrainingSchedule } from './trainingPlan.js';

const emptyDay = { hasMeal: false, intake: 0, water: 0, burned: 0, hasWorkout: false };

function getDailyTotals({ mealLogs, waterLogs, workoutLogs }) {
  const totalsByDate = new Map();
  const totalsFor = (date) => {
    if (!totalsByDate.has(date)) totalsByDate.set(date, { ...emptyDay });
    return totalsByDate.get(date);
  };

  for (const { date, calories } of mealLogs) {
    const totals = totalsFor(date);
    totals.hasMeal = true;
    totals.intake += calories;
  }
  for (const { date, ml } of waterLogs) totalsFor(date).water += ml;
  for (const { date, caloriesBurned } of workoutLogs) {
    const totals = totalsFor(date);
    totals.hasWorkout = true;
    totals.burned += caloriesBurned;
  }
  return totalsByDate;
}

export function getDisciplineProgress(data, targets, todayStr) {
  const { settings: { cycleStartDate, cycleEndDate }, trainingPlan } = data;
  const totalDays = diffDays(cycleStartDate, cycleEndDate) + 1;
  const todayOffset = diffDays(cycleStartDate, todayStr);
  const totalsByDate = getDailyTotals(data);
  let eligibleDays = 0;
  let completedDays = 0;
  let streak = 0;

  const days = Array.from({ length: totalDays }, (_, index) => {
    const date = addDays(cycleStartDate, index);
    if (index > todayOffset) return { date, isToday: false, isFuture: true, completedCount: null };

    const totals = totalsByDate.get(date) ?? emptyDay;
    const netCalories = totals.intake - totals.burned;
    const nutritionMet = totals.hasMeal && (targets.goalMode === 'surplus'
      ? netCalories >= targets.targetCalories - 150
      : netCalories <= targets.targetCalories + 100);
    const hydrationMet = totals.water >= targets.recommendedWater * 0.85;
    const restDay = getTrainingSchedule(trainingPlan, cycleStartDate, date).status === 'rest';
    const trainingMet = restDay || totals.hasWorkout;
    const completedCount = Number(nutritionMet) + Number(hydrationMet) + Number(trainingMet);
    const full = completedCount === 3;

    eligibleDays += 1;
    completedDays += Number(full);
    streak = full ? streak + 1 : 0;

    return { date, isToday: index === todayOffset, isFuture: false, nutritionMet, hydrationMet, trainingMet, restDay, completedCount };
  });

  return { days, eligibleDays, completedDays, rate: eligibleDays ? Math.round(completedDays / eligibleDays * 100) : 0, streak };
}
