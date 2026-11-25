import { addDays } from './dateAndCalc.js';

export function prepareWeightTrend(logs) {
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  // Sum the app's one-decimal measurements exactly while retaining extra precision from backups.
  const tenths = sorted.map(({ weightKg }) => Math.round(weightKg * 10));
  const remainder = sorted.map(({ weightKg }, index) => weightKg - tenths[index] / 10);
  let first = 0;
  let afterLast = 0;
  let totalTenths = 0;
  let totalRemainder = 0;

  return sorted.map((record) => {
    const windowStart = addDays(record.date, -6);
    while (afterLast < sorted.length && sorted[afterLast].date <= record.date) {
      totalTenths += tenths[afterLast];
      totalRemainder += remainder[afterLast];
      afterLast += 1;
    }
    while (first < afterLast && sorted[first].date < windowStart) {
      totalTenths -= tenths[first];
      totalRemainder -= remainder[first];
      first += 1;
    }

    const count = afterLast - first;
    const meanTenths = count ? (totalTenths + totalRemainder * 10) / count : record.weightKg * 10;
    return { ...record, averageKg: Math.round(meanTenths + Math.abs(meanTenths) * Number.EPSILON) / 10 };
  });
}
