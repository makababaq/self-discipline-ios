import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import { Share } from '@capacitor/share';
import { StatusBar, Style } from '@capacitor/status-bar';
import { createSeedData } from '../data/seedData.js';

export const STORAGE_KEY = 'discipline_ios_tracker_v2';

const isText = (value) => typeof value === 'string';
const isNumber = Number.isFinite;
const isDate = (value) => isText(value) && /^\d{4,}-\d{2}-\d{2}$/.test(value);
const isBoolean = (value) => typeof value === 'boolean';
const isTextList = (value) => Array.isArray(value) && value.every(isText);
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const settingsFields = {
  cycleName: isText,
  cycleStartDate: isDate,
  cycleTotalDays: isNumber,
  cycleEndDate: isDate,
  currentWeightKg: isNumber,
  targetWeightKg: isNumber,
  dailyCalorieGoal: isNumber,
  dailyWaterGoalMl: isNumber,
  dailySleepGoalHours: isNumber
};

const datedLogFields = { id: isText, date: isDate };
const macroFields = { protein: isNumber, carbs: isNumber, fat: isNumber };
const collectionFields = {
  customFoods: {
    id: isText, name: isText, category: isText, kcalPer100g: isNumber,
    unitName: isText, unitGrams: isNumber, keywords: isText, ...macroFields
  },
  mealLogs: {
    ...datedLogFields, mealType: isText, foodId: isText, name: isText, grams: isNumber,
    portionText: isText, calories: isNumber, time: isText, ...macroFields
  },
  waterLogs: { ...datedLogFields, ml: isNumber, time: isText, label: isText },
  workoutLogs: {
    ...datedLogFields, category: isText, presetKey: isText, name: isText, durationMin: isNumber,
    intensity: isText, met: isNumber, caloriesBurned: isNumber, time: isText
  },
  sleepLogs: {
    ...datedLogFields, bedtime: isText, wakeTime: isText, durationMin: isNumber,
    isNap: isBoolean, quality: isNumber, tags: isTextList
  },
  weightLogs: { ...datedLogFields, weightKg: isNumber, tag: isText, time: isText }
};

function hasFields(value, fields) {
  return isObject(value) && Object.entries(fields).every(([key, check]) => check(value[key]));
}

function parseBackup(raw) {
  const data = JSON.parse(raw.replace(/^\uFEFF/, ''));
  if (!isObject(data) || data.version !== 2 || !hasFields(data.settings, settingsFields)) {
    throw new Error('备份缺少有效的版本或设置');
  }

  for (const [key, fields] of Object.entries(collectionFields)) {
    if (!Array.isArray(data[key]) || !data[key].every((entry) => hasFields(entry, fields))) {
      throw new Error(`备份记录无效 (${key})`);
    }
  }

  return data;
}

// Serialize hydration and saves so late native callbacks cannot overwrite newer records.
let pendingPersistence = Promise.resolve();

function queuePersistence(action) {
  const operation = pendingPersistence.then(action);
  pendingPersistence = operation.catch(() => {});
  return operation;
}

async function writeRaw(value) {
  if (Capacitor.isNativePlatform()) {
    await Preferences.set({ key: STORAGE_KEY, value });
  } else {
    window.localStorage.setItem(STORAGE_KEY, value);
  }
}

export async function initNativeUI() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await StatusBar.setStyle({ style: Style.Light });
  } catch {
    // Status bar customization is optional on platforms that do not expose it.
  }
}

export async function triggerLightHaptic() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // Recording still works on devices without haptic feedback.
  }
}

export const storageService = {
  parseBackup,

  loadAsync() {
    return queuePersistence(async () => {
      if (Capacitor.isNativePlatform()) {
        const { value } = await Preferences.get({ key: STORAGE_KEY });
        if (value !== null) return parseBackup(value);

        // An earlier build may have saved to this app's WKWebView origin.
        let legacy = null;
        try {
          legacy = window.localStorage.getItem(STORAGE_KEY);
        } catch (error) {
          if (error?.name !== 'SecurityError') throw error;
        }
        if (legacy !== null) {
          const data = parseBackup(legacy);
          await writeRaw(legacy);
          return data;
        }
      } else {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw !== null) return parseBackup(raw);
      }

      const seed = createSeedData();
      await writeRaw(JSON.stringify(seed));
      return seed;
    });
  },

  async saveAsync(data) {
    const value = JSON.stringify(data);
    return queuePersistence(() => writeRaw(value));
  },

  async copyBackup(data) {
    const json = JSON.stringify(data, null, 2);
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(json);
        return;
      } catch {
        // Try selection-based copy when the context blocks async clipboard access.
      }
    }

    const previouslyFocused = document.activeElement;
    const field = document.createElement('textarea');
    field.value = json;
    field.readOnly = true;
    field.style.cssText = 'position: fixed; top: 0; left: 0; opacity: 0; pointer-events: none;';
    document.body.appendChild(field);

    try {
      field.focus({ preventScroll: true });
      field.select();
      field.setSelectionRange(0, json.length);
      if (!document.execCommand('copy')) throw new Error('无法复制 JSON 备份');
    } finally {
      field.remove();
      previouslyFocused?.focus({ preventScroll: true });
    }
  },

  async exportBackup(data, dateStr) {
    const fileName = `self-discipline-backup-${dateStr}.json`;
    const json = JSON.stringify(data, null, 2);
    if (Capacitor.isNativePlatform()) {
      const { uri } = await Filesystem.writeFile({
        path: fileName,
        data: json,
        directory: Directory.Cache,
        encoding: Encoding.UTF8
      });
      await Share.share({ title: '自律日记本地数据备份', files: [uri] });
      return 'shared';
    }

    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    try {
      document.body.appendChild(anchor);
      anchor.click();
    } finally {
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    return 'downloaded';
  }
};
