import { toLocalDateStr } from './dateAndCalc.js';

const normalizeName = (name) => (name ?? '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();

export function getRecentFoods(mealLogs = [], allFoods = [], todayStr = toLocalDateStr()) {
  const foodsById = new Map(allFoods.map((food) => [food.id, food]));
  const foodsByName = new Map();
  for (const food of allFoods) {
    const name = normalizeName(food.name);
    if (!foodsByName.has(name)) foodsByName.set(name, food);
  }

  // Logs are appended, so reverse insertion order breaks ties at the same minute.
  const chronological = mealLogs.filter((meal) => meal.date <= todayStr).reverse().sort((a, b) =>
    b.date.localeCompare(a.date) || b.time.localeCompare(a.time)
  );
  const recent = [];
  const seenIds = new Set();
  const seenNames = new Set();

  for (const log of chronological) {
    const food = foodsById.get(log.foodId) ?? foodsByName.get(normalizeName(log.name));
    if (!food) continue;
    const name = normalizeName(food.name);
    if (seenIds.has(food.id) || seenNames.has(name)) continue;

    recent.push(food);
    seenIds.add(food.id);
    seenNames.add(name);
    if (recent.length === 8) break;
  }

  return recent;
}
